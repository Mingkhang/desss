import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <h2 className="text-3xl font-semibold mt-4">Trang không tồn tại</h2>
            <p className="text-muted-foreground mt-2">
                Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
            </p>
            <Button asChild className="mt-6">
                <Link to="/">Quay về Trang Chủ</Link>
            </Button>
        </div>
    );
}