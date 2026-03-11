// ================================= Approach: 2 (Best for Production) ================================\
// require('dotenv').config({path:'./env'});

import { app } from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({ path: './env' });

const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("Error :", error);

        })

        app.listen(port, () => {
            console.log(`Server is running in port: ${port}!!!`);

        })
    })
    .catch((error) => {
        console.log('Mongodb connection failled!!! ', error);

    })































// ================================= Approach: 1 ================================
/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";

import express from "express";
const app = express();

;(async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
            console.error("App can not connect with DB :",error);
            throw error;
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port : ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("Error to connect DB :",error);
        throw error;
    }
})()
*/