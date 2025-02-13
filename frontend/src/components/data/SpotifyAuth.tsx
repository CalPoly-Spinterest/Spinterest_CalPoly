import React, { FunctionComponent } from 'react';
import { Button, Typography } from '@mui/material';
import axios from 'axios';

export const SpotifyLoginButton: FunctionComponent = () => {
  const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_SITE_BASE_URL}/profile&scope=user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-follow-read%20user-follow-modify`;

  return (
    <Button
      sx={{
        color: 'white',
        bgcolor: 'green',
        '&:hover': {
          bgcolor: 'lightgreen',
        },
      }}
      href={AUTH_URL}
    >
      <Typography sx={{ textTransform: 'none' }}>Connect to Spotify</Typography>
    </Button>
  );
};

export const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_SITE_BASE_URL}/login&scope=user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-follow-read%20user-follow-modify`;

export const fetchAuthToken = async (code: string) => {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: `${process.env.REACT_APP_SITE_BASE_URL}/login`,
      grant_type: 'authorization_code',
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        `Basic ` +
        btoa(
          process.env.REACT_APP_CLIENT_ID +
            ':' +
            process.env.REACT_APP_CLIENT_SECRET
        ),
    },
    json: true,
  };

  try {
    const response = await fetch(authOptions.url, {
      method: 'POST',
      headers: authOptions.headers,
      body: new URLSearchParams(authOptions.form).toString(),
    });
    const data = await response.json();
    console.log('Data:', data);
    const profileOptions = {
      url: 'https://api.spotify.com/v1/me',
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
      json: true,
    };
    const profileData = await fetch(profileOptions.url, {
      headers: profileOptions.headers,
    });
    const id = await profileData.json().then((data) => data.id);
    axios.put(
      `${process.env.REACT_APP_API_BASE_URL}/api/user/${localStorage.getItem('username')}`,
      {
        spotifyId: id,
        refreshToken: data.refresh_token,
      }
    );
    window.localStorage.setItem('spotify_token', data.access_token);
    window.localStorage.setItem('spotify_refresh_token', data.refresh_token);
  } catch (error) {
    console.error('Error fetching auth token', error);
  }
};

export const getRefreshedToken = async (refreshToken: string) => {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        btoa(
          process.env.REACT_APP_CLIENT_ID +
            ':' +
            process.env.REACT_APP_CLIENT_SECRET
        ),
    },
    json: true,
  };

  try {
    const response = await fetch(authOptions.url, {
      method: 'POST',
      headers: authOptions.headers,
      body: new URLSearchParams(authOptions.form).toString(),
    });
    const data = await response.json();
    window.localStorage.setItem('spotify_token', data.access_token);
  } catch (error) {
    console.error('Error fetching auth token', error);
  }
};

export const getAccessToken = () => {
  return window.localStorage.getItem('spotify_token');
};

export const logout = () => {
  window.localStorage.removeItem('spotify_token');
  window.localStorage.removeItem('spotify_refresh_token');
};
