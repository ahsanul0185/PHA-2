import type { Request, Response } from "express";
import { vehicleServices } from "./vehicle.services";

const createVehicle = async (req: Request, res: Response) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = req.body;

  try {
    if (
      !vehicle_name ||
      !type ||
      !registration_number ||
      !daily_rent_price ||
      !availability_status
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!["car", "bike", "van", "SUV"].includes(type)) {
      res.status(400).json({
        success: false,
        message: "Vehicle type should be 'car', 'bike', 'van' or 'SUV'",
      });
    }
    if (!["available", "booked"].includes(availability_status)) {
      res.status(400).json({
        success: false,
        message: "Availability status should be 'available' or 'booked'",
      });
    }

    const result = await vehicleServices.createVehicle({ ...req.body });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getAllVehicles();

    if (result.length === 0) {
      res.status(200).json({
        success: true,
        message: "No vehicles found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const result = await vehicleServices.getVehicleById({ vehicleId });

    if (!result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};


const updateVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    const result = await vehicleServices.updateVehicle({ vehicleId, ...req.body });

    if (!result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};



const deleteVehicle = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {

    const result = await vehicleServices.deleteVehicle({ vehicleId });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully", 
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message,
    });
  }
};


export const vehicleController = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
};
