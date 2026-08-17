import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { runPreflight } from './engine';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { scanForMalware, generateFileHash, checkPdfEncryption } from './security';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null, lazyConnect: true });

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export const preflightWorker = new Worker('preflight-jobs', async (job) => {
  const { artworkId, expectedWidth, expectedHeight, expectedBleed } = job.data;
  console.log(`[Preflight Worker] Starting job for Artwork: ${artworkId}`);

  try {
    const payload = await getPayload({ config: configPromise });
    const artwork = await payload.findByID({
      collection: 'artworks',
      id: artworkId,
    });

    if (!artwork || !artwork.filename) {
      throw new Error(`Artwork ${artworkId} not found or has no filename.`);
    }

    const bucket = process.env.S3_BUCKET_PRIVATE || process.env.S3_BUCKET || 'private-artwork';
    const s3Command = new GetObjectCommand({
      Bucket: bucket,
      Key: artwork.filename,
    });
    
    console.log(`[Preflight Worker] Downloading ${artwork.filename} from S3...`);
    const s3Response = await s3Client.send(s3Command);
    const buffer = await streamToBuffer(s3Response.Body as Readable);
    
    console.log(`[Preflight Worker] Running Security Pipeline...`);
    const fileHash = generateFileHash(buffer);
    const scanResult = await scanForMalware(buffer, artwork.filename as string);

    if (scanResult === 'infected') {
      console.warn(`[Preflight Worker] Malware detected in ${artwork.filename}!`);
      await payload.update({
        collection: 'artworks',
        id: artworkId,
        data: {
          virusScanStatus: 'infected',
          fileHash,
          preflightResult: { status: 'fail', issues: ['فایل آلوده به بدافزار است و مسدود شد.'], metadata: {} },
        },
      });
      throw new Error('Security Violation: Malware detected.');
    }

    const isEncrypted = await checkPdfEncryption(buffer, artwork.mimeType as string);
    if (isEncrypted) {
      console.warn(`[Preflight Worker] PDF is password protected!`);
      await payload.update({
        collection: 'artworks',
        id: artworkId,
        data: {
          virusScanStatus: 'clean',
          fileHash,
          preflightResult: { status: 'fail', issues: ['فایل PDF دارای پسورد است و قابل چاپ نیست. لطفاً رمز آن را بردارید.'], metadata: {} },
        },
      });
      return { status: 'fail' };
    }
    
    console.log(`[Preflight Worker] Running Preflight logic on buffer (size: ${buffer.length})...`);
    const result = await runPreflight(
      buffer, 
      artwork.mimeType as string, 
      expectedWidth || 90, 
      expectedHeight || 50, 
      expectedBleed || 2
    );

    console.log(`[Preflight Worker] Result status: ${result.status}`);

    await payload.update({
      collection: 'artworks',
      id: artworkId,
      data: {
        preflightResult: { ...result },
        virusScanStatus: 'clean',
        fileHash,
      },
    });

    return result;
  } catch (err: any) {
    console.error(`[Preflight Worker] Job failed for artwork ${artworkId}:`, err);
    throw err;
  }
}, { connection: redisConnection });

preflightWorker.on('completed', (job) => {
  console.log(`[Preflight Worker] Job ${job.id} completed successfully`);
});
preflightWorker.on('failed', (job, err) => {
  console.log(`[Preflight Worker] Job ${job?.id} failed with error ${err.message}`);
});
