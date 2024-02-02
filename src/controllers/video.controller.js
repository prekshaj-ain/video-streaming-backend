import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  deleteVideoFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  // validation not empty
  // check for video and thumbnail image
  // upload on cloudinary
  // create video object in db
  // return res
  if ([title, description].some((field) => field?.trim() == "")) {
    throw new ApiError(400, "All fields are required");
  }
  // console.log(req.files);
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail and video file both are required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  //   console.log("videoFile", videoFile);
  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Thumbnail and video file both are required");
  }
  const videoDuration = videoFile.duration.toFixed();
  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoDuration,
    owner: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video Created Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  // check if video is valid or not
  // find video from db
  // return res
  console.log(videoId);
  const isVideoIdValid = isValidObjectId(videoId);
  if (!isVideoIdValid) {
    throw new ApiError(400, "Invalid video id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video does not exists");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const isVideoIdValid = isValidObjectId(videoId);
  if (!isVideoIdValid) {
    throw new ApiError(400, "Invalid video Id");
  }
  const thumbnailLocalPath = req.file?.path;

  const { title, description } = req.body;
  if (!title || !description || !thumbnailLocalPath) {
    throw new ApiError(400, "All fields are required");
  }
  const { thumbnail: oldThumbnail } =
    await Video.findById(videoId).select("thumbnail");
  let publicId = oldThumbnail.split("/").pop().split(".")[0];
  //   console.log(publicId);
  await deleteFromCloudinary(publicId);

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading on cloudinary");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video details updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  const isVideoIdValid = isValidObjectId(videoId);
  if (!isVideoIdValid) {
    throw new ApiError(400, "Invalid video Id");
  }
  const { thumbnail, videoFile } = await Video.findById(videoId).select(
    "thumbnail videoFile"
  );
  let thumbnailId = thumbnail.split("/").pop().split(".")[0];
  let videoFileId = videoFile.split("/").pop().split(".")[0];
  // console.log(videoFile);
  await Promise.all([
    deleteFromCloudinary(thumbnailId),
    deleteVideoFromCloudinary(videoFileId),
  ]);
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(404, "Video not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const isVideoIdValid = isValidObjectId(videoId);
  if (!isVideoIdValid) {
    throw new ApiError(400, "Invalid video Id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "No video found");
  }
  video.isPublished = !video.isPublished;
  const updatedVideo = await video.save();
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedVideo, "Publish status toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
