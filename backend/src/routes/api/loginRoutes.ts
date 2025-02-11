import { Router } from 'express';
import { loginUser } from '../../middleware/auth';

const router: Router = Router();

router.post('/', (req, res) => {
  loginUser(req, res);
});

export default router;
