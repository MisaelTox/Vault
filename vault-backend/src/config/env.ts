import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || "3000",
  IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID || "",
  IGDB_CLIENT_SECRET: process.env.IGDB_CLIENT_SECRET || "",
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  DYNAMO_TABLE_NAME: process.env.DYNAMO_TABLE_NAME || "vault-games",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  PIN_TOX: process.env.PIN_TOX || "",
  PIN_JEDIS: process.env.PIN_JEDIS || "",
  PIN_CHANGO: process.env.PIN_CHANGO || "",
};
