import { Router } from 'express';

import {
  addPlaylist,
  getAllPlaylists,
  getPlaylistById,
  updatePlaylistById,
  deletePlaylistById,
} from '../../controllers/playlistController';

const router: Router = Router();

router.get('/', getAllPlaylists);
router.post('/', addPlaylist);
router.get('/:playlistId', getPlaylistById);
router.put('/:playlistId', updatePlaylistById);
router.delete('/:playlistId', deletePlaylistById);

export default router;
