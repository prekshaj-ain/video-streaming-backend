import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (content.trim() == "") {
    throw new ApiError(400, "content is required");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  const createdTweet = await Tweet.findById(tweet._id);
  if (!createTweet) {
    throw new ApiError(500, "Something went wrong while creating tweet");
  }
  res
    .status(201)
    .json(new ApiResponse(200, createdTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "user id is invalid");
  }
  const allTweets = await Tweet.find({ owner: userId });
  if (!allTweets) {
    throw new ApiError(404, "tweets not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, allTweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  //   validate tweetId
  const isTweetIdValid = isValidObjectId(tweetId);
  if (!isTweetIdValid) {
    throw new ApiError(400, "Invalid tweet Id");
  }
  //   validate content
  if (content.trim() == "") {
    throw new ApiError(400, "Content is required");
  }
  //   find and update
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const isTweetIdValid = isValidObjectId(tweetId);
  if (!isTweetIdValid) {
    throw new ApiError(400, "Invalid tweet Id");
  }
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
