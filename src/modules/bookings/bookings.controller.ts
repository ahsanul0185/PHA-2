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
      message: error.message,
      errors: error,
    });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.getAllBookings({ user: req.user });

    if (result.rows.length === 0) {
      res.status(200).json({
        success: true,
        message: "No bookings found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { status} = req.body;

  try {

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      })
    }

    if (!['active', 'cancelled', 'returned'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active', 'cancelled' or 'returned'",
      })
    }

    const result = await bookingServices.updateBooking({
      bookingId,
      status,
      user : req.user,
    });

    if (!result?.success) {
      return res.status(400).json({
        success: false,
        message: result?.message,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

export const bookingController = {
  createBooking,
  getAllBookings,
  updateBooking,
};
