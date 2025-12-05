import type { Request, Response } from "express"
import { userServices } from "./users.services";

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await userServices.getAllUsers();

        if (result.rows.length === 0) {
            res.status(200).json({
                success: true,
                message: "No users found",
                data: []
            })
        }

        res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            data: result.rows
        })

    } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error,
    });
    }
}


export const userController = { getAllUsers }

