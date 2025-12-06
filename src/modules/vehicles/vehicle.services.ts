import { pool } from "../../config/db";

const createVehicle = async (payload: Record<string, any>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;

  const isVehicleExists = await pool.query(
    `SELECT * FROM vehicles WHERE registration_number = $1`,
    [registration_number]
  );

  if (isVehicleExists.rows.length > 0) {
    throw new Error("Vehicle with this registration number already exists");
  }

  const result = await pool.query(
    `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1, $2, $3, $4, $5) RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status`,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result.rows[0];
};


const getAllVehicles = async () => {
  const result = await pool.query(`SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles`);
  return result.rows;
};

const getVehicleById = async (payload: Record<string, unknown>) => {
    const vehicleId = Number(payload.vehicleId);
  const result = await pool.query(
    `SELECT id, vehicle_name, type, registration_number, daily_rent_price, availability_status FROM vehicles WHERE id = $1`,
    [vehicleId]
  );

  if (result.rows.length === 0) {
    return { success: false, message: "No vehicle found with the id" };
  }

  return {success : true, data : result.rows[0]};
  
};


const updateVehicle = async (payload: Record<string, unknown>) => {

  const {vehicleId, ...updates} = payload

  const setClauses = Object.keys(updates).map(
    (key, index) => `${key} = $${index + 1}`
  );

  if (setClauses.length === 0) {
    return { success: false, message: "No fields provided" };
  }

  const values = Object.values(updates);

    const result = await pool.query(
    `
      UPDATE vehicles
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING id, vehicle_name, type, registration_number, daily_rent_price, availability_status;
    `,
    [...values, vehicleId]
  );

  if (result.rows.length === 0) {
    return { success: false, message: "No vehicle found with the id" };
  }


  return {success : true, data : result.rows[0]};
  
};

const deleteVehicle = async (paylaod: Record<string, unknown>) => {
    const {vehicleId} = paylaod;

    const result = await pool.query(`DELETE from vehicles WHERE id = $1 RETURNING *`, [vehicleId])
  if (result.rows.length === 0) {
    return { success: false, message: "No vehicle found with the id" };
  }
    return {success : true}

}

export const vehicleServices = { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle };
