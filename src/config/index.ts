import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT,
  db_connection_str: process.env.DB_CONNECTION_STR,
  jwt_sectret: process.env.JWT_SECRET as string,
};

export default config;
