import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

import {
  Dashboard as DashboardIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import { List } from '@mui/material';

interface NavbarProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

interface ItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}
export const Navbar: FunctionComponent<NavbarProps> = (props) => {
  const signedIn = localStorage.getItem('spotify_token');
  const username = localStorage.getItem('username');

  // useEffect(() => {
  //   const fetchSpotId = async () => {
  //     try {
  //       const response = await fetch(`/api/user/getSpotifyId`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ accessToken: signedIn }),
  //       });
  //       if (!response.ok) {
  //         throw new Error('Failed to save Spotify ID');
  //       }
  //       const data = await response.json();
  //       setSpotifyId(data.spotifyId);
  //       console.log('Spotify ID fetched successfully:', data.spotifyId);
  //     } catch (error) {
  //       console.error('Error fetching Spotify ID:', error);
  //     }
  //   };
  //   fetchSpotId();

  // }, [location.pathname]);

  const loggedInItems: ItemProps[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      href: `/profile/${username}`,
      label: 'Profile',
      icon: <ProfileIcon />,
    },
  ];

  const loggedOutItems: ItemProps[] = [
    {
      href: '/login',
      label: 'Login',
      icon: <ProfileIcon />,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: props.expanded ? '180px' : '90px',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: props.expanded ? '180px' : '90px',
          boxSizing: 'border-box',
          backgroundColor: 'secondary.light',
          border: 'none',
          transition: 'width 0.3s ease',
          height: '100%',
        },
      }}
    >
      <List>
        <ListItem component="div" sx={{ width: '90px' }}>
          <ListItemButton
            sx={{
              overflow: 'hidden',
              borderRadius: '24px',
              opacity: 0.6,
            }}
            onClick={() => props.setExpanded(!props.expanded)}
          >
            <MenuIcon />
          </ListItemButton>
        </ListItem>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {(signedIn ? loggedInItems : loggedOutItems).map((item, index) => (
            <ListItem
              key={index}
              component={Link}
              to={item.href}
              sx={{ textDecoration: 'none' }}
            >
              <ListItemButton sx={{ overflow: 'hidden', borderRadius: '24px' }}>
                <ListItemIcon
                  sx={{
                    minWidth: '42px',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    style: {
                      color: 'black',
                      fontWeight: '600',
                      fontFamily: 'Roboto',
                      opacity: 0.6,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </Box>
      </List>
    </Drawer>
  );
};
