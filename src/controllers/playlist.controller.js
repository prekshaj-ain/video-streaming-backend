import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if ([name, description].some((field) => field.trim() == "")) {
    throw new ApiError(400, "All fields are required");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });
  const createdPlaylist = await Playlist.findById(playlist._id);
  if (!createdPlaylist) {
    throw new ApiError(500, "Something went wrong white creating playlist");
  }
  res
    .status(201)
    .json(
      new ApiResponse(200, createdPlaylist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "user id is invalid");
  }
  const playlists = await Playlist.find({ owner: userId });
  if (!playlists || playlists.length == 0) {
    throw new ApiError(404, "playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist id is invalid");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist id is invalid");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is invalid");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  //   check if video is already present in playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in the playlist");
  }
  // Add the video to the playlist
  playlist.videos.push(videoId);

  // Save the updated playlist
  await playlist.save();

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "video added successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist id is invalid");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is invalid");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  // check if video is already present in playlist
  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video does not exists in the playlist");
  }
  // Add the video to the playlist
  playlist.videos.pull(videoId);

  // Save the updated playlist
  await playlist.save();

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playlist id is invalid");
  }
  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
  if (!deletedPlaylist) {
    throw new ApiError(404, "playlist not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!playlistId) {
    throw new ApiError(400, "playlist id is invalid");
  }
  if ([name, description].some((field) => field.trim() == "")) {
    throw new ApiError(400, "All field are required");
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
    throw new ApiError(404, "playlist not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
