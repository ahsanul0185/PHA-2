import express from "express";
import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/users/users.routes";
import { vehicleRoutes } from "./modules/vehicles/vehicle.routes";
import { bookingRoutes } from "./modules/bookings/bookings.routes";

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);


app.get("/", (_, res) => {
  res.json({ message: "Welcome to Vehicle Management System" });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

export default app;
