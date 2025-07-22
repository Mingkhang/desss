// File: src/config/env.ts

import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET as string,
  mongodbUri: process.env.MONGODB_URI as string,
  adminUsername: process.env.ADMIN_USERNAME as string,
  adminPassword: process.env.ADMIN_PASSWORD as string,
  payosClientId: process.env.PAYOS_CLIENT_ID as string,
  payosApiKey: process.env.PAYOS_API_KEY as string,
  payosChecksumKey: process.env.PAYOS_CHECKSUM_KEY as string,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
  frontendUrl: process.env.FRONTEND_URL as string,
  
  // SỬA: Thêm dòng này vào
  backendUrl: process.env.BACKEND_URL as string, 
};

// SỬA: Thêm `!config.backendUrl` vào đây để kiểm tra
if (
  !config.mongodbUri ||
  !config.jwtSecret ||
  !config.adminUsername ||
  !config.adminPassword ||
  !config.payosClientId ||
  !config.payosApiKey ||
  !config.payosChecksumKey ||
  !config.frontendUrl || // Thêm cả frontendUrl để chắc chắn
  !config.backendUrl    // Thêm backendUrl
) {
  throw new Error('FATAL ERROR: A required environment variable is missing.');
}

export default config;