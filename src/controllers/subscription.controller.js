import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channel id is invalid");
  }
  // find the channel
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "channel not found");
  }
  let subscription = await Subscription.findOne({
    subscriber: req.user?._id,
    channel: channelId,
  });
  // if already subscribed then unsubscribe else subscribe
  if (subscription) {
    await Subscription.deleteOne({ _id: subscribe._id });
    res
      .status(200)
      .json(new ApiResponse(200, null, "unsubscribed successfully"));
  } else {
    subscription = await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });
    res
      .status(200)
      .json(new ApiResponse(200, subscription, "subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channel id is invalid");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "channel not found");
  }
  let subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber"
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "subscriber id is invalid");
  }
  const channel = await User.findById(subscriberId);
  if (!channel) {
    throw new ApiError(404, "channel not found");
  }
  let subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel");
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
