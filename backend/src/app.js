import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
const origins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*";

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Routers import
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import dashboardRouter from "./routes/dashboard.route.js";
import likeRouter from "./routes/like.route.js";
import commentRouter from "./routes/comment.route.js"
import tweetRouter from "./routes/tweet.route.js"
import healthcheckRouter from "./routes/healthcheck.route.js";
import playlistRouter from "./routes/playlist.route.js"

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/playlists", playlistRouter);

// Common error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    
    return res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || [],
    });
});

export default app;
