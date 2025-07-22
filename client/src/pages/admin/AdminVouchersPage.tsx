import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Trash2, PlusCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { Voucher } from './types';

export default function AdminVouchersPage() {
    const queryClient = useQueryClient();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: vouchers, isLoading } = useQuery<Voucher[]>({
        queryKey: ['admin-vouchers'],
        queryFn: adminService.getAdminVouchers
    });

    const createMutation = useMutation({
        mutationFn: adminService.createAdminVoucher,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] }); },
        onError: (error: Error) => { alert(`Lỗi khi tạo voucher: ${error.message}`); }
    });

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteAdminVoucher,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] }); setDeletingId(null); },
        onError: (error: Error) => { alert(`Lỗi khi xóa voucher: ${error.message}`); setDeletingId(null); }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
            setDeletingId(id);
            deleteMutation.mutate(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý Voucher</h1>
                <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {createMutation.isPending ? 'Đang tạo...' : 'Tạo Voucher Mới'}
                </Button>
            </div>
            <div className="bg-white rounded-lg shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã Voucher</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày hết hạn</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Đang tải...</TableCell></TableRow>}
                        {vouchers?.map((voucher) => (
                            <TableRow key={voucher._id}>
                                <TableCell className="font-mono">{voucher.code}</TableCell>
                                <TableCell className="font-semibold text-green-600">{formatCurrency(voucher.discountAmount)}</TableCell>
                                <TableCell>
                                    {voucher.isUsed ? (<Badge variant="destructive">Đã dùng</Badge>) : 
                                     new Date(voucher.expiresAt) < new Date() ? (<Badge variant="default" className="bg-gray-500 text-white hover:bg-gray-500">Hết hạn</Badge>) : 
                                     (<Badge variant="available">Còn hạn</Badge>)}
                                </TableCell>
                                <TableCell>{formatDateTime(voucher.expiresAt)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(voucher._id)} disabled={deleteMutation.isPending && deletingId === voucher._id}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {!isLoading && vouchers?.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="text-center">Không có voucher nào.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}