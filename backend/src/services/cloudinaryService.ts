import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { Readable } from 'stream';

export interface UploadResult {
  imageUrl: string;
  cloudinaryPublicId?: string;
}

export async function uploadEmployeeImage(
  buffer: Buffer,
  mimetype: string,
  employeeId: string
): Promise<UploadResult> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'flexio-performers',
          public_id: `emp_${employeeId.toLowerCase()}_${Date.now()}`,
          transformation: [
            { width: 1200, height: 1500, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
          if (!result) {
            return reject(new Error('Cloudinary returned empty result.'));
          }
          resolve({
            imageUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
          });
        }
      );

      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });
  }

  // Graceful fallback for local development or when Cloudinary keys are not provided
  console.log('Cloudinary not configured. Generating inline base64 image representation...');
  const base64Data = buffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${base64Data}`;
  return {
    imageUrl: dataUri,
    cloudinaryPublicId: undefined,
  };
}

export async function deleteCloudinaryImage(publicId?: string): Promise<void> {
  if (!publicId || !isCloudinaryConfigured) {
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted obsolete Cloudinary image: ${publicId}`);
  } catch (err) {
    console.warn(`Failed to delete Cloudinary asset ${publicId}:`, (err as Error).message);
  }
}
