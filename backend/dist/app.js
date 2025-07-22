"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
// File: src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const helmet_1 = __importDefault(require("helmet"));
const env_1 = __importDefault(require("./config/env"));
const db_1 = __importDefault(require("./config/db"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const api_1 = __importDefault(require("./api"));
const payment_controller_1 = require("./controllers/public/payment.controller"); // Import trực tiếp
const app = (0, express_1.default)();
exports.app = app;
app.set('trust proxy', true);
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: env_1.default.allowedOrigins,
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});
exports.io = io;
// Gán `io` vào mỗi request để controller có thể sử dụng
app.use((req, res, next) => {
    req.io = io;
    // Log tất cả request
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} - Body:`, req.body);
    next();
});
// Middleware bảo mật và CORS
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.default.allowedOrigins }));
// SỬA LỖI NGHIÊM TRỌNG: Định nghĩa route webhook với middleware `raw` TRƯỚC các middleware `json`.
// Điều này đảm bảo body của webhook được giữ nguyên ở dạng Buffer để xác thực chữ ký.
app.post('/api/v1/payment/payos-webhook', express_1.default.raw({ type: 'application/json' }), payment_controller_1.handlePayOSWebhook);
// Sau khi định nghĩa route webhook, ta mới áp dụng `json` parser cho các route còn lại.
app.use(express_1.default.json());
// Route mặc định
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Thuetool.online API is running.' });
});
// Các route API còn lại (trừ webhook) sẽ đi qua đây và sử dụng `json` parser.
app.use('/api/v1', api_1.default);
// Xử lý kết nối Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    });
});
// Middleware xử lý lỗi phải nằm cuối cùng
app.use(error_middleware_1.default);
// Kết nối database
(0, db_1.default)();
