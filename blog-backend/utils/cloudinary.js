import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {String|Buffer} file - File path or buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result
 */
export const uploadToCloudinary = async (file, folder = "blog-covers") => {
  try {
    // If file is a buffer (memory storage), convert to base64
    if (Buffer.isBuffer(file)) {
      const base64 = `data:image/jpeg;base64,${file.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder,
        resource_type: "auto",
        transformation: [
          { width: 1200, height: 630, crop: "fill", quality: "auto" },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    // Otherwise, assume it's a file path (local development)
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1200, height: 630, crop: "fill", quality: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Public ID of the image
 * @returns {Promise<Object>} - Delete result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

export default cloudinary;
