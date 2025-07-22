import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { Account } from '../shared/types';

type AccountFormData = {
    username: string;
    password?: string;
};

interface AccountFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<AccountFormData>;
    defaultValues?: Account | null;
    isLoading: boolean;
}

export function AccountFormModal({ isOpen, onClose, onSubmit, defaultValues, isLoading }: AccountFormModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AccountFormData>();
    const isEditing = !!defaultValues;

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                reset({ username: defaultValues.username, password: '' });
            } else {
                reset({ username: '', password: '' });
            }
        }
    }, [isOpen, defaultValues, isEditing, reset]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Chỉnh Sửa Tài Khoản' : 'Tạo Tài Khoản Mới'}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? "Để trống mật khẩu nếu bạn không muốn thay đổi."
                            : "Vui lòng nhập đầy đủ thông tin tài khoản."
                        }
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Tên đăng nhập (Username)</Label>
                        <Input 
                            id="username"
                            className="text-black"
                            {...register("username", { required: "Username là bắt buộc" })}
                        />
                        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Mật khẩu (Password)</Label>
                        <Input 
                            id="password" 
                            type="text"
                            className="text-black"
                            placeholder={isEditing ? 'Nhập mật khẩu mới...' : ''}
                            {...register("password", { required: !isEditing ? "Mật khẩu là bắt buộc" : false })}
                        />
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Hủy</Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (isEditing ? 'Đang cập nhật...' : 'Đang tạo...') : 'Lưu Thay Đổi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}