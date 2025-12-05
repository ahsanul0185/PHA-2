import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import type { User } from "./auth.types";
import jwt from "jsonwebtoken";
import config from "../../config";

const signupUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  const hashedPassword = bcrypt.hashSync(password as string, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role`,
    [name, email, hashedPassword, phone, role]
  );
  return result.rows[0];
};

const signinUser = async (payload: {
  email: string;
  password: string;
  user: User;
}) => {
  const { password, user } = payload;

  const passwordMatched = bcrypt.compareSync(password, user.password);

  if (!passwordMatched) {
    return { success: false, message: "Password didn't match" };
  }

  const token = jwt.sign(user, config.jwt_sectret, { expiresIn: "7d" });

  const { password: hashedPass, created_at, updated_at, ...userData } = user;

  return { success: true, token, user: userData };
};

const findByEmail = async (email: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0];
};

export const authServices = { signupUser, signinUser, findByEmail };
