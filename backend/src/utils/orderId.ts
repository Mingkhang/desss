// Hàm sinh orderId theo timestamp + random
export function generateOrderId(agentId: string) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${agentId}-${timestamp}-${random}`;
}
