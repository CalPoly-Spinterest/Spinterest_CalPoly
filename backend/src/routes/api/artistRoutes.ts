import { Router } from 'express';
import {
  getArtist,
  getArtists,
  getSavedStatus,
  saveArtist,
  saveArtistsBulk,
} from '../../controllers/artistController';

const router: Router = Router();

router.post('/', (req, res) => {
  saveArtist(req, res);
});

router.get('/:artistId', (req, res) => {
  getArtist(req, res);
});

router.post('/status', (req, res) => {
  getSavedStatus(req, res);
});

router.post('/bulkGet', (req, res) => {
  getArtists(req, res);
});

router.post('/bulkWrite', (req, res) => {
  saveArtistsBulk(req, res);
});

export default router;
