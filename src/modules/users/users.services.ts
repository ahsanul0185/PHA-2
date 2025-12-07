import { pool } from "../../config/db";

const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM users`
  );
  return result;
};

const updateUser = async (paylaod: Record<string, unknown>) => {
  const { userId, ...updates } = paylaod;

  const setClauses = Object.keys(updates).map(
    (key, index) => `${key} = $${index + 1}`
  );

  if (setClauses.length === 0) {
    return { success: false, message: "No fields provided" };
  }

  const values = Object.values(updates);

  const result = await pool.query(
    `
      UPDATE users
      SET ${setClauses.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length + 1}
      RETURNING id, name, email, phone, role;
    `,
    [...values, userId]
  );

  if (result.rows.length === 0) {
    return { success: false, message: "No users found with the id" };
  }

  return { success: true, user: result.rows[0] };
};

const deleteUser = async (paylaod: Record<string, unknown>) => {
  const { userId } = paylaod;

  const bookingResult = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [userId]
  );

  if (bookingResult.rows.length > 0) {
    return { success: false, message: "User has active bookings" };
  }

  const result = await pool.query(
    `DELETE from users WHERE id = $1 RETURNING *`,
    [userId]
  );
  if (result.rows.length === 0) {
    return { success: false, message: "No users found with the id" };
  }
  return { success: true };
};

export const userServices = { getAllUsers, updateUser, deleteUser };
