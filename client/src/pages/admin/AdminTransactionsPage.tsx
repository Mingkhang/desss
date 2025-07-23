import React from 'react';
import { useQuery } from '@tanstack/react-query';
import adminService from '../../services/adminService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Badge } from '../../components/ui/badge';
import type { Transaction } from './types';

export default function AdminTransactionsPage() {
    const { data: transactions, isLoading } = useQuery<Transaction[]>({
        queryKey: ['admin-all-transactions'],
        queryFn: adminService.getAdminTransactions,
    });

    // 🔍 DEBUG: Log ra tất cả giao dịch để kiểm tra
    React.useEffect(() => {
        if (transactions) {
            console.log('🔍 ALL TRANSACTIONS:', transactions);
            console.log('📊 Transaction statuses:', transactions.map(t => ({ orderCode: t.orderCode, status: t.status, accountId: t.accountId })));
            
            const statusCount = transactions.reduce((acc, t) => {
                acc[t.status] = (acc[t.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            console.log('📈 Status count:', statusCount);
        }
    }, [transactions]);

    const renderStatusBadge = (status: string): React.ReactElement => {
        switch (status) {
            case 'PAID':
                return <Badge variant="available">Thành công</Badge>;
            case 'FAILED':
                return <Badge variant="destructive">Thất bại</Badge>;
            case 'CANCELLED':
                return <Badge variant="destructive">Đã hủy</Badge>;
            case 'CREATED':
                return <Badge variant="secondary">Đang thanh toán</Badge>;
            case 'EXPIRED':
                return <Badge variant="default" className="bg-gray-500 text-white hover:bg-gray-500">Hết hạn</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    // Lọc giao dịch theo trạng thái
    const getTransactionsByStatus = (status: string) => {
        const filtered = transactions
            ?.filter((t) => t.status === status)
            ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
        
        // 🔍 DEBUG: Log filter results  
        console.log(`🎯 FILTERING for status "${status}":`, filtered.length, 'transactions found');
        if (status === 'PAID') {
            console.log('💰 PAID transactions details:', filtered.map(t => ({
                _id: t._id,
                orderCode: t.orderCode,
                status: t.status,
                finalAmount: t.finalAmount,
                accountId: t.accountId?._id,
                createdAt: t.createdAt
            })));
        }
        if (status === 'CANCELLED') {
            console.log('🚫 CANCELLED transactions details:', filtered.map(t => ({
                _id: t._id,
                orderCode: t.orderCode,
                status: t.status,
                createdAt: t.createdAt
            })));
        }
        
        return filtered;
    };

    const failedTransactions = getTransactionsByStatus('FAILED');
    const paidTransactions = getTransactionsByStatus('PAID');
    const cancelledTransactions = getTransactionsByStatus('CANCELLED');
    const expiredTransactions = getTransactionsByStatus('EXPIRED');
    const createdTransactions = getTransactionsByStatus('CREATED');

    // Component để render từng bảng
    const TransactionTable = ({ 
        title, 
        transactions, 
        emptyMessage, 
        bgColor,
        titleColor 
    }: {
        title: string;
        transactions: any[];
        emptyMessage: string;
        bgColor: string;
        titleColor: string;
    }) => (
        <div className="mb-8">
            <div className={`${bgColor} border rounded-lg p-4 mb-4`}>
                <h2 className={`text-xl font-bold ${titleColor} mb-2`}>
                    {title} ({transactions.length})
                </h2>
            </div>
            <div className="bg-white rounded-lg shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã Đơn Hàng</TableHead>
                            <TableHead>Tài Khoản Thuê</TableHead>
                            <TableHead>Số Tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thời Gian Tạo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Đang tải...</TableCell>
                            </TableRow>
                        )}
                        {transactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                                <TableCell className="font-mono">{transaction.orderCode}</TableCell>
                                <TableCell>
                                    {transaction.accountId ? (
                                        <>
                                            <span className="font-semibold">No.{transaction.accountId?.displayOrder}</span>
                                            <span className="text-sm text-muted-foreground ml-2">({transaction.accountId?.username})</span>
                                        </>
                                    ) : (
                                        <span className={transaction.status === 'FAILED' ? "text-red-500 font-semibold" : "text-gray-500"}>
                                            {transaction.status === 'FAILED' ? 'Không có tài khoản available' : 'Chưa có tài khoản'}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">{formatCurrency(transaction.finalAmount)}</TableCell>
                                <TableCell>
                                    {renderStatusBadge(transaction.status)}
                                </TableCell>
                                <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500">{emptyMessage}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Quản Lý Giao Dịch</h1>
            
            {/* Thống kê tổng quan */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-red-800">Lỗi</h3>
                    <p className="text-2xl font-bold text-red-600">{failedTransactions.length}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-green-800">Thành Công</h3>
                    <p className="text-2xl font-bold text-green-600">{paidTransactions.length}</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-orange-800">Đã Hủy</h3>
                    <p className="text-2xl font-bold text-orange-600">{cancelledTransactions.length}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800">Hết Hạn</h3>
                    <p className="text-2xl font-bold text-gray-600">{expiredTransactions.length}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <h3 className="text-lg font-semibold text-blue-800">Đang Thanh Toán</h3>
                    <p className="text-2xl font-bold text-blue-600">{createdTransactions.length}</p>
                </div>
            </div>

            {/* Bảng 1: Giao dịch lỗi */}
            <TransactionTable
                title="🔴 Giao Dịch Lỗi"
                transactions={failedTransactions}
                emptyMessage="Không có giao dịch lỗi nào."
                bgColor="bg-red-50 border-red-200"
                titleColor="text-red-800"
            />

            {/* Bảng 2: Giao dịch thành công */}
            <TransactionTable
                title="🟢 Giao Dịch Thành Công"
                transactions={paidTransactions}
                emptyMessage="Chưa có giao dịch thành công nào."
                bgColor="bg-green-50 border-green-200"
                titleColor="text-green-800"
            />

            {/* Bảng 3: Giao dịch đã hủy */}
            <TransactionTable
                title="🟠 Giao Dịch Đã Hủy"
                transactions={cancelledTransactions}
                emptyMessage="Không có giao dịch bị hủy nào."
                bgColor="bg-orange-50 border-orange-200"
                titleColor="text-orange-800"
            />

            {/* Bảng 4: Giao dịch hết hạn */}
            <TransactionTable
                title="⚫ Giao Dịch Hết Hạn"
                transactions={expiredTransactions}
                emptyMessage="Không có giao dịch hết hạn nào."
                bgColor="bg-gray-50 border-gray-200"
                titleColor="text-gray-800"
            />

            {/* Bảng 5: Giao dịch đang thanh toán */}
            <TransactionTable
                title="🔵 Giao Dịch Đang Thanh Toán"
                transactions={createdTransactions}
                emptyMessage="Không có giao dịch đang chờ thanh toán."
                bgColor="bg-blue-50 border-blue-200"
                titleColor="text-blue-800"
            />
        </div>
    );
}