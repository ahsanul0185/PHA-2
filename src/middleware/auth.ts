import type { NextFunction, Request, Response } from "express";
import { UserRole } from "../modules/auth/auth.types";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";

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

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized. You are not allowed to access this resource.",
        });
      }

      req.user = decoded;

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
