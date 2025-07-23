export interface Account {
    _id: string;
    displayOrder: number;
    username: string;
    status: 'available' | 'rented' | 'waiting' | 'updating' | 'paused'; // Đã loại bỏ 'pending'
    expiresAt?: string;
    password?: string;
}