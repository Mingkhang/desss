import axiosInstance from '../lib/axios';
import axios from 'axios';

const accountService = {
  /**
   * Lấy danh sách tài khoản công khai từ backend
   * @returns Promise chứa danh sách tài khoản
   */
  getPublicAccounts: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/accounts');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching public accounts:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Lỗi khi tải danh sách tài khoản.');
      }
      throw new Error('Đã có lỗi không mong muốn xảy ra.');
    }
  }
};

export default accountService;