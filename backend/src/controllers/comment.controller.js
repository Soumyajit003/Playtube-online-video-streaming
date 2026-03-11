import mongoose, { Schema } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// controller to comment on videos
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!content) {
    throw new ApiError(400, "Content required!!!");
  }

  const video = await Video.find(videoId);
  if (!video) {
    throw new ApiError(400, "Video not found!!!");
  }

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user?._id,
  });
  if (!comment) {
    throw new ApiError(500, "Failed to add comment please try again!!!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully..."));
});

// controller to update comment
const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  if (!content) {
    throw new ApiError(400, "Content required!!!");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "No comment found!!!");
  }

  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "Only comment owner can edit their comment");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    comment?._id,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(500, "Failed to edit comment please try again");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment updated successfully...")
    );
});

// controller to delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Comment not found!!!");
  }

  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only comment owner can delete their comment!!!");
  }

  await Comment.findByIdAndDelete(commentId);

  await Like.deleteMany({
    comment: commentId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { commentId }, "Comment deleted successfully...")
    );
});

// controller to get all the comments of a video
const getVideoAllComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "No video found!!!");
  }

  const commentsAggregate = await Comment.aggregate([
    {
      $match: {
        video: video._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentOwner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "commentlike",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$commentlike",
        },
        commentOwner: {
          $first: "$commentOwner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$commentLike.likedBy"] },
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
        _id: 0,
        content: 1,
        createdAt: 1,
        likesCount: 1,
        commentOwner: {
          username: 1,
          fullname: 1,
          avatar: 1,
        },
        isLiked: 1,
      },
    },
  ]);

  const option = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comment = await Comment.aggregatePaginate(commentsAggregate, option);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully..."));
});

export { addComment, updateComment, deleteComment, getVideoAllComments };
