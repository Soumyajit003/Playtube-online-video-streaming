import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { User } from './src/models/user.model.js';

dotenv.config({ path: './.env' });

const checkIndexes = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/playtube`);
    console.log("Connected to DB");
    const indexes = await User.collection.getIndexes();
    console.log("Indexes for User collection:", JSON.stringify(indexes, null, 2));
    
    // Also try to find a user that might be causing issues
    // If the user has a specific one in mind, I don't know it, but I can list first few
    const allUsers = await User.find({}, 'username email fullname');
    console.log("Found users:", allUsers.length);
    fs.writeFileSync('./users_list.json', JSON.stringify(allUsers, null, 2));
    console.log("Users saved to users_list.json");
    
    // Check for any user with empty/null username or email if they aren't required properly
    const weirdUsers = await User.find({ $or: [{ username: null }, { email: null }, { username: "" }, { email: "" }] });
    console.log("Weird users found:", weirdUsers.length);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

checkIndexes();
