import axios from 'axios';
import axiosInstance from '../lib/axios';

interface ApplyVoucherPayload {
    voucherCode: string;
    currentOrderAmount: number;
}

const voucherService = {
    applyVoucher: async (payload: ApplyVoucherPayload) => {
        try {
            const response = await axiosInstance.post('/api/v1/vouchers/apply', payload);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Lỗi khi áp dụng mã giảm giá');
            }
            throw new Error('Đã có lỗi không mong muốn xảy ra.');
        }
    }
};

export default voucherService;