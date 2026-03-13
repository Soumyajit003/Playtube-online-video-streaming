import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("CRITICAL: MONGODB_URI is not defined in environment variables!");
            return;
        }
        
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connected!!! DB host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("MongoDB connection FAILLED :", error);
        // Do not use process.exit(1) on Vercel as it crashes the serverless function
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}

export default connectDB;