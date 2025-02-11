import { Request, Response } from 'express';
import { getModel } from '../utils/connection';
import { IArtist } from '../models/Artist';

export const saveArtist = async (req: Request, res: Response) => {
  const payload = {
    name: req.body.name,
    id: req.body.id,
    genres: req.body.genres,
  };
  const ArtistModel = getModel<IArtist>('Artist');
  try {
    const existingArtist = await ArtistModel.findOne({
      id: payload.id,
    });
    if (existingArtist) {
      res.status(200).send('Artist already saved');
      return;
    }
    const newArtist = ArtistModel.create(payload);
    res.status(200).send('Artist saved: ' + newArtist);
  } catch (err) {
    console.error('Error saving artist:', err);
    res.status(500).send('Error saving artist');
  }
};

export const saveArtistsBulk = async (req: Request, res: Response) => {
  const ArtistModel = getModel<IArtist>('Artist');
  try {
    const artists = req.body.artists.reduce(
      (acc: IArtist[], artist: IArtist) => {
        if (!acc.find((a) => a.id === artist.id)) {
          acc.push(artist);
        }
        return acc;
      },
      []
    );

    for (const artist of artists) {
      const existingArtist = await ArtistModel.findOne({ id: artist.id });
      if (!existingArtist) {
        await ArtistModel.create({
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
        });
      }
    }
    res.status(200).send('Artists saved successfully');
  } catch (err) {
    console.error('Error saving artists:', err);
    res.status(500).send('Error saving artists');
  }
};

export const getArtist = async (req: Request, res: Response) => {
  const payload = {
    id: req.params.id,
  };
  try {
    const ArtistModel = getModel<IArtist>('Artist');
    const artist = await ArtistModel.findOne({ id: payload.id });
    if (!artist) {
      res.status(404).send('Artist not found');
      return;
    }
    res.status(200).send(artist);
  } catch (err) {
    console.error('Error fetching artist:', err);
    res.status(500).send('Error fetching artist');
  }
};

export const getArtists = async (req: Request, res: Response) => {
  try {
    const ArtistModel = getModel<IArtist>('Artist');
    const artists = await ArtistModel.find({ id: { $in: req.body.ids } });
    res.status(200).send(artists);
  } catch (err) {
    console.error('Error retrieving artists:', err);
    res.status(500).send('Error retrieving artists');
  }
};

export const getSavedStatus = async (req: Request, res: Response) => {
  try {
    const unsaved: string[] = [];
    const saved: string[] = [];
    const ArtistModel = getModel<IArtist>('Artist');
    for (const id of req.body.ids) {
      const existingArtist = await ArtistModel.findOne({ id: id });
      if (!existingArtist) {
        unsaved.push(id);
      } else {
        saved.push(id);
      }
    }
    res.status(200).send({
      saved: saved,
      unsaved: unsaved,
    });
  } catch (e) {
    console.error('Error fetching unsaved artists, ', e);
    res.status(500).send('Error fetching unsaved artists');
  }
};
