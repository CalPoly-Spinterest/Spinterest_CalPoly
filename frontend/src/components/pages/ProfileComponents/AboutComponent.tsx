import React from 'react';
import axios from 'axios';
import { FunctionComponent, useEffect, useState } from 'react';
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  LocationOn as LocationOnIcon,
  AccountCircle as AccountCircleIcon,
  MusicNote as MusicNoteIcon,
  SaveAlt as SaveAltIcon,
} from '@mui/icons-material';
import {
  Box,
  TextField,
  Typography,
  Grid,
  IconButton,
  Icon,
} from '@mui/material';

interface AbtFavResponse {
  location: string;
  links: string;
  biography: string;
  favorites: {
    genre: string[];
    artist: string[];
    album: string[];
  };
}

interface AboutComponentProps {
  isOwnProfile: boolean;
  profileUsername: string;
}

const AboutComponent: React.FC<AboutComponentProps> = ({
  isOwnProfile,
  profileUsername,
}) => {
  const [isEditable, setIsEditable] = useState(false);
  const [location, setLocation] = useState('');
  const [links, setLinks] = useState('');
  const [biography, setBiography] = useState('');
  const [favgen1, setText1] = useState('');
  const [favgen2, setText2] = useState('');
  const [fava1, setText3] = useState('');
  const [fava2, setText4] = useState('');
  const [favalb1, setText5] = useState('');
  const [favalb2, setText6] = useState('');
  const fetchData = async () => {
    try {
      // Use profileUsername instead of localStorage
      const responseAbtFav = await axios.get<AbtFavResponse>(
        'http://localhost:8000/profile/logProfileInput',
        { params: { username: profileUsername } }
      );

      const dataFields = responseAbtFav.data;

      // Existing data setting logic remains the same
      setLocation(dataFields.location);
      setLinks(dataFields.links);
      setBiography(dataFields.biography);
      setText1(dataFields.favorites.genre[0] || '');
      setText2(dataFields.favorites.genre[1] || '');
      setText3(dataFields.favorites.artist[0] || '');
      setText4(dataFields.favorites.artist[1] || '');
      setText5(dataFields.favorites.album[0] || '');
      setText6(dataFields.favorites.album[1] || '');
    } catch (error) {
      console.error('Error fetching dataFields:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profileUsername]);

  const handleIconClick = async () => {
    const updatedData = {
      location,
      links,
      biography,
      favgen1: favgen1 || '', // Fallback to empty string if undefined
      favgen2: favgen2 || '',
      fava1: fava1 || '',
      fava2: fava2 || '',
      favalb1: favalb1 || '',
      favalb2: favalb2 || '',
    };

    const username = isOwnProfile
      ? profileUsername
      : localStorage.getItem('username');
    if (!username) {
      console.error('No username found');
      return;
    }

    if (isEditable) {
      console.log('Location:', location);
      console.log('Links:', links);
      console.log('Biography:', biography);
      console.log('Favorite Genre 1:', favgen1);
      console.log('Favorite Genre 2:', favgen2);
      console.log('Favorite Artist 1:', fava1);
      console.log('Favorite Artist 2:', fava2);
      console.log('Favorite Album 1:', favalb1);
      console.log('Favorite Album 2:', favalb2);
    }

    try {
      await axios.post('http://localhost:8000/profile/logProfileInput', {
        ...updatedData,
        username,
      });
    } catch (error) {
      console.error('Error: About and Favorite not saved', error);
    }

    setIsEditable((prev) => !prev);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* About Section */}
      <Box sx={{ flex: 1, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">ABOUT</Typography>
          {isOwnProfile ? (
            <IconButton onClick={handleIconClick}>
              {isEditable ? <SaveAltIcon /> : <EditIcon />}
            </IconButton>
          ) : null}
        </Box>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              id="location"
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                readOnly: !isEditable,
                startAdornment: (
                  <Icon>
                    <LocationOnIcon />
                  </Icon>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              id="spotify"
              label="Spotify"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              InputProps={{
                readOnly: !isEditable,
                startAdornment: (
                  <Icon>
                    <MusicNoteIcon />
                  </Icon>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              id="biography"
              label="User Bio"
              multiline
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              fullWidth
              maxRows={3}
              InputProps={{
                readOnly: !isEditable,
                startAdornment: (
                  <Icon>
                    <AccountCircleIcon />
                  </Icon>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Favorites Section */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          FAVORITES
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              id="favgen1"
              fullWidth
              placeholder="Favorite Genre"
              variant="outlined"
              sx={{ mb: 2 }}
              value={favgen1}
              onChange={(e) => setText1(e.target.value)}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
            <TextField
              id="fava1"
              fullWidth
              placeholder="Favorite Artist"
              variant="outlined"
              sx={{ mb: 2 }}
              value={fava1}
              onChange={(e) => setText3(e.target.value)}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
            <TextField
              id="favalb1"
              fullWidth
              placeholder="Album #1"
              variant="outlined"
              value={favalb1}
              onChange={(e) => setText5(e.target.value)}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id="favgen2"
              fullWidth
              placeholder="Favorite Genre"
              variant="outlined"
              sx={{ mb: 2 }}
              value={favgen2}
              onChange={(e) => setText2(e.target.value)}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
            <TextField
              id="fava2"
              fullWidth
              placeholder="Favorite Artist"
              variant="outlined"
              sx={{ mb: 2 }}
              value={fava2}
              onChange={(e) => setText4(e.target.value)}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
            <TextField
              id="favalb2"
              fullWidth
              placeholder="Album #2"
              variant="outlined"
              value={favalb2}
              onChange={(e) => setText6(e.target.value)}
              InputProps={{
                readOnly: !isEditable,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
export default AboutComponent;
