import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { Video } from './src/models/video.model.js';

dotenv.config({ path: './.env' });

const checkVideos = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/playtube`);
    console.log("Connected to DB");
    
    const allVideos = await Video.find({}, 'title _id videofile');
    console.log("Found videos:", allVideos.length);
    fs.writeFileSync('./videos_list.json', JSON.stringify(allVideos, null, 2));
    console.log("Videos saved to videos_list.json");

    const targetId = '69b198bbe48cbdb0d4a4a475';
    const specificVideo = await Video.findById(targetId);
    console.log(`Video with ID ${targetId}:`, specificVideo ? "EXISTS" : "NOT FOUND");
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

checkVideos();
