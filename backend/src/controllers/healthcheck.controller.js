import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import mongoose from "mongoose";

const healthcheck = asyncHandler(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  return res
    .status(200)
    .json(new ApiResponse(200, { 
        message: "Everything is OK",
        database: dbStatus,
        readyState: mongoose.connection.readyState
    }, "Ok"));
});

export { healthcheck };
