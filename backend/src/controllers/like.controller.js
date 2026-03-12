import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// controller to toggle video like
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id!!!");
  }

  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false },
          "video like removed successfully..."
        )
      );
  }

  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, { isLiked: true }, "video liked successfully...")
    );
});

// controller to toggle comment like
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  const likedAlready = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isLiked: false },
          "comment like removed successfully..."
        )
      );
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isLiked: true }, "comment liked successfully...")
    );
});

// controller to toggle tweet like
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const likedAlready = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (likedAlready) {
    await Like.findByIdAndDelete(likedAlready?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { tweetId, isLiked: false },
          "tweet like removed successfully..."
        )
      );
  }

  await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {tweetId, isLiked: true }, "tweet liked successfully...")
    );
});

// controller to get liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(400, "Unauthorized user id");
  }

  const likedVideosAggegate = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
            },
          },
          {
            $unwind: "$ownerDetails",
          },
        ],
      },
    },
    {
      $unwind: "$likedVideo",
    },
    {
      $project: {
        _id: "$likedVideo._id",
        videoFile: "$likedVideo.videofile",
        thumbnail: "$likedVideo.thumbnail",
        title: "$likedVideo.title",
        description: "$likedVideo.description",
        owner: "$likedVideo.owner",
        createdAt: "$likedVideo.createdAt",
        isPublished: "$likedVideo.isPublished",
        views: "$likedVideo.views",
        duration: "$likedVideo.duration",
        ownerDetails: "$likedVideo.ownerDetails",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideosAggegate,
        "liked videos fetched successfully..."
      )
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
