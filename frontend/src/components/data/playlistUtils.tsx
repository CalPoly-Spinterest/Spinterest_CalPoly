import React from 'react';
import axios from 'axios';
import { PlaylistWidget } from '../../DashboardComponents/PlaylistWidget';

export interface Widget {
  id: string;
  cover: string;
  // owner: Owner;
  owner: string;
  title: string;
  genres: string[];
  component: React.ReactNode;
}

export interface WidgetData {
  id: string;
  cover: string;
  owner: Owner;
  title: string;
}

export interface Owner {
  display_name: string;
}

export interface PlaylistData {
  id: string;
  images: Image[];
  owner: Owner;
  name: string;
  tracks: any[];
}

interface Playlist {
  items: any[];
}

interface Image {
  url: string;
}

interface PlaylistResponse {
  items: PlaylistData[];
}

interface Artist {
  genres: string[];
}

interface ArtistResponse {
  artists: Artist[];
}

export const fetchPlaylists = async (
  accessToken: string
): Promise<WidgetData[]> => {
  // calls the getplaylists endpoint to get the playlists from the user's spotify account
  // returns an array of Widgets that the dashboard can use to display the playlists
  try {
    const response = await axios.get<PlaylistResponse>(
      'http://localhost:8000/api/spotify/playlists',
      {
        params: {
          spotifyToken: accessToken,
        },
      }
    );

    const data = response.data;

    console.log('Playlists:', data);

    const widgetsData: WidgetData[] = data.items.map(
      (playlist: PlaylistData) => ({
        id: playlist.id,
        cover: playlist.images?.[0]?.url || '',
        owner: playlist.owner,
        title: playlist.name,
      })
    );

    return widgetsData;
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return [];
  }
};

export const buildWidgets = async (
  playlists: WidgetData[],
  accessToken: string
): Promise<Widget[]> => {
  // get playlist data from fetchPlaylists

  playlists = playlists.slice(0, 10);
  // for each playlist, use the id to get the tracks

  // use the id to get the tracks
  // for each track, get the artist
  // for each artist, get the genre

  // count the genres, get top genres
  // return top 3 genres

  const widgets: Widget[] = await Promise.all(
    playlists.map(async (playlist: WidgetData) => {
      const response = await axios.get<Playlist>(
        `http://localhost:8000/api/spotify/playlists/${playlist.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // console.log('Playlist in playlistUtils:', response.data);
      const tracks = response.data.items;
      console.log('Tracks:', tracks);

      const artists = tracks.flatMap((track: any) =>
        track.track.artists.map((artist: any) => artist.id)
      );

      // Split artist IDs into batches of 50 and make requests
      const artistInfoResponses = await Promise.all(
        Array.from({ length: Math.ceil(artists.length / 50) }, (_, i) => {
          const batch = artists.slice(i * 50, (i + 1) * 50).join(',');
          return axios.get<ArtistResponse>(
            `http://localhost:8000/api/spotify/artists?ids=${batch}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
        })
      );
      console.log('artistInfoResponses', artistInfoResponses);
      const allArtistInfo = artistInfoResponses.flatMap(
        (response) => response.data
      );

      const genres = allArtistInfo.flatMap((artist: any) => artist.genres);
      console.log('Genres:', genres);

      const topGenres = await getTopGenres(genres);
      console.log('topGenres', topGenres);

      return {
        id: playlist.id,
        cover: playlist.cover,
        owner: playlist.owner.display_name,
        title: playlist.title,
        genres: topGenres,
        component: (
          <PlaylistWidget
            key={playlist.id}
            cover={playlist.cover}
            owner={playlist.owner.display_name}
            title={playlist.title}
            genres={topGenres}
          />
        ),
      };
    })
  );
  console.log('widgets', widgets);
  return widgets;
};

// later it may be beneficial to create a better algorithm for getting the top genres
export const getTopGenres = async (genres: string[]): Promise<string[]> => {
  console.log('in getTopGenres');
  const genreCount: { [key: string]: number } = {};

  genres.forEach((genre) => {
    genreCount[genre] = (genreCount[genre] || 0) + 1;
  });
  const sortedGenres = Object.keys(genreCount).sort(
    (a, b) => genreCount[b] - genreCount[a]
  );

  // top 3 genres
  return sortedGenres.slice(0, 3);
};

export const returnWidgets = async (): Promise<Widget[]> => {
  const accessToken = window.localStorage.getItem('spotify_token');

  if (!accessToken) {
    console.error('No access token found');
    return [];
  }

  const playlists_data = await fetchPlaylists(accessToken);
  console.log(playlists_data);

  const playlists_with_genres = await buildWidgets(playlists_data, accessToken);

  // returns Widget[] type
  return playlists_with_genres;
};
