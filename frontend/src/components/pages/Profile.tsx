import React, { FunctionComponent, useState, useEffect } from 'react';
import axios from 'axios';
import { getRefreshedToken, logout } from '../data/SpotifyAuth';
import { useNavigate } from 'react-router-dom';
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
  id: string;
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
  following: string[];
  followers: string[];
}

export interface Friend {
  id: string;
  name: string;
  images?: { url: string }[];
}

export const Profile: FunctionComponent = () => {
  const localStorageUsername = window.localStorage.getItem('username');
  const accessToken = window.localStorage.getItem('spotify_token');
  const refreshToken = window.localStorage.getItem('spotify_refresh_token');
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [friends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [following, setFollowing] = useState<boolean>(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [myData, setMyData] = useState<User | null>(null);

  const navigate = useNavigate();
  const username = window.location.pathname.split('/').pop();

  const fetchProfile = async () => {
    if (!accessToken && !refreshToken) return;

    // the purpose of this ugly looking code is to check if you are trying to view YOUR profile or someone elses,
    // you shouldn't be able to EDIT someone elses account which is why we need to check

    // the route should include a ${username} param to fetch the user's data
    try {
      const response = await fetch(
        `http://localhost:8000/api/user/${username}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to get user data');
      }
      const userData = await response.json();
      console.log('User Data:', userData);
      setUserData(userData);
      // spotifyId of the user you want to fetch (could be you, or someone else, doesn't matter just a parm to profile component)
      const userSpotifyId = userData.spotifyId;

      // fetch YOUR spotify ID directly from the Spotify API
      let selfSpotifyDataResponse = await fetch(
        `https://api.spotify.com/v1/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log('YOUR profile response', selfSpotifyDataResponse);

      if (selfSpotifyDataResponse.status === 401 && refreshToken) {
        await getRefreshedToken(refreshToken);
        selfSpotifyDataResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('spotify_token')}`,
          },
        });
      }

      const selfProfileData = await selfSpotifyDataResponse.json();
      const selfProfileSpotifyId = selfProfileData.id;

      const selfDataResponse = await fetch(
        `http://localhost:8000/api/user/spotify/${selfProfileSpotifyId}?username=${localStorageUsername}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const myProfileData = await selfDataResponse.json();
      setMyData(myProfileData);
      const myMongoId = myProfileData._id;
      console.log('My Profile Data:', myProfileData);

      // Check if the profile's Spotify ID matches the user's Spotify ID
      if (selfProfileSpotifyId === userSpotifyId) {
        // IF THIS IS YOUR PROFILE YOU ARE VIEWING, LOAD YOUR PROFILE DATA
        setIsOwnProfile(true);
        console.log('Profile Data Fetched:', selfProfileData);
        setProfile({
          display_name: selfProfileData.display_name,
          images: selfProfileData.images || [],
        });
      } else {
        // IF IT IS NOT YOUR PROFILE, LOAD THE PROFILE DATA OF THE USER YOU ARE VIEWING
        setIsOwnProfile(false);
        const otherspotifyDataResponse = await fetch(
          // returns spotify user data from SPOTIFY API, this contains the display name and profile picture
          `https://api.spotify.com/v1/users/${userSpotifyId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const otherProfileData = await otherspotifyDataResponse.json();
        console.log(userData.followers);
        setFollowing(userData.followers.includes(myMongoId));
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
        `http://localhost:8000/api/user/${username}`,
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

  const handleFollowToggle = async () => {
    if (!accessToken && !refreshToken) return;

    if (following) {
      try {
        const response = await axios.put(
          `http://localhost:8000/api/user/${username}/unfollow`,
          {
            headers: {
              authorization: localStorage.getItem('jwttoken'),
            },
            unfollower: myData?.username,
          }
        );

        if (response.status === 200) {
          setFollowing(false);
        }
      } catch (error) {
        console.error('Error unfollowing user:', error);
      }
    } else {
      try {
        const response = await axios.put(
          `http://localhost:8000/api/user/${username}/follow`,
          {
            headers: {
              authorization: localStorage.getItem('jwttoken'),
            },
            follower: myData?.username,
          }
        );

        if (response.status === 200) {
          setFollowing(true);
        }
      } catch (error) {
        console.error('Error following user:', error);
      }
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
              {isOwnProfile ? (
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
              ) : null}
              {!isOwnProfile ? (
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  onClick={handleFollowToggle}
                >
                  {following ? 'Unfollow' : 'Follow'}
                </Button>
              ) : null}
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
          <AboutComponent isOwnProfile={isOwnProfile} />
        </Paper>

        <PinnedMusicComponent />
      </Box>
    </Box>
  );
};
