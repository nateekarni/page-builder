globalThis.process ??= {}; globalThis.process.env ??= {};
function generateR2Key(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "bin";
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID();
  return `media/${year}/${month}/${uuid}.${ext}`;
}
async function uploadToR2(r2, file, key) {
  const arrayBuffer = await file.arrayBuffer();
  await r2.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type
    },
    customMetadata: {
      originalName: file.name
    }
  });
}
async function deleteFromR2(r2, key) {
  await r2.delete(key);
}
const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  // Videos
  "video/mp4",
  "video/webm",
  // Documents
  "application/pdf"
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
function validateUploadFile(file) {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `File type '${file.type}' is not allowed.` };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File size exceeds the maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.` };
  }
  return { valid: true };
}

export { deleteFromR2 as d, generateR2Key as g, uploadToR2 as u, validateUploadFile as v };
