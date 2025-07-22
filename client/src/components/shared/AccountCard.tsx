import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useCountdown } from "../../hooks/useCountdown";
import type { Account } from "./types";

interface AccountCardProps {
    account: Account;
    onRent: (account: Account) => void;
}

export function AccountCard({ account, onRent }: AccountCardProps) {
    const { hours, minutes } = useCountdown(account.expiresAt);
    const isRentedAndActive = account.status === 'rented' && hours !== -1;
    const isRentable = account.status === 'available';

    const renderStatusBadge = () => {
        switch (account.status) {
            case 'available':
                return <Badge variant="available">Sẵn sàng</Badge>;
            // Xóa trạng thái pending, không còn case này
            case 'rented':
                return isRentedAndActive ? (
                        <Badge variant="rented">{hours}h {minutes}m</Badge>
            ) : (
                <Badge variant="default" className="bg-gray-500 text-white hover:bg-gray-500">Hết hạn</Badge>
            );
            case 'waiting':
                return <Badge variant="waiting">N/A</Badge>;
            case 'updating':
                return <Badge variant="updating">Chờ</Badge>;
            case 'paused':
                return <Badge variant="paused">Tạm dừng</Badge>;
            default:
                return <Badge variant="default">Không xác định</Badge>;
        }
    };
    
    return (
        <Card className="flex flex-col border border-yellow-400">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>UNLOCKTOOL No.{account.displayOrder}</span>
                    {renderStatusBadge()}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground">Tài khoản: {account.username}</p>
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full" 
                    disabled={!isRentable}
                    onClick={() => onRent(account)}
                >
                    {isRentable ? 'Thuê ngay' : 'Đã thuê'}
                </Button>
            </CardFooter>
        </Card>
    );
}