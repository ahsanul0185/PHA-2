import {Router} from 'express';
import { bookingController } from './bookings.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../auth/auth.types';

const router = Router();

router.post("/", auth(UserRole.Admin), bookingController.createBooking);
// router.get("/", bookingController.getAllBookings);
// router.put("/:bookingId", bookingController.updateBooking);



export const bookingRoutes = router;