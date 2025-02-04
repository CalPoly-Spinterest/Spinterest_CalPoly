import mongoose from 'mongoose';
import { IFavorites } from './Favorites';
import { IPlaylist } from './Playlist';

export interface IUser {
  username: string;
  password: string;
  isPrivate: boolean;
  spotifyId?: string;
  refreshToken?: string;
  status?: string;
  bio?: string;
  location?: string;
  links?: string;
  favorites: IFavorites;
  favoritesId: mongoose.Types.ObjectId;
  annotatedPlaylists?: IPlaylist[];
  pinnedPlaylists?: string[];
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
}

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  isPrivate: { type: Boolean, required: true, default: false },
  spotifyId: String,
  bio: String,
  status: String,
  location: String,
  links: String,
  refreshToken: String,
  favoritesId: { type: mongoose.Schema.Types.ObjectId, ref: 'Favorites' },
  pinnedPlaylists: [{ type: String }],
  annotatedPlaylists: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
  ],
  following: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
    required: true,
    validate: {
      validator: function (value: mongoose.Types.ObjectId[]) {
        return value.length === new Set(value.map(String)).size;
      },
      message: 'Duplicate items are not allowed in the following list',
    },
  },
  followers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
    required: true,
    validate: {
      validator: function (value: mongoose.Types.ObjectId[]) {
        return value.length === new Set(value.map(String)).size;
      },
      message: 'Duplicate items are not allowed in the following list',
    },
  },
});
