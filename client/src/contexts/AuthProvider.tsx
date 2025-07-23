import { createContext, useContext, useState, type ReactNode } from 'react';
import authService from '../services/authService';

interface AuthContextType {
    token: string | null;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(() => {
        // Lấy token từ localStorage khi component được khởi tạo
        return localStorage.getItem('admin-token');
    });
    
    const login = async (credentials: any) => {
        // Gọi đến phương thức loginAdmin của đối tượng authService
        const data = await authService.loginAdmin(credentials);
        if (data.token) {
            setToken(data.token);
            localStorage.setItem('admin-token', data.token);
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('admin-token');
    };

    // Trạng thái đăng nhập được suy ra trực tiếp từ sự tồn tại của token
    const isAuthenticated = !!token;

    const value = { token, login, logout, isAuthenticated };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook để dễ dàng sử dụng context trong các component khác
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};