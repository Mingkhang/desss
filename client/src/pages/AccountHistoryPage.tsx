import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import accountHistoryService, { type RentedAccountInfo } from '../services/accountHistoryService';
import { SimpleHeader } from '../components/layout/SimpleHeader';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { KeyRound, Clock, Copy, Check } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../lib/utils';

export default function AccountHistoryPage() {
    const [rentedAccounts, setRentedAccounts] = useState<RentedAccountInfo[]>([]);
    const [copiedField, setCopiedField] = useState<string>('');
    
    useEffect(() => {
        const accounts = accountHistoryService.getRentedAccounts();
        setRentedAccounts(accounts);
        
        // Cleanup tài khoản hết hạn
        accountHistoryService.cleanupExpiredAccounts();
    }, []);
    
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(''), 2000);
    };
    
    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };
    
    if (rentedAccounts.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
                <SimpleHeader />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center">
                        <KeyRound className="mx-auto h-12 w-12 text-yellow-500" />
                        <h1 className="mt-4 text-2xl font-bold text-yellow-500">Chưa có tài khoản nào</h1>
                        <p className="mt-2 text-yellow-500">Bạn chưa thuê tài khoản nào trong 7 ngày qua.</p>
                        <Link to="/">
                            <Button className="mt-4">Thuê tài khoản ngay</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
            <SimpleHeader />
            <main className="flex-grow p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-yellow-500">
                            <KeyRound className="w-8 h-8 text-yellow-500" />
                            Tài khoản đã thuê (7 ngày gần đây)
                        </h1>
                        <p className="text-yellow-500 mt-2">
                            Danh sách tài khoản bạn đã thuê trong 7 ngày qua
                        </p>
                    </div>
                    
                    <div className="grid gap-4">
                        {rentedAccounts.map((account, index) => (
                            <Card key={account.transactionId} className="border-2">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg text-yellow-500">
                                            Đơn hàng #{account.orderCode}
                                        </CardTitle>
                                        <Badge variant={isExpired(account.expiresAt) ? "destructive" : "default"}>
                                            {isExpired(account.expiresAt) ? "Hết hạn" : "Còn hạn"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
                                                <span className="font-medium text-yellow-700 dark:text-yellow-300">Tên tài khoản:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-yellow-600 dark:text-yellow-400">{account.username}</span>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        onClick={() => copyToClipboard(account.username, `username-${index}`)}
                                                    >
                                                        {copiedField === `username-${index}` ? 
                                                            <Check className="w-4 h-4 text-green-500" /> : 
                                                            <Copy className="w-4 h-4" />
                                                        }
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
                                                <span className="font-medium text-yellow-700 dark:text-yellow-300">Mật khẩu:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-yellow-600 dark:text-yellow-400">{account.password}</span>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        onClick={() => copyToClipboard(account.password, `password-${index}`)}
                                                    >
                                                        {copiedField === `password-${index}` ? 
                                                            <Check className="w-4 h-4 text-green-500" /> : 
                                                            <Copy className="w-4 h-4" />
                                                        }
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
                                                <span className="font-medium text-green-700 dark:text-green-300">Voucher tặng:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-green-600 dark:text-green-400">
                                                        {account.voucher?.code || 'Không có'}
                                                    </span>
                                                    {account.voucher?.code && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost"
                                                            onClick={() => copyToClipboard(account.voucher!.code, `voucher-${index}`)}
                                                        >
                                                            {copiedField === `voucher-${index}` ? 
                                                                <Check className="w-4 h-4 text-green-500" /> : 
                                                                <Copy className="w-4 h-4" />
                                                            }
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
                                                <span className="font-medium text-yellow-700 dark:text-yellow-300">Thời gian thuê:</span>
                                                <span className="text-yellow-600 dark:text-yellow-400">{account.rentalDuration} giờ</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200">
                                                <span className="font-medium text-yellow-700 dark:text-yellow-300">Hết hạn:</span>
                                                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                    <Clock className="w-4 h-4" />
                                                    {formatDateTime(account.expiresAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-yellow-200">
                                        <span className="text-sm text-yellow-600 dark:text-yellow-400">
                                            Thuê lúc: {formatDateTime(account.rentedAt)}
                                        </span>
                                        <span className="font-bold text-lg text-yellow-500">
                                            {formatCurrency(account.totalPaid)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    
                    <div className="mt-6 text-center">
                        <Link to="/">
                            <Button>Thuê thêm tài khoản</Button>
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
