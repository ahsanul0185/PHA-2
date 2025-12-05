import {Router} from 'express'
import { userController } from './users.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../auth/auth.types';

const router = Router();

router.get("/", auth(UserRole.Admin), userController.getAllUsers)

export const userRoutes = router;