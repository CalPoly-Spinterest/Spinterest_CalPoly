import axios from 'axios';
import { useState, useEffect } from 'react';
import { Owner, PlaylistData, PlaylistResponse } from './playlistUtils';

export interface PinnedMusicData {
  id: string;
  cover: string;
  owner: Owner;
  title: string;
}

// Pinning playlist
export const togglePinPlaylist = async (
  username: string,
  playlistId: string
) => {
  try {
    const token = localStorage.getItem('jwttoken');
    if (!token) {
      throw new Error('JWT token is missing');
    }

    const response = await axios.put(
      `http://localhost:8000/api/profile/pinPlaylist/${username}/${playlistId}`,
      {},
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('jwttoken')}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error toggling pinned playlist:', error);
    throw error;
  }
};

// Fetching Pinned Music
export const fetchPinPlaylist = async (
  username: string
): Promise<PinnedMusicData[]> => {
  try {
    // Fetch pinned playlists from your backend
    const response = await axios.get<PlaylistResponse>(
      `http://localhost:8000/api/profile/getPinnedPlaylists/${username}`
    );

    const data = response.data;
    console.log('Pinned Playlists:', data);

    // Fetch cover image for each playlist from Spotify API
    const pinnedPlaylists: PinnedMusicData[] = data.items
      .filter((playlist: PlaylistData) => playlist)
      .map((playlist: PlaylistData) => ({
        id: playlist.id,
        cover: playlist.images[0]?.url || '',
        owner: playlist.owner,
        title: playlist.name,
      }));

    return pinnedPlaylists;
  } catch (error) {
    console.error('Error fetching pinned playlists from user:', error);
    return [];
  }
};

export const usePinnedPlaylists = (playlistId: string) => {
  const [clicked, setClicked] = useState(false);
  const [pinnedPlaylists, setPinnedPlaylists] = useState([]);

  useEffect(() => {
    const fetchPinnedPlaylist = async () => {
      const username = localStorage.getItem('username');
      if (!username) {
        console.error('No username found');
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8000/api/profile/getPinnedPlaylists/${username}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem('jwttoken')}`,
            },
          }
        );
        const data = await response.json();
        const pinnedPlaylists = data.pinnedPlaylists;
        setPinnedPlaylists(pinnedPlaylists);
        setClicked(pinnedPlaylists.includes(playlistId));
      } catch (error) {
        console.error('Error fetching pinned playlist.', error);
      }
    };
    fetchPinnedPlaylist();
  }, [playlistId]);

  const handlePinClick = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      console.error('No username found');
      return;
    }

    if (!playlistId) {
      console.error('Playlist ID is undefined');
      return;
    }
    try {
      const updatedPlaylist = await togglePinPlaylist(username, playlistId);
      setClicked((prev) => !prev);
      console.log((updatedPlaylist as { message: string }).message);
    } catch (e) {
      console.log((e as Error).message);
    }
  };

  return { clicked, pinnedPlaylists, handlePinClick };
};
