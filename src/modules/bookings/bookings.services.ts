import { pool } from "../../config/db";
import { UserRole, type User } from "../auth/auth.types";

const createBooking = async (payload: Record<string, unknown>) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const customerExits = await pool.query(
    `
        SELECT * FROM users WHERE id = $1
    `,
    [customer_id]
  );

  if (!customerExits.rows[0]) {
    return { success: false, message: "Customer does not exist" };
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
    const user : User = payload.user;

    if (user.role === UserRole.Admin) {
        const result = await pool.query(`SELECT * FROM bookings`)
        return result
    }

    const result = await pool.query(`SELECT * FROM bookings WHERE customer_id = $1`, [user.id])

   return result

}

export const bookingServices = { createBooking, getAllBookings};
