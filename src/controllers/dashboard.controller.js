import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const aggregateResults = await Video.aggregate([
    { $match: { owner: req.user._id } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
        totalVideos: { $sum: 1 },
        totalLikes: { $first: { $size: "$likes" } },
        totalSubscibers: { $first: { $size: "$subscribers" } },
      },
    },
    {
      $project: {
        _id: 0,
        totalViews: 1,
        totalVideos: 1,
        totalLikes: 1,
        totalSubscribers: 1,
      },
    },
  ]);

  if (!aggregateResults) {
    throw new ApiError(
      500,
      "something went wrong while generating the results"
    );
  }
  if (aggregateResults.length === 0) {
    throw new ApiError(404, "No channel stats found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        aggregateResults[0],
        "channel stats generated successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const videos = await Video.find({ owner: req.user._id });
  res
    .status(200)
    .json(new ApiResponse(200, videos, "fetched videos successfully"));
});

export { getChannelStats, getChannelVideos };
