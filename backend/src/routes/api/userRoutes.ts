import { Router } from 'express';
import {
  getUserByUsername,
  getAllUsers,
  updateUserByUsername,
  saveUserSpotifyId,
  getUserSpotifyId,
  addFollower,
  getFollowers,
  getFollowing,
  removeFollower,
  getUserBySpotifyId,
  viewProfile,
  searchUsers,
} from '../../controllers/UserController';
import {
  addFavorite,
  getUserFavorites,
  removeFavorite,
  updateFavorite,
} from '../../controllers/favoritesController';
import { getPlaylistsByUsername } from '../../controllers/playlistController';
import { authenticateUser, registerUser } from '../../middleware/auth';

const router = Router();

router.get('/', getAllUsers);
router.post('/', registerUser);

// this route is being replaced by /profile/:username route
router.get('/:username', getUserByUsername);
router.get('/spotify/:spotifyId', getUserBySpotifyId);
router.put('/:username', updateUserByUsername);

// Nested routes for user resources
router.get('/:username/playlist', getPlaylistsByUsername);
router.post('/:username/saveSpotifyId', saveUserSpotifyId);
router.post('/getSpotifyId', getUserSpotifyId);
router.get('/:username/favorites', getUserFavorites);
router.post('/:username/favorites', addFavorite);
router.delete('/:username/favorites', removeFavorite);
router.patch('/:username/favorites', updateFavorite);

// follow + unfollow routes
router.put('/:username/follow', addFollower);
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);
router.put('/:username/unfollow', removeFollower);

//view user profile
router.get('/profile/:username', viewProfile); // updated route

//search user
router.get('/search/:username', searchUsers);
export default router;
