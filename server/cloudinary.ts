import crypto from 'crypto';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret && apiKey !== 'optional_api_key' && apiSecret !== 'optional_api_secret') {
    return { cloudName, apiKey, apiSecret };
  }
  return null;
}

/**
 * Builds an optimized Cloudinary transformation URL
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg';
  } = {}
): string {
  // If it's already an external full URL (e.g. Unsplash or direct upload)
  if (publicIdOrUrl.startsWith('http://') || publicIdOrUrl.startsWith('https://')) {
    // If it's a Cloudinary URL, we can inject transformation params
    if (publicIdOrUrl.includes('res.cloudinary.com')) {
      const parts = publicIdOrUrl.split('/upload/');
      if (parts.length === 2) {
        const trans: string[] = ['f_auto', 'q_auto'];
        if (options.width) trans.push(`w_${options.width}`);
        if (options.height) trans.push(`h_${options.height}`);
        if (options.crop) trans.push(`c_${options.crop}`);
        return `${parts[0]}/upload/${trans.join(',')}/${parts[1]}`;
      }
    }
    return publicIdOrUrl;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
  const trans: string[] = ['f_auto', 'q_auto'];
  if (options.width) trans.push(`w_${options.width}`);
  if (options.height) trans.push(`h_${options.height}`);
  if (options.crop) trans.push(`c_${options.crop}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${trans.join(',')}/${publicIdOrUrl}`;
}

/**
 * Uploads a base64 data URI to Cloudinary via their signed upload API.
 * Returns null if Cloudinary credentials are not configured.
 */
export async function uploadToCloudinary(
  imageBase64: string,
  options: { folder?: string } = {}
): Promise<{ publicId: string; secureUrl: string; width: number; height: number; format: string } | null> {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = options.folder || 'jewelry';

  const paramsToSign: Record<string, string | number> = { folder, timestamp };
  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&') + config.apiSecret;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const form = new URLSearchParams();
  form.append('file', imageBase64);
  form.append('api_key', config.apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);
  form.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: 'POST',
    body: form
  });

  const data: any = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Cloudinary upload failed');
  }

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format
  };
}

/**
 * Generate secure Cloudinary signature for direct client-to-Cloudinary uploads
 */
export function generateCloudinarySignature(params: Record<string, string | number>): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
} | null {
  const config = getCloudinaryConfig();
  if (!config) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = (params.folder as string) || 'jewelry';

  const paramsToSign = {
    ...params,
    folder,
    timestamp
  };

  // Sort keys alphabetically
  const sortedKeys = Object.keys(paramsToSign).sort();
  const stringToSign = sortedKeys
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&') + config.apiSecret;

  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  return {
    signature,
    timestamp,
    apiKey: config.apiKey,
    cloudName: config.cloudName,
    folder
  };
}
