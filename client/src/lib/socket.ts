import { io } from 'socket.io-client';

const VITE_API_URL = import.meta.env.VITE_API_URL;

// Thêm cấu hình transport cho client
export const socket = io(VITE_API_URL, {
    transports: ['websocket']
});