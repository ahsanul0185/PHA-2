import {Router} from 'express'
import { userController } from './users.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../auth/auth.types';

const router = Router();

router.get("/", auth(UserRole.Admin), userController.getAllUsers)
router.put("/:userId", auth(UserRole.Admin, UserRole.Customer), userController.updateUser);
router.delete("/:userId", auth(UserRole.Admin), userController.deleteUser)

export const userRoutes = router;