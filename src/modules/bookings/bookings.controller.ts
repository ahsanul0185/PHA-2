import type { Request, Response } from "express";
import { bookingServices } from "./bookings.services";

const createBooking = async (req: Request, res: Response) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = req.body;

  try {
    if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const result = await bookingServices.createBooking({
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
    });

    if (!result?.success) {
      return res.status(400).json({
        success: false,
        message: result?.message,
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
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

export const bookingController = { createBooking };
