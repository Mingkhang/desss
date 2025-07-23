// File: src/pages/CancelPage.tsx (Nội dung mới)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export default function CancelPage() {
    const { orderCode } = useParams<{ orderCode: string }>();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Gọi API để hủy đơn hàng ngay khi trang được tải
        if (orderCode) {
            paymentService.cancelOrder(orderCode)
                .then(() => {
                    console.log(`Order ${orderCode} successfully cancelled.`);
                })
                .catch(error => {
                    console.error(`Failed to cancel order ${orderCode}:`, error);
                    // Dù API có lỗi, vẫn tiếp tục luồng cho người dùng
                });
        }

        // Bắt đầu đếm ngược để chuyển về trang chủ
        const timer = setInterval(() => {
            setCountdown(prevCountdown => {
                if (prevCountdown <= 1) {
                    clearInterval(timer);
                    navigate('/'); // Chuyển về trang chủ
                    return 0;
                }
                return prevCountdown - 1;
            });
        }, 1000);

        // Dọn dẹp interval khi component bị hủy
        return () => clearInterval(timer);
    }, [orderCode, navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <div className="text-center p-8 max-w-md w-full bg-card border rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-destructive mb-2">Đơn Hàng Đã Bị Hủy</h1>
                    <p className="text-muted-foreground mb-4">
                        Đơn hàng <span className="font-bold text-foreground">{orderCode}</span> đã được hủy do yêu cầu của bạn hoặc đã hết hạn thanh toán.
                    </p>
                    <div className="text-center py-4">
                        <p>Trở về trang chủ sau <span className="font-bold text-lg">{countdown}</span> giây...</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}