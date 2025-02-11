import React, { useEffect, useState } from 'react';
import { AUTH_URL, fetchAuthToken } from '../data/SpotifyAuth';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import logo from '../../assets/logo.png';
import { SignupModal } from '../common/SignupModal';

import '@fontsource/open-sans';

export const Login = () => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { code } = getInfoFromUrl();
      if (!code) return;
      await fetchAuthToken(code);
      const firstLogin = localStorage.getItem('firstlogin') === 'true';
      if (firstLogin) {
        console.log('First login');
        localStorage.removeItem('firstlogin');
        // await loadPlaylists();
      }
      navigate('/dashboard');
    };
    fetchData();
  }, [navigate]);

  const getInfoFromUrl = () => {
    const code = new URLSearchParams(window.location.search).get('code');
    const state = '0';
    window.history.pushState({}, '', '/login');
    return { code, state };
  };

  const handleLoginClick = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        // Store the token securely, e.g., in localStorage or a secure cookie
        localStorage.setItem('jwttoken', data.token);
        localStorage.setItem('username', username);
        setPassword(''); // Clear password from state
        window.location.href = AUTH_URL;
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError(`Failed to log in ${error}`);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid size={2} justifyContent="center">
        <SignupModal open={open} setOpen={setOpen} navigate={navigate} />
        <Box
          sx={{
            mt: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            bgcolor: 'background.default',
            maxWidth: '70%',
            mx: 'auto',
          }}
        >
          <img
            src={logo}
            alt="vinyl record"
            style={{ width: '100px', height: '100px' }}
          />
          <br />
          <Typography
            component="h1"
            variant="h3"
            sx={{
              mb: 1,
              fontWeight: '800',
            }}
          >
            Welcome Back!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Let&apos;s get back to those tunes.
          </Typography>

          <Box
            component="form"
            sx={{
              maxWidth: '40%',
              minWidth: '300px',
              mt: 1,
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={username}
              error={error !== ''}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              slotProps={{
                inputLabel: {
                  required: false,
                },
              }}
              sx={{
                bgcolor: 'rgba(237, 231, 246, 0.4)',
                fontWeight: 'bold',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              autoComplete="current-password"
              error={error !== ''}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                inputLabel: {
                  required: false,
                },
              }}
              sx={{
                bgcolor: 'rgba(237, 231, 246, 0.4)',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                my: 2,
              }}
            ></Box>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleLoginClick}
              sx={{
                py: 1.5,
                borderColor: 'transparent',
                textTransform: 'none', // This will prevent automatic capitalization
              }}
            >
              <Typography variant="body2" color="text.light" display="inline">
                Sign In
              </Typography>
            </Button>
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                display="inline"
              >
                Don&apos;t have an account?{' '}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                display="inline"
                sx={{ textDecoration: 'underline' }} // Underline the text
                onClick={() => setOpen(true)}
              >
                Sign up for Spinterest
              </Typography>
            </Box>

            {/* <Button
                fullWidth
                variant="outlined"
                sx={{
                  mt: 2,
                  py: 1.5,
                  bgcolor: 'rgba(237, 231, 246, 0.4)',
                  borderColor: 'transparent',
                  color: 'text.primary',
                  textTransform: 'none', // This will prevent automatic capitalization
                  '&:hover': {
                    bgcolor: 'rgba(237, 231, 246, 0.6)',
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                  },
                }}
                onClick={() => setOpen(true)}
              >
                Register
              </Button> */}
          </Box>
        </Box>
      </Grid>
    </Box>
  );
};
