import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId, now } from "mongoose";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";

// controller to create tweet
const createTweet = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content required!!!");
  }

  const tweet = await Tweet.create({
    owner: req.user?._id,
    title: title,
    content: content,
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create tweet!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully..."));
});

// controller to update an existing tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { title, content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id!!!");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "No tweet found!!!");
  }

  if (tweet.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only owner can edit thier tweet!!!");
  }


  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        title: title,
        content: content,
      },
    },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(500, "Failed to update tweet!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully..."));
});

// controller to delete an existing tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id!!!");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Tweet not found!!!");
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't delete the tweet, as you are not the owner!!!"
    );
  }

  await Tweet.findByIdAndDelete(tweetId);
  await Like.deleteMany({
    tweet: tweetId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully..."));
});

// controller to get tweet of user
const getUserTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id!!!");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likeDetails",
        pipeline: [
          {
            $project: {
              likedBy: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likeCount: {
          $size: "$likeDetails",
        },
        ownerDetails: {
          $first: "$ownerDetails",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likeDetails.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        ownerDetails: 1,
        likeCount: 1,
        isLiked: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!tweets) {
    throw new ApiError(500, "Failed to fetch tweet!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully..."));
});

export { createTweet, updateTweet, deleteTweet, getUserTweet };
