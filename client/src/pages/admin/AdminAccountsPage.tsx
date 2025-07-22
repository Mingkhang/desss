import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Trash2, Edit, PlusCircle, PlayCircle, PauseCircle } from 'lucide-react';
import type { Account } from '../../components/shared/types';
import { AccountFormModal } from '../../components/admin/AccountFormModal';

type AccountFormData = {
    username: string;
    password?: string;
};

export default function AdminAccountsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const { data: accounts, isLoading } = useQuery<Account[]>({
        queryKey: ['admin-accounts'],
        queryFn: adminService.getAdminAccounts
    });

    const createMutation = useMutation({
        mutationFn: adminService.createAdminAccount,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-accounts'] }); alert('Tạo tài khoản thành công!'); handleCloseModal(); },
        onError: (error: Error) => alert(`Lỗi khi tạo: ${error.message}`),
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: string, accountData: AccountFormData }) => adminService.updateAdminAccount(data.id, data.accountData),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-accounts'] }); alert('Cập nhật tài khoản thành công!'); handleCloseModal(); },
        onError: (error: Error) => alert(`Lỗi khi cập nhật: ${error.message}`),
    });

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteAdminAccount,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-accounts'] }); alert('Xóa tài khoản thành công!'); },
        onError: (error: Error) => alert(`Lỗi khi xóa: ${error.message}`),
    });
    // **LOGIC MỚI CHO TẠM DỪNG/TIẾP TỤC**
    const toggleStatusMutation = useMutation({
        mutationFn: (data: { id: string, status: 'available' | 'paused' }) => adminService.toggleAccountStatus(data.id, data.status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
        },
        onError: (error: Error) => alert(`Lỗi khi đổi trạng thái: ${error.message}`),
    });

    const handleToggleStatus = (account: Account) => {
        const newStatus = account.status === 'paused' ? 'available' : 'paused';
        const confirmMessage = newStatus === 'paused'
            ? 'Bạn có chắc muốn tạm dừng cho thuê tài khoản này?'
            : 'Bạn có chắc muốn tiếp tục cho thuê tài khoản này?';
        
        if (window.confirm(confirmMessage)) {
            toggleStatusMutation.mutate({ id: account._id, status: newStatus });
        }
    };

    const handleOpenCreateModal = () => { setEditingAccount(null); setIsModalOpen(true); };
    const handleOpenEditModal = (account: Account) => { setEditingAccount(account); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingAccount(null); };

    const handleFormSubmit = (data: AccountFormData) => {
        const payload = { ...data };
        if (editingAccount && !payload.password) {
            delete payload.password;
        }
        if (editingAccount) {
            updateMutation.mutate({ id: editingAccount._id, accountData: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return <div>Đang tải danh sách tài khoản...</div>;
    const isMutating = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý Tài khoản Unlocktool</h1>
                <Button onClick={handleOpenCreateModal}><PlusCircle className="w-5 h-5 mr-2" />Thêm tài khoản mới</Button>
            </div>
            {/* Đổi màu nền cho bảng */}
            <div className="bg-slate-900 rounded-lg shadow-lg border border-slate-700">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700">
                            <TableHead>STT</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Password</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts?.map(account => (
                            <TableRow key={account._id} className="border-slate-800">
                                <TableCell>{account.displayOrder}</TableCell>
                                <TableCell>{account.username}</TableCell>
                                <TableCell className="font-mono">{account.password}</TableCell>
                                <TableCell><Badge variant={account.status as any} className="text-base">{account.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    {/* **NÚT MỚI: TẠM DỪNG/TIẾP TỤC** */}
                                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleToggleStatus(account)} disabled={toggleStatusMutation.isPending}>
                                        {account.status === 'paused' 
                                            ? <PlayCircle className="w-4 h-4 text-green-400" />
                                            : <PauseCircle className="w-4 h-4 text-yellow-400" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="mr-2" onClick={() => handleOpenEditModal(account)}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(account._id)} disabled={deleteMutation.isPending}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <AccountFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFormSubmit} defaultValues={editingAccount} isLoading={isMutating} />
        </div>
    );
}