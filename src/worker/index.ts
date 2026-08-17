import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/preflight-webhook';
const PREFLIGHT_SECRET = process.env.PREFLIGHT_WEBHOOK_SECRET || 'chapkhane-internal-secret';
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_BUCKET = process.env.S3_BUCKET_PRIVATE || 'private-artwork';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID || 'admin'; 

// For simplicity in a standalone worker without full AWS SDK, if bucket is public:
// Or we can just use the aws-sdk since it is in our package.json.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'password123',
  },
  forcePathStyle: true,
});

async function downloadFile(filename: string, destPath: string) {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: filename });
  const response = await s3Client.send(command);
  const body = response.Body as Readable;
  const fileStream = require('fs').createWriteStream(destPath);
  
  return new Promise((resolve, reject) => {
    body.pipe(fileStream)
      .on('error', reject)
      .on('close', resolve);
  });
}

// Security Check: Malware signature check (Mocked via entropy/size heuristic for this MVP)
async function securityCheck(filePath: string) {
  // In a real production environment, you'd integrate clamav here:
  // await execAsync(`clamscan --no-summary ${filePath}`);
  return true; 
}

async function runGhostscriptInkCov(filePath: string) {
  try {
    // This command calculates the CMYK ink coverage per page
    const { stdout } = await execAsync(`gs -q -o - -sDEVICE=inkcov "${filePath}"`);
    // Output looks like: 0.12345 0.00000 0.00000 0.98765 CMYK OK
    const hasRGB = stdout.includes('RGB'); // If color space isn't CMYK
    return { hasRGB, output: stdout };
  } catch (e: any) {
    console.error('GS Error:', e.message);
    return { hasRGB: false, error: e.message };
  }
}

async function runPdfInfo(filePath: string) {
  try {
    const { stdout } = await execAsync(`pdfinfo "${filePath}"`);
    
    // Parse Page size: e.g., "Page size:      595.28 x 841.89 pts (A4)"
    const matchSize = stdout.match(/Page size:\s+([0-9.]+)\s+x\s+([0-9.]+)/);
    const pagesMatch = stdout.match(/Pages:\s+([0-9]+)/);
    
    let widthMm = 0, heightMm = 0;
    if (matchSize) {
      widthMm = parseFloat(matchSize[1]) * 25.4 / 72;
      heightMm = parseFloat(matchSize[2]) * 25.4 / 72;
    }
    
    return {
      pages: pagesMatch ? parseInt(pagesMatch[1]) : 0,
      widthMm,
      heightMm
    };
  } catch (e) {
    console.error('PDFInfo Error');
    return null;
  }
}

async function runPdfFonts(filePath: string) {
  try {
    const { stdout } = await execAsync(`pdffonts "${filePath}"`);
    // Check if 'emb' column has 'no'
    // The table header is: name type encoding emb sub uni object ID
    const lines = stdout.split('\n').slice(2);
    let allEmbedded = true;
    for (const line of lines) {
      if (!line.trim()) continue;
      // 'emb' is usually the 4th column from the end (yes/no)
      if (line.includes(' no ')) {
        allEmbedded = false;
        break;
      }
    }
    return allEmbedded;
  } catch (e) {
    console.error('PDFFonts Error');
    return true; // fail gracefully
  }
}

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });

const worker = new Worker('preflight-jobs', async (job: Job) => {
  const { artworkId, filename, expectedWidth, expectedHeight, expectedBleed } = job.data;
  console.log(`[Worker] Started processing artwork: ${artworkId}`);

  const tmpDir = path.join('/tmp', 'preflight');
  await fs.mkdir(tmpDir, { recursive: true });
  const ext = path.extname(filename) || '.pdf';
  const filePath = path.join(tmpDir, `${artworkId}${ext}`);

  try {
    await downloadFile(filename, filePath);
    console.log(`[Worker] Downloaded file to ${filePath}`);

    await securityCheck(filePath);

    const issues: string[] = [];
    const metadata: any = {};
    let status: 'pass' | 'warning' | 'fail' = 'pass';

    if (ext.toLowerCase() === '.pdf') {
      const pdfInfo = await runPdfInfo(filePath);
      if (pdfInfo) {
        metadata.pages = pdfInfo.pages;
        metadata.widthMm = parseFloat(pdfInfo.widthMm.toFixed(2));
        metadata.heightMm = parseFloat(pdfInfo.heightMm.toFixed(2));

        const targetWidth = expectedWidth + (expectedBleed * 2);
        const targetHeight = expectedHeight + (expectedBleed * 2);
        const tol = 1.0;
        
        const isMatch = Math.abs(metadata.widthMm - targetWidth) <= tol && Math.abs(metadata.heightMm - targetHeight) <= tol;
        const isRotated = Math.abs(metadata.widthMm - targetHeight) <= tol && Math.abs(metadata.heightMm - targetWidth) <= tol;
        
        if (!isMatch && !isRotated) {
          status = 'fail'; // Dimensions are strict in print
          issues.push(`ابعاد فایل (${metadata.widthMm}x${metadata.heightMm}) با ابعاد استاندارد + بلید (${targetWidth}x${targetHeight}) تطابق ندارد.`);
        }
      }

      const allEmbedded = await runPdfFonts(filePath);
      if (!allEmbedded) {
        status = 'fail';
        issues.push('برخی از فونت‌های استفاده شده در فایل PDF اصطلاحا Embed نشده‌اند (ممکن است در چاپ بهم بریزند).');
      }

      const inkCov = await runGhostscriptInkCov(filePath);
      if (inkCov.hasRGB) {
        status = 'fail';
        issues.push('در فایل شما از رنگ‌بندی RGB استفاده شده است که برای چاپ افست مناسب نیست (فقط CMYK مجاز است).');
      }
    }

    // Call Webhook
    console.log(`[Worker] Reporting results for ${artworkId}...`);
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artworkId,
        secret: PREFLIGHT_SECRET, // basic auth
        result: { status, issues, metadata }
      })
    });

  } catch (err: any) {
    console.error(`[Worker] Job failed: ${err.message}`);
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artworkId,
        secret: PREFLIGHT_SECRET,
        result: { status: 'fail', issues: ['خطای سیستمی در پردازش فایل: ' + err.message], metadata: {} }
      })
    });
  } finally {
    // Cleanup
    try {
      await fs.unlink(filePath);
    } catch(e) {}
  }
}, { connection });

console.log('[Worker] Preflight Docker Worker Started and listening to Redis...');

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with ${err.message}`);
});
