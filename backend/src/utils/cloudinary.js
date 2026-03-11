import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiResponse } from "./ApiResponse.js";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localPath) => {
  try {
    if (!localPath) return null;
    //upload on Cloudinary
    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return response;
  } catch (error) {
    console.error("CLOUDINARY UPLOAD ERROR DETAILS:", error);
    if (localPath && fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    throw new ApiError(400, `Cloudinary Upload Error: ${error.message}`); 
  }
};

const deleteFromCloudinary = async (PublicId) => {
    try {
        const response = await cloudinary.uploader.destroy(PublicId);
        console.log("Deleted from cloudinary");
        return response;
    } catch (error) {
        throw new ApiError(400,"Error while daleting file from Cloudinary!!!"); 
    }
};

const getVideoFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type:"video"
    });
    return result;
    
  } catch (error) {
    throw new ApiError(402,"Error to get video from the Cloudinary!!!")
  }
}

export { uploadOnCloudinary, deleteFromCloudinary, getVideoFromCloudinary };
