import type { Account as SharedAccount } from '../../components/shared/types';

// Mở rộng interface Account để đảm bảo có password cho trang admin
export interface Account extends SharedAccount {
    password?: string;
}

export interface Voucher {
    _id: string;
    code: string;
    discountAmount: number;
    isUsed: boolean;
    expiresAt: string;
}

export interface Transaction {
    _id: string;
    orderCode: number;
    accountId: Account; // Populate để có thông tin tài khoản
    finalAmount: number;
    status: string;
    createdAt: string;
}