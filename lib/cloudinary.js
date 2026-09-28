import { api } from '../api/client';

/**
 * Direct client-side upload to Cloudinary (Phase 4 pipeline):
 * 1. GET signed payload from Express (secret stays on the server).
 * 2. POST the file straight to Cloudinary.
 * 3. Returns { secureUrl, publicId } for the caller to persist.
 */
export async function uploadServiceImage(localUri) {
  const sig = await api.post('/uploads/signature');

  const form = new FormData();
  form.append('file', {
    uri: localUri,
    name: 'service.jpg',
    type: 'image/jpeg',
  });
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: 'POST', body: form, headers: { Accept: 'application/json' } },
  );
  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.secure_url) {
    throw new Error(payload?.error?.message ?? 'Image upload failed.');
  }
  return { secureUrl: payload.secure_url, publicId: payload.public_id };
}

export async function deleteServiceImage(publicId) {
  await api.del('/uploads', { body: { publicId } });
}
