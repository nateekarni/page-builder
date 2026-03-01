/**
 * R2 Storage Utilities
 *
 * Helper functions for interacting with Cloudflare R2 (S3-compatible).
 * All media files (images, videos, docs) are stored in R2.
 *
 * Clean Code:
 * - Pure utility functions with no state or framework dependency
 * - Testable in isolation
 * - Single responsibility per function
 */

/**
 * Generates a unique R2 key for a new file upload.
 * Format: media/{year}/{month}/{uuid}.{ext}
 */
export function generateR2Key(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'bin';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const uuid = crypto.randomUUID();

  return `media/${year}/${month}/${uuid}.${ext}`;
}

/**
 * Constructs the public URL for an R2 object.
 * Assumes R2 bucket is configured with a custom domain or public access.
 */
export function getR2PublicUrl(r2Key: string, bucketDomain: string): string {
  return `${bucketDomain}/${r2Key}`;
}

/**
 * Uploads a file to R2 and returns the key.
 * Uses the R2 binding directly (Cloudflare Workers runtime).
 */
export async function uploadToR2(
  r2: R2Bucket,
  file: File,
  key: string,
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();

  await r2.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
    },
    customMetadata: {
      originalName: file.name,
    },
  });
}

/**
 * Deletes an object from R2 by its key.
 */
export async function deleteFromR2(
  r2: R2Bucket,
  key: string,
): Promise<void> {
  await r2.delete(key);
}

/**
 * Allowed MIME types for media uploads.
 */
export const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  // Videos
  'video/mp4',
  'video/webm',
  // Documents
  'application/pdf',
] as const;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates that a file is acceptable for upload.
 */
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return { valid: false, error: `File type '${file.type}' is not allowed.` };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File size exceeds the maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.` };
  }

  return { valid: true };
}
