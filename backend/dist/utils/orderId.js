"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderId = generateOrderId;
// Hàm sinh orderId theo timestamp + random
function generateOrderId(agentId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${agentId}-${timestamp}-${random}`;
}
