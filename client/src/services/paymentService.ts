import axios from 'axios';
import axiosInstance from '../lib/axios';

interface CreatePaymentLinkPayload {
    accountId: string;
    rentalPackageKey: string;
    voucherCode?: string;
    socketId?: string;
}

const paymentService = {
    createPaymentLink: async (payload: CreatePaymentLinkPayload) => {
        try {
            const response = await axiosInstance.post('/api/v1/payment/create-payment-link', payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                // Xử lý lỗi 500 Internal Server Error
                if (error.response.status === 500) {
                    throw new Error('Internal Server Error - Hệ thống đang bận');
                }
                throw new Error(error.response.data.message || 'Lỗi khi tạo link thanh toán');
            }
            // Lỗi network hoặc không có response
            throw new Error('Network Error - Không thể kết nối đến server');
        }
    },

    // SỬA ĐỔI: Hàm này giờ chỉ cần orderCode
    getOrderConfirmationDetails: async (orderCode: string) => {
        try {
            // SỬA ĐỔI: Gọi đến URL mới với orderCode trong params
            const response = await axiosInstance.get(`/api/v1/payment/order-confirmation-details/${orderCode}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Lỗi khi lấy thông tin đơn hàng');
            }
            throw new Error('Đã có lỗi không mong muốn xảy ra.');
        }
    },

    // THÊM MỚI: Hàm để thông báo hủy đơn hàng
    cancelOrder: async (orderCode: string) => {
        try {
            const response = await axiosInstance.post('/api/v1/payment/cancel-order', { orderCode });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Lỗi khi hủy đơn hàng');
            }
            throw new Error('Đã có lỗi không mong muốn xảy ra.');
        }
    }
};

export default paymentService;