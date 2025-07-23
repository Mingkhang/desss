import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import adminService from '../../services/adminService';

type AdminStatistics = {
  monthlyRevenue: number;
  totalVouchers: number;
  usedVouchers: number;
};

function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 });
}

export default function AdminDashboardPage() {
    const { data, isLoading } = useQuery<AdminStatistics>({
      queryKey: ['admin-statistics'],
      queryFn: adminService.getAdminStatistics
    });
    const monthlyRevenue = data?.monthlyRevenue ?? 0;
    const totalVouchers = data?.totalVouchers ?? 0;
    const usedVouchers = data?.usedVouchers ?? 0;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Tổng Quan</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Doanh thu Tháng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(monthlyRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Tự động reset về 0 sau khi dọn dẹp giao dịch mỗi tháng
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Voucher được tạo hôm nay</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '...' : totalVouchers}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng số voucher được tạo ra hôm nay<br />
                            <span className="italic">Làm mới lúc 0h mỗi ngày</span>
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Voucher đã sử dụng hôm nay</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '...' : usedVouchers}</div>
                        <p className="text-xs text-muted-foreground">
                            Tổng số voucher đã sử dụng hôm nay<br />
                            <span className="italic">Làm mới lúc 0h mỗi ngày</span>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}