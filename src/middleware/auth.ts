import type { NextFunction, Request, Response } from "express";
import { UserRole } from "../types/auth";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../config/db";

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authToken = req.header("authorization");

      if (!authToken) {
        return res.status(401).json({
          success: false,
          message: "No token provided.",
        });
      }

      const token = authToken.split(" ")[1] as string;

      const decoded = jwt.verify(token, config.jwt_sectret) as JwtPayload;

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      }

      const userResult = await pool.query(
        `SELECT id, name, email, phone, role FROM users WHERE email=$1`,
        [decoded.email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User no longer exists.",
        });
      }

      const user = userResult.rows[0];

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized. You are not allowed to access this resource.",
        });
      }

      req.user = user;

      return next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

export default auth;
