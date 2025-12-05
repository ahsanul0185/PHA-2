import {Router} from 'express';
import { vehicleController } from './vehicle.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../auth/auth.types';

const router = Router();

router.post("/", auth(UserRole.Admin), vehicleController.createVehicle)
router.get("/", vehicleController.getAllVehicles)
router.get("/:vehicleId", vehicleController.getVehicleById)
router.put("/:vehicleId", auth(UserRole.Admin), vehicleController.updateVehicle);
router.delete("/:vehicleId", auth(UserRole.Admin), vehicleController.deleteVehicle);

export const vehicleRoutes = router;