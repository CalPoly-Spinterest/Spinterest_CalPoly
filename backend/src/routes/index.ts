import { Router } from 'express';
import userRoutes from './api/userRoutes';
import playlistRoutes from './api/playlistRoutes';
import spotifyRoutes from './api/spotifyRoutes';
import loginRoutes from './api/loginRoutes';
import profileRoutes from './api/profileRoute';

const router = Router();

// Protected routes
router.use('/user', userRoutes);
router.use('/playlist', playlistRoutes);
router.use('/spotify', spotifyRoutes);
router.use('/login', loginRoutes);
router.use('/profile', profileRoutes);

router.get('/', (req, res) => {
  res.status(200).send('API is working');
});

export default router;
