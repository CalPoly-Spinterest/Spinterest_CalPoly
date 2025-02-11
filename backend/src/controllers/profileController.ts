import { Request, Response } from 'express';
import { IUser } from '../models/User';
import { getModel } from '../utils/connection';
import { IFavorites } from '../models/Favorites';

/**
 * Updates profile page attributes (status, about section, favorites)
 * @param req
 * @param res
 * @param connection
 * */
export const updateProfilePgInfo = async (req: Request, res: Response) => {
  try {
    const {
      username,
      favgen1,
      favgen2,
      fava1,
      fava2,
      favalb1,
      favalb2,
      ...profileData
    } = req.body;

    const UserM = getModel<IUser>('User');
    const FavoritesM = getModel<IFavorites>('Favorites');
    const user = await UserM.findOne({ username });

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    //updating user profile data
    for (const key in profileData) {
      if (profileData[key] !== undefined) {
        if (key === 'biography') {
          user.bio = profileData[key]; //ensuring bio is saved
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (user as any)[key] = profileData[key];
        }
      }
    }

    console.log(profileData);

    //updating the favorites list
    if (!user.favoritesId) {
      const newFavs = new FavoritesM({
        userId: user._id,
        genre: [favgen1, favgen2].filter(Boolean),
        artist: [fava1, fava2].filter(Boolean),
        album: [favalb1, favalb2].filter(Boolean),
      });
      await newFavs.save();
      user.favoritesId = newFavs._id;
    } else {
      await FavoritesM.findOneAndUpdate(
        { _id: user.favoritesId },
        {
          genre: [favgen1, favgen2].filter(Boolean),
          artist: [fava1, fava2].filter(Boolean),
          album: [favalb1, favalb2].filter(Boolean),
        },
        { new: true }
      );
    }

    // Log all received data to the terminal
    console.log('Received Profile Input:');
    console.log('-------------------');

    // Log each field if it exists
    if (profileData.status) {
      console.log(`Status: ${profileData.status}`);
    } else {
      console.log('Status is undefined or not provided');
    }
    if (profileData.location) {
      console.log(`Location: ${profileData.location}`);
    }
    if (profileData.links) {
      console.log(`Links: ${profileData.links}`);
    }
    if (profileData.biography) {
      console.log(`Biography: ${profileData.biography}`);
    }
    if (profileData.favgen1) {
      console.log(`Favorite Genre 1: ${profileData.favgen1}`);
    }
    if (profileData.favgen2) {
      console.log(`Favorite Genre 2: ${profileData.favgen2}`);
    }
    if (profileData.fava1) {
      console.log(`Favorite Artist 1: ${profileData.fava1}`);
    }
    if (profileData.fava2) {
      console.log(`Favorite Artist 2: ${profileData.fava2}`);
    }
    if (profileData.favalb1) {
      console.log(`Favorite Album 1: ${profileData.favalb1}`);
    }
    if (profileData.favalb2) {
      console.log(`Favorite Album 2: ${profileData.favalb2}`);
    }

    await user?.save();

    res.status(200).json({ message: 'Profile input logged successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error logging profile input:', error.message);
    } else {
      console.error('An unexpected error occurred:', error);
    }
    res.status(500).json({ message: 'Error processing profile input' });
  }
};

/**
 * Retrieves profile page attributes (status, about section, favorites)
 * @param req
 * @param res
 * @param connection
 * */
export const getProfilePgInfo = async (req: Request, res: Response) => {
  try {
    const username = req.query.username as string;

    const UserM = getModel<IUser>('User');
    const user = await UserM.findOne({ username }).populate('favoritesId');

    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    // Sending data fields as the response
    res.status(200).json({
      status: user.status,
      location: user.location,
      links: user.links,
      biography: user.bio,
      favorites: user.favoritesId,
    });
  } catch (error) {
    console.error('Error fetching profile input:', error);
    res.status(500).json({ message: 'Error fetching profile input' });
  }
};

/**
 * Pinning music to the user's pinned music list
 * @param req
 * @param res
 * @returns
 */
export const pinPlaylist = async (req: Request, res: Response) => {
  try {
    const UserModel = getModel<IUser>('User');
    const { username, playlistId } = req.params;

    console.log('Received request to pin/unpin playlist:', {
      username,
      playlistId,
    });

    // Find the user by username
    const user = await UserModel.findOne({ username }).populate(
      'pinnedPlaylists'
    );
    //console.log('Found user:', user);

    if (!user) {
      console.error('User not found');
      res.status(404).send('User not found');
      return;
    }

    if (!user.pinnedPlaylists) {
      user.pinnedPlaylists = [];
    }

    console.log('Current pinned playlists:', user.pinnedPlaylists);

    // Check if playlist is already pinned
    const playlistIndex = user.pinnedPlaylists.findIndex(
      (id) => id != null && id.toString() === playlistId.toString()
    );

    if (playlistIndex >= 0) {
      console.log('Unpinning playlist');
      user.pinnedPlaylists.splice(playlistIndex, 1);
    } else if (playlistId !== null) {
      console.log('Pinning playlist');
      user.pinnedPlaylists.push(playlistId);
    } else {
      console.error('Cannot pin null playlist');
    }

    // Save the user
    await user.save();
    console.log('Updated pinned playlists:', user.pinnedPlaylists);

    res.status(200).send({
      message: 'Pin status updated',
      pinnedPlaylists: user.pinnedPlaylists,
    });
  } catch (err) {
    console.error('Error pinning playlist:', err);
    res.status(500).send('Error pinning playlist');
  }
};

/**
 * Retrieve pinned playlists by user
 * @param req
 * @param res
 */
export const getPinnedPlaylists = async (req: Request, res: Response) => {
  try {
    const UserModel = getModel<IUser>('User');
    const { username } = req.params;

    // Validate input
    if (!username) {
      res.status(400).send('User not found');
      return;
    }

    // Find user by username
    const user = await UserModel.findOne({ username });

    if (!user || !user.pinnedPlaylists || user.pinnedPlaylists.length === 0) {
      res.status(404).send('No pinned playlists found');
      return;
    }

    res.status(200).send({
      message: 'Pinned playlists retrieved successfully',
      pinnedPlaylists: user.pinnedPlaylists,
    });
  } catch (err) {
    console.error('Error fetching pinned playlists:', err);
    res.status(500).send('Error fetching pinned playlist');
  }
};
