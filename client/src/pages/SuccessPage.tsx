import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Copy, CheckCircle, Gift, AlertTriangle } from 'lucide-react';

import paymentService from '../services/paymentService';
import accountHistoryService from '../services/accountHistoryService';
import { formatDateTime, formatCurrency } from '../lib/utils';

import { SimpleHeader } from '../components/layout/SimpleHeader';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '../components/ui/card';

export default function SuccessPage() {
    const { orderCode } = useParams<{ orderCode: string }>();
    const navigate = useNavigate();

    // Fetch dữ liệu đơn hàng bằng react-query
    const { data: paymentData, isLoading, isError, error } = useQuery({
        queryKey: ['confirmation', orderCode],
        queryFn: () => {
            if (!orderCode) throw new Error('Mã đơn hàng không hợp lệ');
            return paymentService.getOrderConfirmationDetails(orderCode);
        },
        enabled: !!orderCode,
        retry: false,
    });

    const { account, newVoucher } = paymentData || {};
    const [runningNumber, setRunningNumber] = useState<number | null>(null);

    // Lưu thông tin tài khoản vào localStorage khi có dữ liệu
    useEffect(() => {
    if (account && orderCode) {
        // Kiểm tra đã lưu đơn hàng này chưa
        const existed = accountHistoryService.getRentedAccounts().find(acc => acc.orderCode === orderCode);
        if (!existed) {
            const rentedAt = new Date();
            const expiresAt = new Date(account.expiresAt);
            const rentalDurationInHours = Math.round((expiresAt.getTime() - rentedAt.getTime()) / (1000 * 60 * 60));
            accountHistoryService.saveRentedAccount({
                username: account.username,
                password: account.password,
                expiresAt: account.expiresAt,
                rentalDuration: rentalDurationInHours,
                totalPaid: 0,
                transactionId: orderCode,
                orderCode: orderCode,
                rentedAt: rentedAt.toISOString(),
                voucher: newVoucher && newVoucher.code ? {
                    code: newVoucher.code,
                    discountAmount: newVoucher.discountAmount
                } : null
            });
        }
    }
}, [account, orderCode, newVoucher]);

    useEffect(() => {
        if (newVoucher?.discountAmount) {
            let loop = 0;
            let num = 0;
            setRunningNumber(0);
            const interval = setInterval(() => {
                setRunningNumber(num * 1000);
                num++;
                if (num > 9) {
                    num = 0;
                    loop++;
                }
                if (loop >= 4) {
                    clearInterval(interval);
                    setRunningNumber(newVoucher.discountAmount);
                }
            }, 60);
            return () => clearInterval(interval);
        }
    }, [newVoucher]);

    const handleCopy = (text: string | undefined) => {
        if (text) {
            navigator.clipboard.writeText(text);
            alert('Đã sao chép!');
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                </div>
            );
        }

        if (isError) {
            return (
                <div className="text-center text-red-600">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
                    <h2 className="mt-4 text-xl font-bold text-red-600">Đơn Hàng Đặc Biệt</h2>
                    <p className="mt-2 text-red-600">{error?.message || 'Vui lòng nhấn icon FB hoặc Zalo và liên hệ để nhận tài khoản.'}</p>
                </div>
            );
        }

        if (account) {
            return (
                <>
                    <div className="space-y-3">
                        <div
                            className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 cursor-pointer text-blue-600 font-semibold select-all"
                            onClick={() => handleCopy(account.username)}
                            title="Sao chép tài khoản"
                            tabIndex={0}
                            role="button"
                        >
                            <span className="flex-1">Tài khoản: {account.username}</span>
                            <Copy className="w-5 h-5 ml-2" />
                        </div>
                        <div
                            className="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 cursor-pointer text-blue-600 font-semibold select-all"
                            onClick={() => handleCopy(account.password)}
                            title="Sao chép mật khẩu"
                            tabIndex={0}
                            role="button"
                        >
                            <span className="flex-1">Mật khẩu: {account.password}</span>
                            <Copy className="w-5 h-5 ml-2" />
                        </div>
                        <p className="text-center pt-2 font-semibold text-yellow-500">
                            Thời gian kết thúc: {formatDateTime(account.expiresAt)}
                        </p>
                    </div>

                    {newVoucher && newVoucher.code && (
                        <div className="mt-6 border-t pt-4 text-center">
                            <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-yellow-500">
                                <Gift className="w-5 h-5" /> Quà tặng cho bạn!
                            </h3>
                            <p className="mt-1 text-yellow-500 font-semibold">Chúc mừng bạn nhận được mã giảm giá:</p>
                            <div
                                className="my-2 p-2 border border-dashed rounded-lg flex items-center bg-blue-50 cursor-pointer text-blue-600 font-semibold select-all justify-center"
                                onClick={() => handleCopy(newVoucher.code)}
                                title="Sao chép mã giảm giá"
                                tabIndex={0}
                                role="button"
                            >
                                <span className="flex-1 text-center">{newVoucher.code}</span>
                                <Copy className="w-5 h-5 ml-2" />
                            </div>
                            <p className="text-yellow-500 font-semibold">
                                Trị giá {formatCurrency(runningNumber !== null ? runningNumber : newVoucher.discountAmount)} cho lần thuê tiếp theo.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 p-3 bg-red-100 rounded-lg space-y-2 text-red-600 font-medium text-sm">
                        <p><b>Lưu ý:</b> Mã giảm giá chỉ có giá trị trong 7 ngày.</p>
                        <p>Vui lòng lưu lại tài khoản, mật khẩu trước khi đóng trình duyệt và không thay đổi mật khẩu trong quá trình sử dụng.</p>
                    </div>
                </>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col min-h-screen" style={{ background: '#f3f4f6' }}>
            <SimpleHeader />
            <main className="flex-grow flex items-center justify-center p-4">
                <Card className="w-full max-w-lg shadow-2xl">
                    <CardHeader className="text-center bg-green-500 text-white rounded-t-lg py-4">
                        <CheckCircle className="mx-auto h-12 w-12" />
                        <CardTitle className="mt-2 text-2xl">Thuê tài khoản thành công!</CardTitle>
                        <CardDescription className="text-green-100">Đơn hàng của bạn đã được xác nhận.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {renderContent()}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => navigate('/')}>
                            Quay về trang chủ
                        </Button>
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
    );
}