// File: src/app.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import config from './config/env';
import connectDB from './config/db';
import errorMiddleware from './middlewares/error.middleware';
import apiRoutes from './api';
import { handlePayOSWebhook } from './controllers/public/payment.controller'; // Import trực tiếp

const app: Express = express();
app.set('trust proxy', true); 
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: config.allowedOrigins,
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

// Gán `io` vào mỗi request để controller có thể sử dụng
app.use((req: Request, res, next) => {
    req.io = io;
    // Log tất cả request
    console.log(`[REQUEST] ${req.method} ${req.originalUrl} - Body:`, req.body);
    next();
});

// Middleware bảo mật và CORS
app.use(helmet());
app.use(cors({ origin: config.allowedOrigins }));

// SỬA LỖI NGHIÊM TRỌNG: Định nghĩa route webhook với middleware `raw` TRƯỚC các middleware `json`.
// Điều này đảm bảo body của webhook được giữ nguyên ở dạng Buffer để xác thực chữ ký.
app.post('/api/v1/payment/payos-webhook', express.raw({ type: 'application/json' }), handlePayOSWebhook);

// Sau khi định nghĩa route webhook, ta mới áp dụng `json` parser cho các route còn lại.
app.use(express.json());

// Route mặc định
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Thuetool.online API is running.' });
});

// Các route API còn lại (trừ webhook) sẽ đi qua đây và sử dụng `json` parser.
app.use('/api/v1', apiRoutes);

// Xử lý kết nối Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', (reason) => {
        console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    });
});

// Middleware xử lý lỗi phải nằm cuối cùng
app.use(errorMiddleware);

// Kết nối database
connectDB();

export { app, server, io };