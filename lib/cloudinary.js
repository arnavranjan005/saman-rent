import * as FileSystem from 'expo-file-system/legacy';
import { api } from '../api/client';

/**
 * Direct client-side upload to Cloudinary (Phase 4 pipeline):
 * 1. GET signed payload from Express (secret stays on the server).
 * 2. POST the file straight to Cloudinary via native multipart upload
 *    (fetch + FormData rejects plain { uri } parts on current RN).
 * 3. Returns { secureUrl, publicId } for the caller to persist.
 */
export async function uploadServiceImage(localUri) {
  const sig = await api.post('/uploads/signature');

  const res = await FileSystem.uploadAsync(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    localUri,
    {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file',
      mimeType: 'image/jpeg',
      parameters: {
        api_key: sig.apiKey,
        timestamp: String(sig.timestamp),
        signature: sig.signature,
        folder: sig.folder,
      },
    },
  );
  const payload = JSON.parse(res.body ?? '{}');
  if (res.status !== 200 || !payload?.secure_url) {
    throw new Error(payload?.error?.message ?? 'Image upload failed.');
  }
  return { secureUrl: payload.secure_url, publicId: payload.public_id };
}

export async function deleteServiceImage(publicId) {
  await api.del('/uploads', { body: { publicId } });
}
