import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is invalid");
  }
  if (content.trim() == "") {
    throw new ApiError(400, "content is required");
  }
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  const createdComment = await Comment.findById(comment._id);
  if (!createdComment) {
    throw new ApiError(500, "Something went wrong while creating comment");
  }
  res
    .status(201)
    .json(new ApiResponse(200, createdComment, "Comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "comment id is invalid");
  }
  if (content.trim() == "") {
    throw new ApiError(400, "content is required");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(404, "comment not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "comment id is invalid");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(404, "comment not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
