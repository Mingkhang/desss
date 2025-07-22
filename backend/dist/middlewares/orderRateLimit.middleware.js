"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRateLimitMiddleware = orderRateLimitMiddleware;
// In-memory rate limit store: { ip: [timestamps array] }
const orderRateLimitMap = new Map();
/**
 * Lấy IP thật của client, không nhầm IP server/proxy.
 * Ưu tiên x-forwarded-for (lấy IP đầu tiên), sau đó các header khác, cuối cùng là req.ip.
 */
function getRealClientIp(req) {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        // Có thể là chuỗi hoặc mảng, luôn lấy IP đầu tiên
        const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(',')[0];
        return ips.trim();
    }
    return (req.headers['x-real-ip'] ||
        req.headers['cf-connecting-ip'] ||
        req.headers['x-client-ip'] ||
        req.ip ||
        req.connection?.remoteAddress ||
        'unknown');
}
/**
 * Middleware: Giới hạn 10 đơn hàng/10 phút cho mỗi IP thật.
 * Nếu vượt quá, trả về 429.
 */
function orderRateLimitMiddleware(req, res, next) {
    const ip = getRealClientIp(req);
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 phút
    const maxOrders = 10;
    let timestamps = orderRateLimitMap.get(ip) || [];
    // Xóa các timestamp cũ ngoài cửa sổ 10 phút
    timestamps = timestamps.filter(ts => now - ts < windowMs);
    if (timestamps.length >= maxOrders) {
        return res.status(429).json({
            success: false,
            message: 'Bạn đã tạo quá nhiều đơn hàng trong 10 phút. Vui lòng thử lại sau.'
        });
    }
    // Thêm timestamp mới
    timestamps.push(now);
    orderRateLimitMap.set(ip, timestamps);
    next();
}
