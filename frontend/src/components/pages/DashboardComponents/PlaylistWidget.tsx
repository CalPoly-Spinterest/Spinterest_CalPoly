import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import {
  AddOutlined,
  FavoriteBorderOutlined,
  DragIndicator,
  PushPinOutlined,
  PushPin,
} from '@mui/icons-material';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { togglePinPlaylist } from '../../data/playlistUtils';

export const PlaylistWidget = ({
  playlistId,
  cover,
  title,
  owner,
  genres,
  dragHandleClass,
  noDragClass,
}: {
  playlistId: string;
  cover: string | File;
  title: string;
  owner: string;
  genres: string[];
  dragHandleClass: string;
  noDragClass: string;
}) => {
  const [clicked, setClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
  return (
    <Card
      sx={{
        width: '250px',
        height: '420px',
        backgroundColor: '#FEF7FF',
        borderRadius: '20px',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow:
            '0 0 16px rgba(128, 0, 128, 0.2), 0 0 16px rgba(128, 0, 128, 0.2)', // More defined highlight on the right and left borders
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <IconButton
          className={dragHandleClass}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
        >
          <DragIndicator />
        </IconButton>
      )}
      <CardContent className={noDragClass} sx={{ padding: 0 }}>
        {/* <DragIndicator/> */}
        {typeof cover === 'string' ? (
          <Box
            component="img"
            src={cover}
            alt="Cover Image"
            sx={{
              width: '100%',
              height: '250px',
              objectFit: 'cover',
              opacity: 1,
              // marginBottom: '10px',
            }}
          />
        ) : null}
        <Box sx={{ px: 2, height: '64px' }}>
          <Typography
            variant="subtitle1"
            component={'h3'}
            gutterBottom
            sx={{
              color: 'text.primary',
              fontWeight: 'bold',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              //border: '1px solid red',
            }}
          >
            {title}
          </Typography>
          <Typography
            gutterBottom
            sx={{ color: 'text.secondary', fontSize: 14 }}
          >
            {owner}
          </Typography>
        </Box>
        <Box
          sx={{
            paddingTop: 1,
            paddingLeft: 1,
            paddingRight: 1,
            //border: '1px solid #ccc',
          }}
        >
          {/* only horizontal space if not on new line */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              // flexWrap: 'wrap',
              flexWrap: 'nowrap', // Prevent wrapping
              overflowX: 'auto', // Allow horizontal scrolling
              scrollbarWidth: 'thin', // Optional: Make the scrollbar less intrusive
              '&::-webkit-scrollbar': {
                height: '6px', // Optional: Adjust scrollbar height for better UX
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#ccc', // Optional: Style the scrollbar
                borderRadius: '4px',
              },
              justifyContent: 'flex-start',
              width: '100%',
              height: '30px',
              // overflow: 'hidden',
              // textOverflow: 'ellipsis',
              // whiteSpace: 'nowrap',
            }}
          >
            {genres.map((genre) => (
              <Chip
                sx={{ fontSize: '8pt' }}
                key={genre}
                label={genre}
                size="small"
                color="primary"
              />
            ))}
          </Stack>
        </Box>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'flex-end',
            marginTop: '10%',
            width: '100%',
          }}
        >
          <IconButton
            onClick={handlePinClick}
            sx={{
              p: 0, // Remove padding
              m: 0, // Remove margin
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow:
                  '0 0 16px rgba(128, 0, 128, 0.2), 0 0 16px rgba(128, 0, 128, 0.2)', // More defined highlight on the right and left borders
              },
            }}
          >
            {clicked ? <PushPin /> : <PushPinOutlined />}
          </IconButton>
          <FavoriteBorderOutlined
            sx={{
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow:
                  '0 0 16px rgba(128, 0, 128, 0.2), 0 0 16px rgba(128, 0, 128, 0.2)', // More defined highlight on the right and left borders
              },
            }}
          ></FavoriteBorderOutlined>
          <AddOutlined
            sx={{
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow:
                  '0 0 16px rgba(128, 0, 128, 0.2), 0 0 16px rgba(128, 0, 128, 0.2)', // More defined highlight on the right and left borders
              },
            }}
          ></AddOutlined>
        </Stack>
      </CardContent>
    </Card>
  );
};
