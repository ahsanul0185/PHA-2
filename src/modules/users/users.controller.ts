import type { Request, Response } from "express";
import { userServices } from "./users.services";
import { UserRole } from "../auth/auth.types";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUsers();

    if (result.rows.length === 0) {
      res.status(200).json({
        success: true,
        message: "No users found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const updates = req.body;
  const { userId } = req.params;

  try {
    if (req.user?.role !== UserRole.Admin) {
      if (req.user?.id !== Number(userId)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to perform this action",
        });
      }
    }

    const result = await userServices.updateUser({ userId, ...updates });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};


const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {

    const result = await userServices.deleteUser({ userId });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully", 
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};



export const userController = { getAllUsers, updateUser, deleteUser };
