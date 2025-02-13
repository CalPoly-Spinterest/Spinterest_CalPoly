import React from 'react';
import axios from 'axios';
import { PlaylistWidget } from '../pages/DashboardComponents/PlaylistWidget';

export interface Widget {
  id: string;
  cover: string;
  owner: string;
  title: string;
  genres: string[];
  component: React.ReactElement;
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
  tracks: { href: string; total: number };
}

interface Playlist {
  items: unknown[];
}

interface Image {
  url: string;
}

export interface PlaylistResponse {
  items: PlaylistData[];
}

interface Artist {
  id: string;
  name: string;
  genres: string[];
}

interface ArtistResponse {
  artists: Artist[];
}

interface PlaylistTrack {
  track: {
    artists: Artist[];
  };
}

export const fetchPlaylists = async (
  accessToken: string
): Promise<WidgetData[]> => {
  try {
    const response = await axios.get<PlaylistResponse>(
      `${process.env.REACT_APP_API_BASE_URL}/api/spotify/playlists`,
      {
        params: {
          spotifyToken: accessToken,
        },
        headers: {
          authorization: localStorage.getItem('jwttoken'),
        },
      }
    );

    const data = response.data;

    const widgetsData: WidgetData[] = data.items
      .filter((playlist: PlaylistData) => playlist)
      .map((playlist: PlaylistData) => ({
        id: playlist.id,
        cover: playlist.images[0]?.url || '',
        owner: playlist.owner,
        title: playlist.name,
      }));

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
        `${process.env.REACT_APP_API_BASE_URL}/api/spotify/playlists/${playlist.id}`,
        {
          headers: {
            authorization: `${localStorage.getItem('spotify_token')}`,
          },
        }
      );

      //console.log('Playlist in playlistUtils:', response.data);
      const tracks = response.data.items as PlaylistTrack[];
      // console.log('Tracks:', tracks);

      const artists: string[] = tracks.flatMap((track: PlaylistTrack) =>
        track.track.artists.map((artist: Artist) => artist.id)
      );

      // for each artist, find if they're in our db
      const artistsQueryResponse = await axios.post<{
        unsaved: string[];
        saved: string[];
      }>(`${process.env.REACT_APP_API_BASE_URL}/api/artist/status`, {
        ids: artists,
      });
      const { saved, unsaved } = artistsQueryResponse.data;
      const localArtistResponse = await axios.post<Artist[]>(
        `${process.env.REACT_APP_API_BASE_URL}/api/artist/bulkGet`,
        {
          ids: saved,
        }
      );

      // empty array of artists
      const localArtists: Artist[] = localArtistResponse.data;

      let spotifyArtistInfo: ArtistResponse[] = [];
      // Split artist IDs into batches of 50 and make requests
      if (unsaved.length !== 0) {
        const spotifyArtistResponses = await Promise.all(
          Array.from({ length: Math.ceil(unsaved.length / 50) }, (_, i) => {
            const batch = unsaved.slice(i * 50, (i + 1) * 50).join(',');
            return axios.get<ArtistResponse>(
              `${process.env.REACT_APP_API_BASE_URL}/api/spotify/artists?ids=${batch}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
          })
        );
        spotifyArtistInfo = spotifyArtistResponses.flatMap(
          (response) => response.data
        );
      }

      const genres = spotifyArtistInfo.flatMap((artistInfo: ArtistResponse) =>
        artistInfo.artists.flatMap((artist: Artist) => artist.genres)
      );
      const localArtistsGenres = localArtists?.flatMap((artist: Artist) => {
        return artist.genres;
      });

      const allGenres = genres.concat(localArtistsGenres);

      try {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/artist/bulkWrite`,
          {
            artists: spotifyArtistInfo.flatMap((response: ArtistResponse) =>
              response.artists.map((artist: Artist) => ({
                id: artist.id,
                name: artist.name,
                genres: artist.genres,
              }))
            ),
          }
        );
      } catch (error) {
        console.error('Error saving artists:', error);
      }

      const topGenres = await getTopGenres(allGenres);
      // console.log('topGenres', topGenres);
      return {
        id: playlist.id,
        cover: playlist.cover,
        owner: playlist.owner.display_name,
        title: playlist.title,
        genres: topGenres,
        component: (
          <PlaylistWidget
            playlistId={playlist.id}
            cover={playlist.cover}
            owner={playlist.owner.display_name}
            title={playlist.title}
            genres={topGenres}
            dragHandleClass="drag-handle"
            noDragClass="no-drag"
          />
        ),
      };
    })
  );
  // console.log('widgets', widgets);
  return widgets;
};

// later it may be beneficial to create a better algorithm for getting the top genres
export const getTopGenres = async (genres: string[]): Promise<string[]> => {
  //console.log('in getTopGenres');
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
  // check if the widget (playlist) data exists in local storage
  // if not, this means the user has either cleared their local storage or has not visited the dashboard yet
  // if the data does not exist, fetch the playlist data from the spotify api and build the widgets
  let playlists_with_genres: Widget[] = [];
  if (
    !localStorage.getItem('widget_data') ||
    localStorage.getItem('widget_data') === '[]'
  ) {
    //first time loading into dashboard
    const playlists_data = await fetchPlaylists(accessToken);
    // save the data to local storage
    localStorage.setItem('widget_data', JSON.stringify(playlists_data));

    playlists_with_genres = await buildWidgets(playlists_data, accessToken);
  } else {
    // use the local storage data to build the widgets
    // buildWidgets expects an array of WidgetData[]
    console.log('utilizing local storage to build widgets');
    const localWidgetsData: WidgetData[] = JSON.parse(
      localStorage.getItem('widget_data') || '[]'
    );
    playlists_with_genres = await buildWidgets(localWidgetsData, accessToken);
  }
  // returns Widget[] type
  return playlists_with_genres;
};
