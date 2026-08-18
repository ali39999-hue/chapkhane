import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pipeline } from 'node:stream/promises';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import {
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  requireWebhookSecret,
  signWebhookPayload,
} from '../lib/webhook-signature';

/**
 * `execFile` takes an argument array, so no part of a filename can be
 * interpreted by a shell. The previous `exec` calls interpolated a
 * user-supplied filename into a shell string (`gs ... "${filePath}"`), which a
 * filename containing a double quote could escape — arbitrary command
 * execution inside a container holding S3 credentials.
 */
const execFileAsync = promisify(execFile);

/** Bound external tool runtime so a crafted file cannot hang a worker slot. */
const TOOL_TIMEOUT_MS = 30_000;
const TOOL_MAX_BUFFER = 4 * 1024 * 1024;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/preflight-webhook';
const PREFLIGHT_SECRET = requireWebhookSecret();
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://localhost:9000';
const S3_BUCKET = process.env.S3_BUCKET_PRIVATE || 'private-artwork';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: S3_ENDPOINT,
  credentials: {
    // No dev fallbacks: a worker that silently authenticates with `admin` /
    // `password123` against a real bucket is worse than one that refuses to start.
    accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
  },
  forcePathStyle: true,
});

async function downloadFile(key: string, destPath: string): Promise<void> {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  const response = await s3Client.send(command);
  await pipeline(response.Body as Readable, createWriteStream(destPath));
}

type ToolResult = { ok: true; stdout: string } | { ok: false; error: string };

async function runTool(command: string, args: string[]): Promise<ToolResult> {
  try {
    const { stdout } = await execFileAsync(command, args, {
      timeout: TOOL_TIMEOUT_MS,
      maxBuffer: TOOL_MAX_BUFFER,
      windowsHide: true,
    });
    return { ok: true, stdout };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function runGhostscriptInkCov(filePath: string) {
  const res = await runTool('gs', ['-q', '-o', '-', '-sDEVICE=inkcov', filePath]);
  if (!res.ok) {
    return { hasRGB: false, error: res.error };
  }
  // Output looks like: 0.12345 0.00000 0.00000 0.98765 CMYK OK
  return { hasRGB: res.stdout.includes('RGB'), output: res.stdout };
}

async function runPdfInfo(filePath: string) {
  const res = await runTool('pdfinfo', [filePath]);
  if (!res.ok) return null;

  // Parse Page size: e.g., "Page size:      595.28 x 841.89 pts (A4)"
  const matchSize = res.stdout.match(/Page size:\s+([0-9.]+)\s+x\s+([0-9.]+)/);
  const pagesMatch = res.stdout.match(/Pages:\s+([0-9]+)/);

  let widthMm = 0;
  let heightMm = 0;
  if (matchSize) {
    widthMm = (parseFloat(matchSize[1]) * 25.4) / 72;
    heightMm = (parseFloat(matchSize[2]) * 25.4) / 72;
  }

  return {
    pages: pagesMatch ? parseInt(pagesMatch[1], 10) : 0,
    widthMm,
    heightMm,
  };
}

/**
 * Returns `null` when the check could not run, distinguished from `false`
 * ("fonts missing"). Returning `true` on error would fail *open* on a
 * print-correctness gate.
 */
async function runPdfFonts(filePath: string): Promise<boolean | null> {
  const res = await runTool('pdffonts', [filePath]);
  if (!res.ok) return null;

  // The table header is: name type encoding emb sub uni object ID
  const lines = res.stdout.split('\n').slice(2);
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.includes(' no ')) return false;
  }
  return true;
}

/** Reduce an arbitrary filename to a safe extension from a fixed allowlist. */
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.zip']);

function safeExtension(filename: unknown): string {
  if (typeof filename !== 'string') return '.pdf';
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) ? ext : '.pdf';
}

type PreflightPayload = {
  artworkId: string | number;
  result: { status: 'pass' | 'warning' | 'fail'; issues: string[]; metadata: Record<string, unknown> };
};

async function report(body: PreflightPayload): Promise<void> {
  const rawBody = JSON.stringify(body);
  const timestamp = Date.now().toString();

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [TIMESTAMP_HEADER]: timestamp,
      [SIGNATURE_HEADER]: signWebhookPayload(rawBody, timestamp, PREFLIGHT_SECRET),
    },
    body: rawBody,
  });

  if (!res.ok) {
    // Surface it so BullMQ retries instead of silently dropping the verdict.
    throw new Error(`Webhook rejected the report with HTTP ${res.status}`);
  }
}

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });

const worker = new Worker(
  'preflight-jobs',
  async (job: Job) => {
    const { artworkId, filename, expectedWidth, expectedHeight, expectedBleed } = job.data;

    // The temp path is derived from the artwork ID plus an allowlisted
    // extension, never from the user-supplied filename, so it cannot traverse.
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'preflight-'));
    const ext = safeExtension(filename);
    const filePath = path.join(tmpDir, `${artworkId}${ext}`);

    try {
      await downloadFile(filename, filePath);

      const issues: string[] = [];
      const metadata: Record<string, unknown> = {};
      let status: 'pass' | 'warning' | 'fail' = 'pass';

      if (ext === '.pdf') {
        const pdfInfo = await runPdfInfo(filePath);
        if (pdfInfo) {
          metadata.pages = pdfInfo.pages;
          const widthMm = parseFloat(pdfInfo.widthMm.toFixed(2));
          const heightMm = parseFloat(pdfInfo.heightMm.toFixed(2));
          metadata.widthMm = widthMm;
          metadata.heightMm = heightMm;

          const targetWidth = expectedWidth + expectedBleed * 2;
          const targetHeight = expectedHeight + expectedBleed * 2;
          const tol = 1.0;

          const isMatch =
            Math.abs(widthMm - targetWidth) <= tol && Math.abs(heightMm - targetHeight) <= tol;
          const isRotated =
            Math.abs(widthMm - targetHeight) <= tol && Math.abs(heightMm - targetWidth) <= tol;

          if (!isMatch && !isRotated) {
            status = 'fail'; // Dimensions are strict in print
            issues.push(
              `ابعاد فایل (${widthMm}x${heightMm}) با ابعاد استاندارد + بلید (${targetWidth}x${targetHeight}) تطابق ندارد.`
            );
          }
        }

        const allEmbedded = await runPdfFonts(filePath);
        if (allEmbedded === false) {
          status = 'fail';
          issues.push(
            'برخی از فونت‌های استفاده شده در فایل PDF اصطلاحا Embed نشده‌اند (ممکن است در چاپ بهم بریزند).'
          );
        } else if (allEmbedded === null) {
          // Cannot verify — flag for a human instead of silently passing.
          if (status === 'pass') status = 'warning';
          issues.push('بررسی Embed بودن فونت‌ها ممکن نبود و نیازمند بازبینی دستی است.');
        }

        const inkCov = await runGhostscriptInkCov(filePath);
        if (inkCov.hasRGB) {
          status = 'fail';
          issues.push(
            'در فایل شما از رنگ‌بندی RGB استفاده شده است که برای چاپ افست مناسب نیست (فقط CMYK مجاز است).'
          );
        } else if (inkCov.error) {
          if (status === 'pass') status = 'warning';
          issues.push('بررسی فضای رنگی ممکن نبود و نیازمند بازبینی دستی است.');
        }
      }

      await report({ artworkId, result: { status, issues, metadata } });
      return { status, issues };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[Worker] Job ${job.id} failed:`, message);
      await report({
        artworkId,
        result: {
          status: 'fail',
          // Internal error text is not echoed to the customer.
          issues: ['خطای سیستمی در پردازش فایل. لطفاً با پشتیبانی تماس بگیرید.'],
          metadata: {},
        },
      }).catch((reportErr: unknown) => {
        console.error('[Worker] Failed to report job failure:', reportErr);
      });
      throw err;
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch((cleanupErr: unknown) => {
        console.error('[Worker] Temp cleanup failed:', cleanupErr);
      });
    }
  },
  { connection }
);

console.log('[Worker] Preflight worker started, listening to Redis.');

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed: ${err.message}`);
});
