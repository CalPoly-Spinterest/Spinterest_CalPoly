import { Router } from 'express';
import {
  getPinnedPlaylists,
  getProfilePgInfo,
  pinPlaylist,
  updateProfilePgInfo,
} from '../../controllers/profileController';

const profileController: Router = Router();

profileController.post('/logProfileInput', updateProfilePgInfo);
profileController.get('/logProfileInput', getProfilePgInfo);
profileController.put('/pinPlaylist/:username/:playlistId', pinPlaylist);
profileController.get('/getPinnedPlaylists/:username', getPinnedPlaylists);

export default profileController;
