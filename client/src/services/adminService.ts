
import axiosInstance from '../lib/axios';
import type { Account } from '../components/shared/types';
import type { Transaction, Voucher } from '../pages/admin/types';

const getAuthHeaders = () => {
    const token = localStorage.getItem('admin-token');
    return { Authorization: `Bearer ${token}` };
};

const adminService = {
    getAdminAccounts: async (): Promise<Account[]> => {
        const { data } = await axiosInstance.get('/api/v1/admin/accounts', { headers: getAuthHeaders() });
        return data.data;
    },

    createAdminAccount: async (accountData: { username?: string; password?: string }) => {
        const { data } = await axiosInstance.post('/api/v1/admin/accounts', accountData, { headers: getAuthHeaders() });
        return data.data;
    },

    updateAdminAccount: async (id: string, accountData: Partial<Account>) => {
        const { data } = await axiosInstance.put(`/api/v1/admin/accounts/${id}`, accountData, { headers: getAuthHeaders() });
        return data.data;
    },

    deleteAdminAccount: async (id: string) => {
        await axiosInstance.delete(`/api/v1/admin/accounts/${id}`, { headers: getAuthHeaders() });
    },

    updateAdminSettings: async (settingsData: any) => {
        const { data } = await axiosInstance.put('/api/v1/admin/settings', settingsData, { headers: getAuthHeaders() });
        return data.data;
    },

    getAdminVouchers: async (): Promise<Voucher[]> => {
        const { data } = await axiosInstance.get('/api/v1/admin/vouchers', { headers: getAuthHeaders() });
        return data.data;
    },

    createAdminVoucher: async () => {
        const { data } = await axiosInstance.post('/api/v1/admin/vouchers', {}, { headers: getAuthHeaders() });
        return data.data;
    },

    deleteAdminVoucher: async (id: string) => {
        await axiosInstance.delete(`/api/v1/admin/vouchers/${id}`, { headers: getAuthHeaders() });
    },

    getAdminTransactions: async (): Promise<Transaction[]> => {
        const { data } = await axiosInstance.get('/api/v1/admin/transactions', { headers: getAuthHeaders() });
        
        // 🔍 DEBUG: Log API response
        console.log('🔍 API RESPONSE:', data);
        if (data.debug) {
            console.log('🔍 API DEBUG INFO:', data.debug);
        }
        
        return data.data;
    }, // <<-- **SỬA LỖI Ở ĐÂY: Thêm dấu phẩy bị thiếu**

    toggleAccountStatus: async (id: string, status: 'available' | 'paused') => {
        const { data } = await axiosInstance.put(`/api/v1/admin/accounts/${id}/status`, { status }, { headers: getAuthHeaders() });
        return data.data;
    },

    getAdminStatistics: async () => {
        const { data } = await axiosInstance.get('/api/v1/admin/statistics', { headers: getAuthHeaders() });
        return data.data;
    }
};

export default adminService;