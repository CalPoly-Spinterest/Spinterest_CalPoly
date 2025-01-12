import { FunctionComponent, useState, useEffect } from 'react';
import { getRefreshedToken, logout } from '../data/SpotifyAuth';
import { useNavigate } from 'react-router-dom';
import { fetchPlaylists, WidgetData } from '../data/playlistUtils';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Avatar,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import FriendsComponent from './ProfileComponents/FriendsComponent';
import AboutComponent from './ProfileComponents/AboutComponent';
import PinnedMusicComponent from './ProfileComponents/PinnedMusicComponent';

interface SpotifyProfile {
  display_name: string;
  images: { url: string }[];
}

interface User {
  username: string;
  isPrivate: boolean;
  status: string;
  bio: string;
  location: string;
  links: string;
  favorites: {
    genre: string[];
    artist: string[];
    album: string[];
  };
}

interface User {
  username: string;
  isPrivate: boolean;
  status: string;
  bio: string;
  location: string;
  links: string;
  favorites: {
    genre: string[];
    artist: string[];
    album: string[];
  };
}

export interface Friend {
  id: string;
  name: string;
  images?: { url: string }[];
}

export const Profile: FunctionComponent = () => {
  const accessToken = window.localStorage.getItem('spotify_token');
  const refreshToken = window.localStorage.getItem('spotify_refresh_token');
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);

  const navigate = useNavigate();
  const username = window.location.pathname.split('/').pop();

  const fetchProfile = async () => {
    if (!accessToken && !refreshToken) return;

    // get your username

    // check if your spotify id (in db) is the same spotify id as the profile you are trying to view
    try {
      let response = await fetch(`http://localhost:8000/api/user/${username}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }
      const userData = await response.json();
      console.log('User Data:', userData);
      setUserData(userData);
      const userSpotifyId = userData.spotifyId;

      // from that response data get spotify id

      // check if that spotify id is yours

      // Fetch the profile's Spotify ID from Spotify API
      let profileResponse = await fetch(`https://api.spotify.com/v1/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log('profile response', profileResponse);

      if (profileResponse.status === 401 && refreshToken) {
        await getRefreshedToken(refreshToken);
        profileResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('spotify_token')}`,
          },
        });
      }
      const profileData = await profileResponse.json();
      const profileSpotifyId = profileData.id;

      // Check if the profile's Spotify ID matches the user's Spotify ID
      if (profileSpotifyId === userSpotifyId) {
        setIsOwnProfile(true);
        console.log('Profile Data Fetched:', profileData);
        setProfile({
          display_name: profileData.display_name,
          images: profileData.images || [],
        });
      } else {
        setIsOwnProfile(false);
        const otherProfileResponse = await fetch(
          `https://api.spotify.com/v1/users/${userSpotifyId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const otherProfileData = await otherProfileResponse.json();
        console.log('Other Profile Data Fetched:', otherProfileData);
        setProfile({
          display_name: otherProfileData.display_name,
          images: otherProfileData.images || [],
        });
      }
    } catch (error) {
      console.error('Error fetching profile', error);
      setLoadingFriends(false);
    }
  };

  const toggleProfileVisibility = async () => {
    if (!accessToken && !refreshToken) return;

    try {
      const updatedUserData = {
        isPrivate: !userData?.isPrivate,
      };

      const response = await axios.put(
        'http://localhost:8000/api/user',
        updatedUserData
      );

      if (response.status === 200) {
        setUserData((prev) =>
          prev ? { ...prev, isPrivate: !prev.isPrivate } : null
        );
      }
    } catch (error) {
      console.error('Error toggling profile visibility:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [accessToken, refreshToken, username]);
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      {/* Profile and Friends Column */}
      <Box sx={{ flex: { xs: '100%', md: 1 } }}>
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#ECE6F0',
            borderRadius: 2,
            p: 3,
            mb: { xs: 2, md: 4 },
            width: { xs: '100%', md: '90%' },
          }}
        >
          {profile ? (
            <>
              <Avatar
                src={profile.images[0]?.url}
                sx={{ width: 224, height: 224, mb: 3 }}
              />
              <Typography variant="h5">{profile.display_name}</Typography>
              {/* if is own profile, render profile visibility toggle */}
              {isOwnProfile ? (
                <Button
                  variant="contained"
                  onClick={toggleProfileVisibility}
                  startIcon={
                    userData?.isPrivate ? <VisibilityOff /> : <Visibility />
                  }
                >
                  {userData?.isPrivate ? 'Private' : 'Public'}
                </Button>
              ) : null}

              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Avatar
                src="/broken-image.jpg"
                sx={{ bgcolor: '#7C6BBB', width: 224, height: 224 }}
              />
              <TextField
                id="profile-name"
                label="Profile Name"
                sx={{ maxWidth: '80%', mb: 2 }}
              />
            </>
          )}
        </Paper>
        <FriendsComponent friends={friends} loadingFriends={loadingFriends} />
      </Box>

      {/* About, Favorites, and Pinned Music Column */}
      <Box sx={{ flex: { xs: '100%', md: 2 }, mt: { xs: 4, md: 0 } }}>
        {/* About and Favorites Section */}
        <Paper
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            p: 3,
            gap: 2,
            mb: 4,
            bgcolor: '#ECE6F0',
          }}
        >
          <AboutComponent />
        </Paper>

        <PinnedMusicComponent />
      </Box>
    </Box>
  );
};
