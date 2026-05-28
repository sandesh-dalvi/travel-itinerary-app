import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinryUploadResult {
  url: string;
  publicId: string;
}

// Uploads a file buffer directly to Cloudinary using a writable stream.

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  options: {
    folder: string;
    resource_type: "image" | "raw" | "auto";
    public_id?: string;
  },
): Promise<CloudinryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary returned no result"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

//  Deletes a file from Cloudinary by its public ID.

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "raw" = "raw",
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
