import axios from 'axios';
import axiosInstance from '../lib/axios';

interface LoginPayload {
    username?: string;
    password?: string;
}

const authService = {
    loginAdmin: async (credentials: LoginPayload) => {
        try {
            const response = await axiosInstance.post('/api/v1/admin/auth/login', credentials);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Đăng nhập thất bại');
            }
            throw new Error('Lỗi không xác định khi đăng nhập.');
        }
    }
};

export default authService;