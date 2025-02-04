import React from 'react';
import { useEffect, useState } from 'react';
import { Box, TextField, Typography, Paper, Grid } from '@mui/material';
import {
  WidgetData,
  //fetchSpotifyPlaylistCover,
} from '../../data/playlistUtils';

const PinnedMusicComponent: React.FC = () => {
  const [pinnedPlaylists, setPinnedPlaylists] = useState<WidgetData[]>([]);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      console.error('No username found');
      return;
    }
    fetchPlaylistsData(username);
  }, [username]);

  const fetchPlaylistsData = async (username: string) => {
    try {
      const accessToken = window.localStorage.getItem('spotify_token');
      if (!accessToken) {
        console.error('Access token is missing');
        return;
      }

      const response = await fetch(
        `http://localhost:8000/api/profile/getPinnedPlaylists/${username}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem('jwttoken')}`,
          },
        }
      );

      const { pinnedPlaylists } = await response.json();

      const playlistPromises = pinnedPlaylists.map((playlistId: string) =>
        fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
          .then((res) => res.json())
          .then((playlistData) => ({
            id: playlistId,
            cover: playlistData.images[0]?.url || 'path/to/default-image.jpg', // Default image if no cover is found
          }))
      );

      const playlists = await Promise.all(playlistPromises);
      setPinnedPlaylists(playlists);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  return (
    <Paper sx={{ p: 3, bgcolor: '#ECE6F0' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        PINNED MUSIC
      </Typography>
      <TextField
        fullWidth
        placeholder="Pinned Music"
        variant="outlined"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            bgcolor: '#F5EFF7',
            '&:hover fieldset': {
              borderColor: '#000000',
            },
          },
        }}
      />
      <Grid container spacing={2}>
        {pinnedPlaylists.length > 0 ? (
          pinnedPlaylists.map((playlist, i) => (
            <Grid item xs={4} key={playlist.id}>
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '100%',
                  bgcolor: '#FEF7FF',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundImage: `url(${playlist.cover})`,
                  border: '1px solid #ddd',
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    textAlign: 'center',
                    padding: '4px',
                    fontSize: '12px',
                  }}
                >
                  {playlist.title}
                </Typography>
              </Box>
            </Grid>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{ mt: 2, textAlign: 'center', width: '100%' }}
          >
            No pinned playlists available.
          </Typography>
        )}
      </Grid>
    </Paper>
  );
};

export default PinnedMusicComponent;
