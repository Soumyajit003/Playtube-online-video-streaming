import { Playlist } from "./../models/playlist.model.js";
import { Video } from "./../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "./../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// controller to create a playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(
      400,
      "Playlist name and description both are required!!!"
    );
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist!!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully..."));
});

// controller to update a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id!!!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "No playlist found!!!");
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can not update this playlist, as you are not the owner!!!"
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(400, "Failed to update the playlist!!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully...")
    );
});

// controller to delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id!!!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "No playlist found!!!");
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can not delete this playlist, as you are not the owner!!!"
    );
  }

  await Playlist.findByIdAndDelete(playlist?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully..."));
});

// controller to add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id!!!");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id!!!");
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playlist) {
    throw new ApiError(400, "No playlist found!!!");
  }
  if (!video) {
    throw new ApiError(400, "No vidoe found!!!");
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not the owner of this playlist");
  }

  if (playlist.owner.toString() !== video.owner.toString()) {
    throw new ApiError(
      403,
      "You can only add your own videos to this playlist"
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist?._id,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(400, "Failed to add video to playlist!!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Added video to playlist successfully..."
      )
    );
});

// controller to remove a video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id!!!");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id!!!");
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playlist) {
    throw new ApiError(400, "No playlist found!!!");
  }
  if (!video) {
    throw new ApiError(400, "No vidoe found!!!");
  }

  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can not edit this playlist, as you are not the owner!!!"
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist?._id,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Removed video from playlist successfully..."
      )
    );
});

// controller for getting playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id!!!");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "No playlist found!!!");
  }

  const playlistVideos = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "playlistVideos",
      },
    },
    {
      $match: {
        "playlistVideos.isPublished": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "playlistOwner",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$playlistVideos",
        },
        totalViews: {
          $sum: "$playlistVideos.views",
        },
        owner: {
          $first: "$playlistOwner",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        playlistVideos: {
          _id: 1,
          videofile: 1,
          thumbnail: 1,
          title: 1,
          description: 1,
          views: 1,
          duration: 1,
          createdAt: 1,
        },
        playlistOwner: {
          username: 1,
          fullname: 1,
          avatar: 1,
        },
      },
    },
  ]);

  if (!playlistVideos) {
    throw new ApiError(500, "Failed to fetch playlist!!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlistVideos[0],
        "Playlist fetched successfully..."
      )
    );
});

// controller to get user playlist
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id!!!");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(400, "No user found!!!");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "playlistVideos",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$playlistVideos",
        },
        totalViews: {
          $sum: "$playlistVideos.views",
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        totalVideos: 1,
        totalViews: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!playlists) {
    throw new ApiError(500, "Failed to fetch user playlists!!!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully...")
    );
});

export {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists,
};
