import express from "express";
import config from "./config";
import initDB from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";

const app = express();

app.use(express.json());

// initializing db
initDB();

app.get("/", (_, res) => {
  res.json({ message: "Welcome to Vahicle Management System" });
});

app.use("/api/v1/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

app.listen(config.port, () => {
  console.log(`server is running at port ${config.port}`);
});
