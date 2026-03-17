import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
// const origins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
      
//       if (origins.indexOf(origin) !== -1 || origins.includes("*") || process.env.NODE_ENV === 'production') {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//   })
// );

const origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Diagnostic middleware for production
import mongoose from "mongoose";
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        console.log(`[REQ] ${req.method} ${req.url} | DB State: ${mongoose.connection.readyState}`);
    }
    next();
});

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
// Root route
app.get("/", (req, res) => {
    res.json({
        message: "API is working fine!",
        api_documentation: "Check the GitHub repo for API endpoints"
    });
});

// Favicon handler
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => res.status(204).end());

// Define routes with and without prefix for flexibility
const routes = [
    { path: "/users", router: userRouter },
    { path: "/videos", router: videoRouter },
    { path: "/subscriptions", router: subscriptionRouter },
    { path: "/dashboard", router: dashboardRouter },
    { path: "/likes", router: likeRouter },
    { path: "/comments", router: commentRouter },
    { path: "/tweets", router: tweetRouter },
    { path: "/healthcheck", router: healthcheckRouter },
    { path: "/playlists", router: playlistRouter },
];

routes.forEach(route => {
    app.use(`/api/v1${route.path}`, route.router); // standard prefix
    app.use(route.path, route.router);            // prefix-less (for direct visits)
});

// Custom 404 handler (JSON)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found. Try adding /api/v1/ prefix if you are calling an API.`,
    });
});

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
