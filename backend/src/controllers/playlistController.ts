import { Request, Response } from 'express';
import { getModel } from '../utils/connection';
import { IPlaylist } from '../models/Playlist';
//import mongoose from 'mongoose';

/**
 * Retrieve all playlists
 * @param req
 * @param res
 * @param connection
 * @returns
 * */

export const getAllPlaylists = async (req: Request, res: Response) => {
  try {
    const PlaylistModel = getModel<IPlaylist>('Playlist');
    const playlists = await PlaylistModel.find();
    res.status(200).send(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).send('Error fetching playlists');
  }
};

/**
 * Add a new playlist
 * @param req
 * @param res
 * @returns
 * */
export const addPlaylist = async (req: Request, res: Response) => {
  const PlaylistModel = getModel<IPlaylist>('Playlist');
  try {
    await PlaylistModel.create(req.body);
    res.status(201).send('Playlist created');
  } catch {
    res.status(500).send('Error adding playlist');
  }
};

/**
 * Get a playlist by its ID
 * @param req
 * @param res
 * @returns
 * */
export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const PlaylistModel = getModel<IPlaylist>('Playlist');
    const playlist = await PlaylistModel.findById(req.params.playlistId);
    if (!playlist) {
      res.status(404).send('Playlist not found');
      return;
    }
    res.status(200).send(playlist);
  } catch (err) {
    console.error('Error fetching playlist:', err);
    res.status(500).send('Error fetching playlist');
  }
};

/**
 * Update a playlist by its ID
 * @param req
 * @param res
 * @param connection
 * @returns
 * */
export const updatePlaylistById = async (req: Request, res: Response) => {
  try {
    const PlaylistModel = getModel<IPlaylist>('Playlist');
    const playlist = await PlaylistModel.findById(req.params.playlistId);
    if (!playlist) {
      res.status(404).send('Playlist not found');
      return;
    }
    await playlist.updateOne(req.body);
    res.status(200).send('Playlist updated');
  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(500).send('Error updating playlist');
  }
};

/**
 * Delete a playlist by its ID
 * @param req
 * @param res
 * @returns
 * */
export const deletePlaylistById = async (req: Request, res: Response) => {
  try {
    const PlaylistModel = getModel<IPlaylist>('Playlist');
    const playlist = await PlaylistModel.findById(req.params.playlistId);
    if (!playlist) {
      res.status(404).send('Playlist not found');
      return;
    }
    await playlist.deleteOne();
    res.status(200).send('Playlist deleted');
  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).send('Error deleting playlist');
  }
};

/**
 * Retrieve all of a user's playlists
 * @param req
 * @param res
 * @returns
 */
export const getPlaylistsByUsername = async (req: Request, res: Response) => {
  try {
    const PlaylistModel = getModel<IPlaylist>('Playlist');
    const playlists = await PlaylistModel.find({
      username: req.params.username,
    });
    res.status(200).send(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).send('Error fetching playlists');
  }
};
