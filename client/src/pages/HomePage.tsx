import {  useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import accountService from '../services/accountService';
import accountHistoryService from '../services/accountHistoryService';
import { socket } from '../lib/socket';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { AccountCard } from '../components/shared/AccountCard';
import type { Account } from '../components/shared/types';
import { Skeleton } from '../components/ui/skeleton';
import { KeyRound } from 'lucide-react';

export default function HomePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Kiểm tra số lượng tài khoản đã thuê
  const rentedAccountsCount = accountHistoryService.getRentedAccounts().length;

  const { data: accounts, isLoading: isLoadingAccounts, error: accountsError } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: accountService.getPublicAccounts,
  });

  const sortedAccounts = useMemo(() => {
    if (!accounts) return [];
    const statusOrder: Record<Account['status'], number> = {
        'available': 1, 'updating': 2, 'waiting': 3, 'rented': 4, 'paused': 5,
    };
    return [...accounts].sort((a, b) => {
        const orderA = statusOrder[a.status];
        const orderB = statusOrder[b.status];
        if (orderA !== orderB) return orderA - orderB;
        if (a.status === 'rented' && b.status === 'rented') {
            const expiresA = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
            const expiresB = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
            return expiresA - expiresB;
        }
        return a.displayOrder - b.displayOrder;
    });
  }, [accounts]);

  useEffect(() => {
    // Chỉ giữ lại các socket listener
    socket.on('account_updated', () => { 
        queryClient.invalidateQueries({ queryKey: ['accounts'] }); 
    });
    
    // Logic cho order_expired có thể được xử lý ở trang CancelPage sau này,
    // ở đây chỉ đơn giản là thông báo và làm mới
    socket.on('order_expired', () => { 
        alert('Một đơn hàng đã hết hạn thanh toán. Danh sách tài khoản sẽ được làm mới.');
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
    });

    return () => {
      socket.off('account_updated');
      socket.off('order_expired');
    };
  }, [queryClient]);

  // Cập nhật hàm handleRentClick để chuyển trang
  const handleRentClick = (account: Account) => {
    navigate(`/rent/${account._id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Tầng link tài khoản đã thuê - ô màu đỏ, chữ vàng, responsive - LUÔN HIỂN THỊ */}
      <div className="w-full bg-red-600 dark:bg-red-700 flex items-center justify-center py-3 px-4">
        <Link 
          to="/account-history" 
          className="flex items-center gap-2 text-yellow-300 hover:text-yellow-100 font-semibold text-sm md:text-base lg:text-lg transition-colors"
        >
          <KeyRound className="w-4 h-4 md:w-5 md:h-5" />
          <span>Tài khoản đã thuê ({rentedAccountsCount})</span>
        </Link>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div id="account-list-section" className="scroll-mt-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-left bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
                Danh sách tài khoản unlocktool
            </h2>
            {isLoadingAccounts && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg bg-card">
                             <Skeleton className="h-[20px] w-3/4 rounded-xl" />
                             <Skeleton className="h-[16px] w-1/2 rounded-xl" />
                             <Skeleton className="h-[40px] w-full rounded-xl mt-4" />
                        </div>
                    ))}
                </div>
            )}
            {accountsError && (<div className="text-center text-red-500 bg-red-100 p-4 rounded-lg"><p>Đã xảy ra lỗi khi tải danh sách tài khoản.</p></div>)}
            
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                {sortedAccounts.map(account => (
                    <AccountCard key={account._id} account={account} onRent={handleRentClick} />
                ))}
                 {!isLoadingAccounts && sortedAccounts.length === 0 && (
                    <p className="text-center text-muted-foreground col-span-full">Không có tài khoản nào để cho thuê.</p>
                 )}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}