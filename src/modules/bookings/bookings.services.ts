import { pool } from "../../config/db";
import { UserRole, type User } from "../../types/auth";
import type { Booking } from "../../types/bookings";

const createBooking = async (payload: Record<string, any>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date, user } =
    payload;

  const customerExits = await pool.query(
    `
        SELECT * FROM users WHERE id = $1
    `,
    [customer_id]
  );

  if (!customerExits.rows[0]) {
    return { success: false, message: "Customer does not exist" };
  }

  if (user.role !== UserRole.Admin && user.id !== customer_id) {
    return {
      success: false,
      message: "You are not authorized to perform this action",
    };
  }

  const vehicleAvaiable = await pool.query(
    `
        SELECT * FROM vehicles WHERE id = $1 AND availability_status = 'available'
    `,
    [vehicle_id]
  );

  if (!vehicleAvaiable.rows[0]) {
    return { success: false, message: "Vehicle is not available" };
  }

  const startDate = new Date(rent_start_date as string);
  const endDate = new Date(rent_end_date as string);

  if (endDate <= startDate) {
    return {
      success: false,
      message: "End date must be after start date",
    };
  }

  const daily_rent_price = vehicleAvaiable.rows[0].daily_rent_price;
  const number_of_days =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  const total_price = daily_rent_price * number_of_days;

  const result = await pool.query(
    `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      "active",
    ]
  );

  if (!result.rows[0]) {
    return { success: false, message: "Booking creation failed!" };
  }

  const updatedVehicleData = await pool.query(
    `UPDATE vehicles SET availability_status = $2 WHERE id = $1 RETURNING vehicle_name, daily_rent_price`,
    [vehicle_id, "booked"]
  );
  const { created_at, updated_at, ...bookingData } = result.rows[0];
  const responseData = { ...bookingData, vehicle: updatedVehicleData.rows[0] };

  return { success: true, data: responseData };
};

const getAllBookings = async (payload: Record<string, any>) => {
  const user: User = payload.user;

  if (user.role === UserRole.Admin) {
    const result = await pool.query(
      `SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings`
    );
    return result;
  }

  const result = await pool.query(
    `SELECT id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings WHERE customer_id = $1`,
    [user.id]
  );

  return result;
};

const updateBooking = async (payload: Record<string, any>) => {
  const { status, user, bookingId } = payload;

  if (user.role === UserRole.Admin) {
    const bookingResult = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return { success: false, message: "No booking found with the id" };
    }
    const vehicleId = bookingResult.rows[0].vehicle_id;
    const vehicleResult = await pool.query(
      `UPDATE vehicles SET availability_status = $2 WHERE id = $1 RETURNING availability_status`,
      [vehicleId, "available"]
    );

    const { created_at, updated_at, ...updatedBooking } = bookingResult.rows[0];
    const responseData = {
      ...updatedBooking,
      vehicle: { ...vehicleResult.rows[0] },
    };

    return {
      success: true,
      message: "Booking marked as returned. Vehicle is now available",
      data: responseData,
    };
  }

  if (user.role === UserRole.Customer && status === "cancelled") {
    const bookingResult = await pool.query(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return { success: false, message: "No booking found with the id" };
    }

    if (bookingResult.rows[0].customer_id !== user.id) {
      return {
        success: false,
        message: "You are not authorized to update this booking",
      };
    }

    const bookingStartDate = new Date(bookingResult.rows[0].rent_start_date);
    const todayDate = new Date();

    if (bookingStartDate.getTime() <= todayDate.getTime()) {
      return {
        success: false,
        message: "You cannot cancel a booking that has already started",
      };
    }

    const updatedBookingResult = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status = $2 WHERE id = $1 RETURNING availability_status`,
      [updatedBookingResult.rows[0].vehicle_id, "available"]
    );

    const { created_at, updated_at, ...rest } = updatedBookingResult.rows[0];
    return {
      success: true,
      message: "Booking cancelled successfully",
      data: rest,
    };
  }

  return { success: false, message: "Invalid action" };
};

const autoReturnBookings = async (payload: Record<string, any>) => {
  const { bookings } = payload;

  const updatedBookings = await Promise.all(
    bookings.map(async (booking: Booking) => {
      const endDate = new Date(booking.rent_end_date);
      const today = new Date();

      if (today.getTime() > endDate.getTime() && booking.status === "active") {
        const bookingResult = await pool.query(
          `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
          ["returned", booking.id]
        );

        const vehicleId = bookingResult.rows[0].vehicle_id;
        await pool.query(
          `UPDATE vehicles SET availability_status = $2 WHERE id = $1 RETURNING availability_status`,
          [vehicleId, "available"]
        );
        const { created_at, updated_at, ...updatedBooking } =
          bookingResult.rows[0];
        return updatedBooking;
      }

      return booking;
    })
  );

  return updatedBookings;
};

export const bookingServices = {
  createBooking,
  getAllBookings,
  updateBooking,
  autoReturnBookings,
};
