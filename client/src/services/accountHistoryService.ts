export interface RentedAccountInfo {
    username: string;
    password: string;
    expiresAt: string;
    rentalDuration: number;
    totalPaid: number;
    transactionId: string;
    orderCode: string;
    rentedAt: string;
    voucher?: {
        code: string;
        discountAmount: number;
    } | null;
}

class AccountHistoryService {
    private readonly STORAGE_KEY = 'rented_accounts';
    
    // Lưu thông tin tài khoản vào localStorage
    saveRentedAccount(accountInfo: RentedAccountInfo) {
        const existingAccounts = this.getRentedAccounts();
        const newAccount = {
            ...accountInfo,
            rentedAt: new Date().toISOString()
        };
        
        existingAccounts.push(newAccount);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingAccounts));
    }
    
    // Lấy danh sách tài khoản đã thuê
    getRentedAccounts(): RentedAccountInfo[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return [];
        
        const accounts: RentedAccountInfo[] = JSON.parse(stored);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Chỉ trả về tài khoản trong 7 ngày
        return accounts.filter(account => 
            new Date(account.rentedAt) >= sevenDaysAgo
        );
    }
    
    // Xóa tài khoản hết hạn (tự động cleanup)
    cleanupExpiredAccounts() {
        const validAccounts = this.getRentedAccounts();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validAccounts));
    }
}

export default new AccountHistoryService();
