import axios from 'axios';
import axiosInstance from "../lib/axios";

const settingService = {
    getPublicSettings: async () => {
        try {
            const response = await axiosInstance.get('/api/v1/settings');
            return response.data.data;
        } catch (error) {
            console.error("Error fetching settings:", error);
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Lỗi khi tải cài đặt.');
            }
            throw new Error('Đã có lỗi không mong muốn xảy ra.');
        }
    }
};

export default settingService;