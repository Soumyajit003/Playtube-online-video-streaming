import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error("CRITICAL: MONGODB_URI is not defined in environment variables!");
            return;
        }

        // Ensure the URI has the correct format and includes the DB name
        const connectionString = uri.endsWith("/") ? `${uri}${DB_NAME}` : `${uri}/${DB_NAME}`;
        
        console.log(`\n Attempting to connect to MongoDB...`);
        const connectionInstance = await mongoose.connect(connectionString);
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