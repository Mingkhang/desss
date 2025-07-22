// File: src/server.ts

import { server, io } from "./app"
import config from './config/env';
import { startVoucherCleanupJob } from "./jobs/voucher-cleanup.job"
import { startTransactionCleanupJob } from "./jobs/transaction-cleanup.job"
import { startCleanupFailedExpiredCancelledJob } from "./jobs/cleanup-failed-expired-cancelled.job"
import { startExpiredCleanupJob } from "./jobs/expired-cleanup.job"
import { startMonthlyAgentTransactionCleanup } from "./jobs/agent-transaction-cleanup.job";
import fs from "fs"
import path from "path"

// Tạo thư mục logs nếu chưa tồn tại
const logDir = path.join(process.cwd(), "logs")
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

// File log cho server
const serverLogFile = path.join(logDir, "server.log")

// Hàm ghi log
function logToFile(message: string) {
  const timestamp = new Date().toISOString()
  const logMessage = `${timestamp} - ${message}\n`

  // Log ra console
  console.log(message)

  // Ghi vào file
  fs.appendFileSync(serverLogFile, logMessage)
}

const PORT = config.port;

// Lắng nghe server duy nhất tại đây
server.listen(PORT, () => {
  const BASE_URL = config.backendUrl;

  logToFile('==============================');
  logToFile(`[SERVER] Server is running on port: ${PORT}`);
  logToFile(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}`);
  logToFile(`[SERVER] BASE_URL: ${BASE_URL}`);
  logToFile(`[SERVER] FRONTEND_URL: ${config.frontendUrl}`);
  logToFile(`[SERVER] Allowed Origins: ${config.allowedOrigins}`);
  logToFile(`[SERVER] MongoDB URI: ${config.mongodbUri}`);
  logToFile('==============================');

  const webhookUrl = `${BASE_URL}/api/v1/payment/payos-webhook`;
  logToFile(`[SERVER] PayOS Webhook URL: ${webhookUrl}`);
  // Khởi động từng cronjob trực tiếp như cách cũ
  startMonthlyAgentTransactionCleanup();
  startExpiredCleanupJob(io);
  startVoucherCleanupJob();
  startTransactionCleanupJob();
  startCleanupFailedExpiredCancelledJob();
  logToFile("[SERVER] Cron jobs started.");
});

// Xử lý lỗi promise
process.on("unhandledRejection", (reason: Error | any) => {
  logToFile(`[SERVER ERROR] Unhandled Rejection: ${reason.message || reason}`)
  logToFile(`[SERVER ERROR] Stack: ${reason.stack || "No stack trace"}`)
  logToFile("[SERVER] Shutting down server...")

  server.close(() => {
    process.exit(1)
  })
})

// Xử lý lỗi uncaught exception
process.on("uncaughtException", (err: Error) => {
  logToFile(`[SERVER ERROR] Uncaught Exception: ${err.message}`)
  logToFile(`[SERVER ERROR] Stack: ${err.stack || "No stack trace"}`)
  logToFile("[SERVER] Shutting down server...")

  server.close(() => {
    process.exit(1)
  })
})

// Xử lý tắt server
process.on("SIGTERM", () => {
  logToFile("[SERVER] SIGTERM received. Shutting down gracefully...")
  server.close(() => {
    logToFile("[SERVER] Process terminated.")
  })
})

process.on("SIGINT", () => {
  logToFile("[SERVER] SIGINT received. Shutting down gracefully...")
  server.close(() => {
    logToFile("[SERVER] Process terminated.")
  })
})