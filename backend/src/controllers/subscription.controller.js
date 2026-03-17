import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

// controller toggle subscribe
const toggleSubscription = asyncHandler(async (req, res) => {
  const channelId = req.params.channelId;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id!!!");
  }

  // checking wheather the channel is subscribed or not
  const isSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user?._id,
  });

  // if subscribed it will toggle to unsubscribe (delete the subscription document)
  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { subscribed: false },
          "Unsubscribed successfully..."
        )
      );
  }

  // if not subscribed it will create a subscription document
  await Subscription.create({
    subscriber: req.user?._id,
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscribed: true }, "Subscribed successfully...")
    );
});

// controller to get subscriber list of the channel
const getUserChannelSubscriber = asyncHandler(async (req, res) => {
  let channelId = req.params.channelId;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id!!!");
  }

  // converting channelId from String ["65f1c1e4c2e4a81234abcd12"] to ObjectId type [ObjectId("65f1c1e4c2e4a81234abcd12")]
  // to perform $match using channelId
  channelId = new mongoose.Types.ObjectId(channelId);

  // pipeline to get subscribers and subscriber details
  const subscribers = await Subscription.aggregate([
    {
      // matching the channelId from the subscription collections
      $match: {
        channel: channelId
      },
    },
    {
      // after getting all the collections, fetching the details of the subscriber
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            // fetching the subscriber's channel subscribers
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscibedToSubscriber",
            },
          },
          {
            $addFields: {
              // adding whether the current channel subscribed to this subscriber's channel
              isSubscribedToSubscriber: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscibedToSubscriber.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
              // counting the subcribers of the subscriber's channel
              subscriberCount: {
                $size: "$subscibedToSubscriber",
              },
            },
          },
        ],
      },
    },
    {
      // unwinding the array to object
      $unwind: "$subscriber",
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: 1,
          username: 1,
          fullname: 1,
          avatar: 1,
          subscibedToSubscriber: 1,
          subscriberCount: 1,
        },
      },
    },
  ]);

  return res
    .send(200)
    .json(
      new ApiResponse(
        200,
        { subscribers },
        "Successfully fetched the list of subscribers with their details..."
      )
    );
});

// controller to get subscribed channel of an user
const getSubscribedChannel = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber Id!!!");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "videos",
            },
          },
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
              subscribersCount: {
                $size: "$subscribers",
              },
              latestVideo: {
                $last: "$videos",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedChannel",
    },
    {
      $project: {
        _id: 0,
        subscribedChannel: {
          _id: 1,
          username: 1,
          fullname: 1,
          avatar: 1,
          subscribersCount: 1,
          latestVideo: {
            _id: 1,
            videofile: 1,
            title: 1,
            thumbnail: 1,
            owner: 1,
            description: 1,
            duration: 1,
            createdAt: 1,
            views: 1,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscriber, getSubscribedChannel };
