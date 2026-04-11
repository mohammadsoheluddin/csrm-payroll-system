import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT || "5000",
  node_env: process.env.NODE_ENV || "development",
  database_url: process.env.DATABASE_URL || "",
  jwt_access_secret: process.env.JWT_ACCESS_SECRET || "",
  jwt_access_expires: process.env.JWT_ACCESS_EXPIRES || "15m",
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || "",
  jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES || "7d",
};

export default config;
