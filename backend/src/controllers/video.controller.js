import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  getVideoFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "./../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "./../models/comment.model.js";

// controller for uploading video
const uploadVideo = asyncHandler(async (req, res) => {
  //TODO:
  // Getting the video data from the body
  // validate the data
  // upload the file to the cloudinary using multer

  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() == "")) {
    throw new ApiError(400, "All fields are required to upload the video!!!");
  }

  const videoLocalPath = req.files.videofile[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail are required!!!");
  }

  const videoUploaded = await uploadOnCloudinary(videoLocalPath);
  const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath);

  const owner = await User.findById(req.user?._id);

  if (!videoUploaded) {
    throw new ApiError(400, "Video file is required!!!");
  }
  if (!thumbnailUploaded) {
    throw new ApiError(400, "Thumbnail is required!!!");
  }

  const video = await Video.create({
    title,
    description,
    videofile: videoUploaded.url,
    videoPublicId: videoUploaded.public_id,
    thumbnail: thumbnailUploaded.url,
    thumbnailPublicId: thumbnailUploaded.public_id,
    owner,
    isPublished: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully:)"));
});

// controller to get all videos
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
    query,
    userId,
  } = req.query;
  const pipeline = [];

  // first have to create search index in mongodb atlas
  // then we have to map fields, like - title, description
  // so the search text index will find from the fields
  // our search index is "search-videos"

  if (query) {
    pipeline.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          path: ["title", "description"],
        },
      },
    });
  }

  // if search using any userid
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId!!!");
    } else {
      pipeline.push({
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      });
    }
  }

  // fetch only those videos which are published
  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  // sortBy - views, createdAt, duration
  // sortType - ascending, descending
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType == "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }

  // lookup with user
  pipeline.push(
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
      $unwind: "$ownerDetails",
    }
  );

  const videoAggregate = Video.aggregate(pipeline);

  // now its time to do pagination for fast response
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

// controller to get video by Id
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Videos id is invalid!!!");
  }

  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "User id is invalid!!!");
  }

  console.log("Fetching video by ID:", videoId);
  console.log("Current User ID:", req.user?._id);

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $cond: {
            if: {
              $in: [new mongoose.Types.ObjectId(req.user?._id), "$likes.likedBy"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscriberCount: {
                $size: "$subscribers",
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [new mongoose.Types.ObjectId(req.user?._id), "$subscribers.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              avatar: 1,
              subscriberCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        videoFile: "$videofile",
        title: 1,
        description: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        owner: 1,
        isLiked: 1,
        likesCount: 1,
      },
    },
  ]);

  console.log("Aggregation results:", JSON.stringify(video, null, 2));

  if (!video?.length) {
    throw new ApiError(404, "Video not found :(");
  }

  // increase the views if the video is fetched successfully
  await Video.findByIdAndUpdate(videoId, {
    $inc: {
      views: 1,
    },
  });

  // add the video to the watch history of the user
  await User.findByIdAndUpdate(req.user?._id, {
    $addToSet: {
      watchHistory: videoId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "video details fetched successfully"));
});

// controller for updating an existing video
const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoId = req.params.videoId;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VideoId!!!");
  }

  if (!(title && description)) {
    throw new ApiError(400, "title and description is required!!!");
  }

  // fetching the video from the database
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "No video found!!!");
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't update the video as you are not the owner!!!"
    );
  }

  // delete and update the thumbnail
  const thumbnailToDelete = video.thumbnailPublicId;

  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required!!!");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(500, "Error while updating thumbnail on Cloudinary!!!");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
        thumbnailPublicId: thumbnail.public_id,
      },
    },
    { new: true }
  );

  if (!updateVideo) {
    throw new ApiError(400, "Failed to update video, try again!!!");
  }

  await deleteFromCloudinary(thumbnailToDelete);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// controller for deleting video from db and cloudinary also
const deleteVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VideoId!!!");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "No video is found!!!");
  }

  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't delete the video as you are not the owner!!!"
    );
  }

  const videoDeleted = await Video.findByIdAndDelete(video._id);

  if (!videoDeleted) {
    throw new ApiError(500, "Error while deleting the video, try again!!!");
  }

  await deleteFromCloudinary(video.thumbnailPublicId);
  await deleteFromCloudinary(video.videoPublicId, "video"); // mention "video" while deleting video

  await Like.deleteMany({
    video: videoId,
  });

  await Comment.deleteMany({
    video: videoId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// controller for toggle video publish
const togglePublishStatus = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  if(!isValidObjectId(videoId)){
    throw new ApiError(400, "Invalid VideoId!!!");
  }

  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(400, "Video not found!!!");
  }

  if(video.owner.toString() !== req.user?._id.toString()){
    throw new ApiError(
      400,
      "You can't toggle publish the video as you are not the owner!!!"
    );
  }

  const toggledVideoPublish = await Video.findByIdAndUpdate(videoId, {
    $set:{
      isPublished: !video.isPublished
    }
  }, {new:true});

  if(!toggledVideoPublish){
    throw new ApiError(500, "Failed to toogle video publish status");
  }

  return res
  .status(200)
  .json( new ApiResponse( 200, { isPublished: toggledVideoPublish.isPublished}, "Video publish toggle successfully..."));

})

export { uploadVideo, getAllVideos, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
