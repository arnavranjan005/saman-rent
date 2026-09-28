import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

export const UPLOAD_FOLDER = 'samanrent/services';

function configured() {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
  );
}

export function requireCloudinary() {
  if (!configured()) {
    throw new ApiError(503, 'UPLOAD_NOT_CONFIGURED', 'Image uploads are not configured yet.');
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

/** Signed payload for direct client-side upload. Secret never leaves the server. */
export function createUploadSignature(): UploadSignature {
  const api = requireCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = api.utils.sign_request(
    { timestamp, folder: UPLOAD_FOLDER },
    { api_secret: env.CLOUDINARY_API_SECRET as string },
  ).signature;
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: env.CLOUDINARY_API_KEY as string,
    timestamp,
    signature,
    folder: UPLOAD_FOLDER,
  };
}

/** Delete only assets inside our folder. */
export async function destroyUpload(publicId: string): Promise<void> {
  const api = requireCloudinary();
  if (!publicId.startsWith('samanrent/')) {
    throw ApiError.badRequest('Unknown asset.', 'INVALID_PUBLIC_ID');
  }
  await api.uploader.destroy(publicId);
}
