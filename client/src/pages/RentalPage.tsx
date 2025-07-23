// File: src/pages/RentalPage.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import voucherService from '../services/voucherService';
import paymentService from '../services/paymentService';
import settingService from '../services/settingService';
import accountService from '../services/accountService';
import { socket } from '../lib/socket';

import { Footer } from '../components/layout/Footer';
import { SimpleHeader } from '../components/layout/SimpleHeader';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Skeleton } from '../components/ui/skeleton';
import { AlertTriangle, KeyRound, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import type { Account } from '../components/shared/types';

interface AppliedVoucher {
    code: string;
    discountAmount: number;
}

export default function RentalPage() {
    const { accountId } = useParams<{ accountId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: account, isLoading: isLoadingAccount, isError: isAccountError } = useQuery<Account>({
        queryKey: ['account', accountId],
        queryFn: () => {
            return accountService.getPublicAccounts().then(accounts => {
                const acc = accounts.find((a: Account) => a._id === accountId);
                if (!acc || acc.status !== 'available') {
                    throw new Error('Tài khoản không tồn tại hoặc đã được người khác thuê.');
                }
                return acc;
            });
        },
        enabled: !!accountId,
        retry: false,
    });

    const { data: settings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingService.getPublicSettings
    });

    // Realtime updates cho settings
    useEffect(() => {
        socket.on('settings_updated', () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        });

        return () => {
            socket.off('settings_updated');
        };
    }, [queryClient]);

    const RENTAL_PACKAGES = useMemo(() => settings?.rentalPrices || {}, [settings]);
    
    const oneDayKey = useMemo(() => {
        if (!settings?.rentalPrices) return '';
        return Object.entries(settings.rentalPrices).find(
            ([, value]: [string, any]) => value.duration === 24
        )?.[0] || '';
    }, [settings]);

    const [selectedPackage, setSelectedPackage] = useState('');
    const voucherInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (!isLoadingSettings && Object.keys(RENTAL_PACKAGES).length > 0) {
            if (oneDayKey) setSelectedPackage(oneDayKey);
            else setSelectedPackage(Object.keys(RENTAL_PACKAGES)[0]);
        }
    }, [RENTAL_PACKAGES, isLoadingSettings, oneDayKey]);

    // Scroll to voucher input when package is selected (not on first load)
    const firstLoad = useRef(true);
    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false;
            return;
        }
        if (selectedPackage && voucherInputRef.current) {
            voucherInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            voucherInputRef.current.focus();
        }
    }, [selectedPackage]);


    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
    const [voucherError, setVoucherError] = useState('');

    const applyVoucherMutation = useMutation({
        mutationFn: voucherService.applyVoucher,
        onSuccess: (data) => {
            setAppliedVoucher({ code: data.code, discountAmount: data.discountAmount });
            setVoucherError('');
        },
        onError: (error: Error) => {
            setAppliedVoucher(null);
            setVoucherError(error.message);
        }
    });

    const paymentMutation = useMutation({
        mutationFn: paymentService.createPaymentLink,
        onSuccess: (data) => {
            window.location.href = data.checkoutUrl;
        },
        onError: (error: Error) => {
            // Kiểm tra lỗi 500 Internal Server Error
            if (error.message.includes('500') || error.message.includes('Internal Server Error') || error.message.includes('Network Error')) {
                alert('Hệ thống đang bận. Vui lòng thử lại sau 10 giây.');
                return;
            }
            
            // Nếu lỗi do trình duyệt không hỗ trợ hoặc lỗi không xác định
            if (
                error.message.includes('không sẵn sàng') ||
                error.message.includes('Không xác định') ||
                error.message.includes('unsupported') ||
                error.message.includes('Unexpected')
            ) {
                alert('Trình duyệt của bạn không hỗ trợ tạo đơn hàng. Quý khách nên sử dụng Chrome bản mới nhất để có trải nghiệm tốt nhất!');
                navigate('/');
            } else {
                alert(`Lỗi: ${error.message}`);
            }
        }
    });

    const originalPrice = selectedPackage ? (RENTAL_PACKAGES as any)[selectedPackage]?.price || 0 : 0;
    const finalPrice = Math.max(0, originalPrice - (appliedVoucher?.discountAmount || 0));

    const handleApplyVoucher = () => {
        if (!voucherCode.trim()) {
            setVoucherError('Vui lòng nhập mã giảm giá.'); return;
        }
        if (!selectedPackage) {
            setVoucherError('Vui lòng chọn gói thuê trước.'); return;
        }
        setVoucherError('');
        applyVoucherMutation.mutate({ voucherCode, currentOrderAmount: originalPrice });
    };

    const handlePayment = () => {
        if (!selectedPackage || !accountId) {
            alert('Vui lòng chọn một gói thuê!'); return;
        }
        paymentMutation.mutate({
            accountId: accountId,
            rentalPackageKey: selectedPackage,
            voucherCode: appliedVoucher?.code || undefined,
            socketId: socket.id,
        });
    };

    const renderMainContent = () => {
        if (isLoadingAccount || isLoadingSettings) {
            return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>;
        }

        if (isAccountError) {
            return (
                <div className="text-center text-destructive">
                    <AlertTriangle className="mx-auto h-12 w-12" />
                    <h2 className="mt-4 text-xl font-bold">Lỗi tải thông tin</h2>
                    <p className="mt-2 text-muted-foreground">Tài khoản này không hợp lệ hoặc đã được người khác thuê. Vui lòng quay lại và chọn tài khoản khác.</p>
                    <Button onClick={() => navigate('/')} className="mt-4">Quay về trang chủ</Button>
                </div>
            );
        }
        
        const packageLabels: Record<string, string> = {
            '6h': '6 giờ',
            '12h': '12 giờ',
            '18h': '18 giờ',
            '24h': '1 ngày - 24 giờ',
            '48h': '2 ngày - 48 giờ',
            '72h': '3 ngày - 72 giờ',
            '120h': '5 ngày - 120 giờ',
            '168h': '7 ngày - 168 giờ'
        };

        return (
            <>
                <RadioGroup
                    value={selectedPackage}
                    onValueChange={setSelectedPackage}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                    {Object.entries(RENTAL_PACKAGES).map(([key, value]: [string, any]) => {
                        const isSelected = selectedPackage === key;
                        return (
                            <Label
                                key={key}
                                htmlFor={key}
                                className={
                                    `flex items-center rounded-lg p-3 cursor-pointer transition-all border-2
                                    ${isSelected
                                        ? 'border-yellow-400 bg-yellow-100 text-yellow-900'
                                        : 'border-green-200 bg-green-50 text-green-900 hover:border-green-400'
                                    }`
                                }
                            >
                                <RadioGroupItem value={key} id={key} />
                                <div className="flex-1 flex justify-between items-center ml-3 font-semibold">
                                    <span className="text-right">{packageLabels[key] || value.duration + ' giờ'}</span>
                                    <span className="font-bold">{formatCurrency(value.price)}</span>
                                </div>
                            </Label>
                        );
                    })}
                </RadioGroup>

                <div className="space-y-2 pt-6 mt-6 border-t">
                    <Label htmlFor="voucher" className="font-semibold">Mã giảm giá (nếu có)</Label>
                    <div className="flex gap-2">
                        <Input
                            id="voucher"
                            ref={voucherInputRef}
                            placeholder="Nhập mã..."
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                            className="flex-1 border-2 border-yellow-400 focus-visible:ring-yellow-400 text-black"
                        />
                        <Button onClick={handleApplyVoucher} disabled={applyVoucherMutation.isPending} className="flex-shrink-0">
                            {applyVoucherMutation.isPending ? 'K.tra' : 'Áp dụng'}
                        </Button>
                    </div>
                    {voucherError && <p className="text-sm text-red-500 mt-1">{voucherError}</p>}
                    {appliedVoucher && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-4 h-4" />Áp dụng thành công, giảm {formatCurrency(appliedVoucher.discountAmount)}.</p>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t">
                    <div className="text-right font-bold text-2xl mb-4">
                        <p className="text-muted-foreground text-sm font-medium">Tổng thanh toán</p>
                        <p>{formatCurrency(finalPrice)}</p>
                    </div>
                    <Button type="button" onClick={handlePayment} disabled={paymentMutation.isPending || !selectedPackage} className="w-full text-lg h-12">
                        {paymentMutation.isPending ? 'Đang xử lý...' : 'Đồng ý & Thanh toán'}
                    </Button>
                    <p className="text-center text-red-500 font-medium text-sm mt-4">
                        Vui lòng thanh toán trong 5 phút và không đóng trình duyệt để nhận tài khoản.
                    </p>
                </div>
            </>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black">
            <SimpleHeader />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-card text-card-foreground rounded-xl shadow-lg border">
                    <div className="p-6 border-b">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <KeyRound className="w-6 h-6 text-primary" />
                             Chọn gói thuê cho tài khoản No{' '}
                            <span className="text-yellow-500">{account?.displayOrder}</span>
                        </h1>
                    </div>
                    <div className="p-6">
                        {renderMainContent()}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}