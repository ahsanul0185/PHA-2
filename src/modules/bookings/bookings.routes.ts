import {Router} from 'express';
import { bookingController } from './bookings.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../auth/auth.types';

const router = Router();

router.post("/", auth(UserRole.Admin, UserRole.Customer), bookingController.createBooking);
router.get("/", auth(UserRole.Admin, UserRole.Customer), bookingController.getAllBookings);
router.put("/:bookingId", auth(UserRole.Admin, UserRole.Customer), bookingController.updateBooking);



export const bookingRoutes = router;