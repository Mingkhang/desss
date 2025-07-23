import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthProvider';
import { Button } from '../ui/button';
import { LayoutDashboard, KeyRound, Settings, LogOut, Ticket, History } from 'lucide-react';

const navItems = [
    { href: '/admin/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/admin/accounts', label: 'Quản lý Tài khoản', icon: KeyRound },
    { href: '/admin/vouchers', label: 'Quản lý Voucher', icon: Ticket },
    { href: '/admin/transactions', label: 'Tất cả giao dịch', icon: History },
    { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
    { href: '/admin/agents', label: 'Quản lý Đại lý', icon: KeyRound },
];

export function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar giữ nguyên màu tối */}
            <aside className="w-64 bg-slate-800 text-white p-4 flex flex-col">
                <h1 className="text-2xl font-bold mb-8 text-center">Admin Panel</h1>
                <nav className="flex flex-col gap-2 flex-grow">
                    {navItems.map(item => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            className={({ isActive }: { isActive: boolean }) => 
                                `flex items-center gap-3 p-3 rounded-md transition-colors text-lg ${ // Tăng cỡ chữ sidebar
                                isActive ? 'bg-slate-700' : 'hover:bg-slate-700/50'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <Button onClick={handleLogout} variant="destructive" className="mt-4">
                    <LogOut className="w-5 h-5 mr-2" />
                    Đăng xuất
                </Button>
            </aside>
            {/* THAY ĐỔI GIAO DIỆN Ở ĐÂY: Nền đen, chữ trắng, cỡ chữ lớn hơn */}
             <main className="flex-1 p-8 bg-black text-red-500 text-lg overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}