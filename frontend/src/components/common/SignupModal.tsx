import React, { useState } from 'react';
import {
  Button,
  Modal,
  TextField,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface SignupModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
}

export const SignupModal = ({ open, setOpen }: SignupModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignupClick = async () => {
    try {
      setLoading(true);
      if (password !== verifyPassword) {
        setError('Passwords do not match');
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_SITE_BASE_URL}/api/user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        }
      );
      if (response.ok) {
        localStorage.setItem('username', username);
        localStorage.setItem(
          'jwttoken',
          await response.json().then((data) => data.token)
        );
        setOpen(false);
        console.log('yay going to profile');
        localStorage.setItem('firstlogin', 'true');
        window.location.href = `https://accounts.spotify.com/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${process.env.REACT_APP_SITE_BASE_URL}/login&scope=user-read-email%20user-read-private%20user-library-read%20user-library-modify`;

        // does spotify return any type of access code after redirect? could use that instead

        // make a req to backend route to add /me id to database
        // pass username, refreshToken, and accessToken
        handleSaveSpotifyId(username);
      } else {
        const errorMessage = await response.json().then((data) => data.message);
        setError(`Failed to sign up: ${errorMessage}`);
      }
    } catch (error) {
      setError(`Failed to sign up: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSpotifyId = async (accessToken: string) => {
    try {
      const response = await fetch(`/api/user/${username}/saveSpotifyId`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwttoken')}`,
        },
        body: JSON.stringify({ accessToken }),
      });
      if (!response.ok) {
        throw new Error('Failed to save Spotify ID');
      }
      console.log('Spotify ID saved successfully');
    } catch (error) {
      console.error('Error saving Spotify ID:', error);
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Paper
          sx={{
            padding: 4,
            width: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ fontWeight: '800', mb: 5 }}
          >
            Sign Up to Spinterest
          </Typography>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            required={true}
            slotProps={{
              inputLabel: {
                required: false,
              },
            }}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            required={true}
            slotProps={{
              inputLabel: {
                required: false,
              },
            }}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            required={true}
            slotProps={{
              inputLabel: {
                required: false,
              },
            }}
            onChange={(e) => setVerifyPassword(e.target.value)}
          />
          {/* <SpotifyLoginButton /> */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'end',
              width: '100%',
              marginTop: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleSignupClick}
              disabled={loading}
              sx={{ marginRight: 2, textTransform: 'none' }}
            >
              Sign Up
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpen(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
          </Box>
          {error && (
            <Typography color="error" sx={{ marginTop: 2 }}>
              {error}
            </Typography>
          )}
        </Paper>
      </Box>
    </Modal>
  );
};
