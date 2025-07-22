"use strict";
// File: src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = __importDefault(require("./config/env"));
const voucher_cleanup_job_1 = require("./jobs/voucher-cleanup.job");
const transaction_cleanup_job_1 = require("./jobs/transaction-cleanup.job");
const cleanup_failed_expired_cancelled_job_1 = require("./jobs/cleanup-failed-expired-cancelled.job");
const expired_cleanup_job_1 = require("./jobs/expired-cleanup.job");
// import { startMonthlyAgentTransactionCleanup } from "./jobs/agent-transaction-cleanup.job";
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Tạo thư mục logs nếu chưa tồn tại
const logDir = path_1.default.join(process.cwd(), "logs");
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
}
// File log cho server
const serverLogFile = path_1.default.join(logDir, "server.log");
// Hàm ghi log
function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    // Log ra console
    console.log(message);
    // Ghi vào file
    fs_1.default.appendFileSync(serverLogFile, logMessage);
}
const PORT = env_1.default.port;
// Lắng nghe server duy nhất tại đây
app_1.server.listen(PORT, () => {
    const BASE_URL = env_1.default.backendUrl;
    logToFile('==============================');
    logToFile(`[SERVER] Server is running on port: ${PORT}`);
    logToFile(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}`);
    logToFile(`[SERVER] BASE_URL: ${BASE_URL}`);
    logToFile(`[SERVER] FRONTEND_URL: ${env_1.default.frontendUrl}`);
    logToFile(`[SERVER] Allowed Origins: ${env_1.default.allowedOrigins}`);
    logToFile(`[SERVER] MongoDB URI: ${env_1.default.mongodbUri}`);
    logToFile('==============================');
    const webhookUrl = `${BASE_URL}/api/v1/payment/payos-webhook`;
    logToFile(`[SERVER] PayOS Webhook URL: ${webhookUrl}`);
    // Khởi động từng cronjob trực tiếp như cách cũ
    // startMonthlyAgentTransactionCleanup();
    (0, expired_cleanup_job_1.startExpiredCleanupJob)(app_1.io);
    (0, voucher_cleanup_job_1.startVoucherCleanupJob)();
    (0, transaction_cleanup_job_1.startTransactionCleanupJob)();
    (0, cleanup_failed_expired_cancelled_job_1.startCleanupFailedExpiredCancelledJob)();
    logToFile("[SERVER] Cron jobs started.");
});
// Xử lý lỗi promise
process.on("unhandledRejection", (reason) => {
    logToFile(`[SERVER ERROR] Unhandled Rejection: ${reason.message || reason}`);
    logToFile(`[SERVER ERROR] Stack: ${reason.stack || "No stack trace"}`);
    logToFile("[SERVER] Shutting down server...");
    app_1.server.close(() => {
        process.exit(1);
    });
});
// Xử lý lỗi uncaught exception
process.on("uncaughtException", (err) => {
    logToFile(`[SERVER ERROR] Uncaught Exception: ${err.message}`);
    logToFile(`[SERVER ERROR] Stack: ${err.stack || "No stack trace"}`);
    logToFile("[SERVER] Shutting down server...");
    app_1.server.close(() => {
        process.exit(1);
    });
});
// Xử lý tắt server
process.on("SIGTERM", () => {
    logToFile("[SERVER] SIGTERM received. Shutting down gracefully...");
    app_1.server.close(() => {
        logToFile("[SERVER] Process terminated.");
    });
});
process.on("SIGINT", () => {
    logToFile("[SERVER] SIGINT received. Shutting down gracefully...");
    app_1.server.close(() => {
        logToFile("[SERVER] Process terminated.");
    });
});
