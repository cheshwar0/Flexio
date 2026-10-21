import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env.js';

const isCloudinaryConfigured = Boolean(
  ENV.CLOUDINARY_CLOUD_NAME &&
  ENV.CLOUDINARY_API_KEY &&
  ENV.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('Cloudinary SDK configured with provided credentials.');
} else {
  console.warn(
    'Cloudinary credentials not detected in environment. Using fallback data URI image handler for local development.'
  );
}

export { cloudinary, isCloudinaryConfigured };
