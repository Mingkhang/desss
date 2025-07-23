import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler, useFieldArray } from 'react-hook-form';

import settingService from '../../services/settingService';
import adminService from '../../services/adminService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

// **SỬA LỖI BƯỚC 1: ĐỊNH NGHĨA KIỂU DỮ LIỆU RÕ RÀNG**
// Định nghĩa cấu trúc cho giá thuê
interface RentalPrice {
    duration: number;
    price: number;
}
// Định nghĩa cấu trúc cho toàn bộ object settings
interface SettingsData {
    bannerContent: { message: string; fontSize: number; };
    rentalPrices: Record<string, RentalPrice>;
}

// Định nghĩa kiểu dữ liệu cho form
type SettingsFormData = {
    bannerContent: { message: string; fontSize: number; };
    rentalPrices: { key: string; duration: number; price: number; }[];
};

export default function AdminSettingsPage() {
    const { data: settings } = useQuery<SettingsData>({
        queryKey: ['settings'],
        queryFn: settingService.getPublicSettings
    });
    const { register, handleSubmit, control, reset } = useForm<SettingsFormData>();
    const { fields } = useFieldArray({ control, name: 'rentalPrices' });
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: adminService.updateAdminSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            alert('Cập nhật cài đặt thành công!');
        },
    });
    useEffect(() => {
        if (settings) {
            reset({
                bannerContent: settings.bannerContent,
                rentalPrices: Object.entries(settings.rentalPrices).map(([key, value]) => ({ key, ...value }))
            });
        }
    }, [settings, reset]);
    const onSubmit: SubmitHandler<SettingsFormData> = (data) => {
        const rentalPricesObj: Record<string, RentalPrice> = {};
        data.rentalPrices.forEach(item => {
            rentalPricesObj[item.key] = { duration: item.duration, price: item.price };
        });
        mutation.mutate({
            bannerContent: data.bannerContent,
            rentalPrices: rentalPricesObj
        });
    };
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Cài đặt Website</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle>Banner Trang Chủ</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="bannerMessage">Nội dung Banner</Label>
                            <Input id="bannerMessage" {...register("bannerContent.message" )} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="bannerFontSize">Cỡ chữ (px)</Label>
                            <Input id="bannerFontSize" type="number" {...register("bannerContent.fontSize")} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Quản lý Giá Thuê</CardTitle>
                        <CardDescription>Thay đổi giá và thời gian cho các gói thuê.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                                <div className="grid gap-2 w-1/4">
                                    <Label>Gói</Label>
                                    <Input value={`${field.key}`} disabled className="font-semibold"/>
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor={`rentalPrices.${index}.duration`}>Thời gian (giờ)</Label>
                                    <Input id={`rentalPrices.${index}.duration`} type="number" {...register(`rentalPrices.${index}.duration`)} />
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <Label htmlFor={`rentalPrices.${index}.price`}>Giá (VND)</Label>
                                    <Input id={`rentalPrices.${index}.price`} type="number" {...register(`rentalPrices.${index}.price`)} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Button type="submit" className="w-full md:w-auto" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Đang lưu...' : 'Lưu Tất Cả Thay Đổi'}
                </Button>
            </form>
        </div>
    );
}