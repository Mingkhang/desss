"use strict";
// File: src/config/env.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    mongodbUri: process.env.MONGODB_URI,
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    payosClientId: process.env.PAYOS_CLIENT_ID,
    payosApiKey: process.env.PAYOS_API_KEY,
    payosChecksumKey: process.env.PAYOS_CHECKSUM_KEY,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
    frontendUrl: process.env.FRONTEND_URL,
    // SỬA: Thêm dòng này vào
    backendUrl: process.env.BACKEND_URL,
};
// SỬA: Thêm `!config.backendUrl` vào đây để kiểm tra
if (!config.mongodbUri ||
    !config.jwtSecret ||
    !config.adminUsername ||
    !config.adminPassword ||
    !config.payosClientId ||
    !config.payosApiKey ||
    !config.payosChecksumKey ||
    !config.frontendUrl || // Thêm cả frontendUrl để chắc chắn
    !config.backendUrl // Thêm backendUrl
) {
    throw new Error('FATAL ERROR: A required environment variable is missing.');
}
exports.default = config;
