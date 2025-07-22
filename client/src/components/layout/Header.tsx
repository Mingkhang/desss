import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import settingService from '../../services/settingService';
import { socket } from '../../lib/socket';
import { ThemeToggle } from '../shared/ThemeToggle';
import { Button } from '../ui/button';
import { User, Share2 } from 'lucide-react';
import { Logo } from '../shared/Logo';

export function Header() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: settingService.getPublicSettings,
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

    const handleScrollToAccounts = () => {
        const section = document.getElementById('account-list-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleShare = async () => {
        const urlToCopy = window.location.href;
        try {
            await navigator.clipboard.writeText(urlToCopy);
            alert('Đã sao chép URL!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Sao chép thất bại!');
        }
    };

    return (
        <header className="w-full border-b bg-background">
            {/* Tầng 1: Top Bar */}
            <div className="bg-slate-100 dark:bg-zinc-900">
                <div className="container mx-auto flex h-12 items-center justify-between px-4">
                    <Button onClick={handleScrollToAccounts} className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold">
                        Thuê Tài Khoản
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="bg-white rounded-md p-1 flex items-center justify-center shadow border">
                            <ThemeToggle />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/admin')}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-md p-1 border border-yellow-500"
                        >
                            <User className="h-[1.5rem] w-[1.5rem]" />
                        </Button>
                        <Button
                            onClick={handleShare}
                            size="sm"
                            className="bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 flex items-center"
                        >
                            <Share2 className="w-4 h-4 mr-2" />Chia sẻ
                        </Button>
                        <Button
                            onClick={() => window.open('https://unlocktool.net/download/', '_blank')}
                            variant="secondary"
                            className="bg-gray-600 text-white hover:bg-gray-700 ml-2 hidden md:inline-flex"
                        >
                          Download
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile: Logo và dãy xanh cùng hàng, logo cao bằng dãy xanh */}
            {/* PC: Giữ nguyên như cũ */}
            <div className="w-full">
                {/* Mobile */}
                <div className="flex md:hidden w-full">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center justify-center bg-background h-16 w-16">
                        <Logo />
                    </div>
                    {/* Dãy xanh */}
                    <div className="flex-1 flex items-center bg-blue-600 text-white h-16">
                        <p className="text-base font-bold text-center w-full">
                            Cho thuê tài khoản UNLOCKTOOL giá rẻ
                        </p>
                    </div>
                </div>
                {/* PC */}
                <div className="hidden md:flex w-full" style={{ minHeight: '192px' }}>
                    {/* Logo dọc */}
                    <div className="flex-shrink-0 flex items-stretch bg-background" style={{ height: '192px', minWidth: 160 }}>
                        <Logo />
                    </div>
                    {/* Nội dung header */}
                    <div className="flex-1 flex flex-col justify-stretch">
                        <div className="grid grid-rows-3 h-[192px]">
                            {/* Tầng 2: Tiêu đề chính */}
                            <div className="relative bg-blue-600 text-white flex items-center justify-center w-full">
                                <div className="mx-auto w-full flex items-center justify-center relative" style={{ minHeight: 0 }}>
                                    <p className="text-xl md:text-2xl font-bold text-center w-full">
                                        Cho thuê tài khoản UNLOCKTOOL giá rẻ
                                    </p>
                                </div>
                            </div>
                            {/* Tầng 3: Banner Trắng (Zalo) */}
                            <div className="bg-white dark:bg-card w-full flex items-center justify-center">
                                <p className="text-lg md:text-xl font-semibold text-yellow-500 text-center w-full">
                                    Có nhu cầu thuê tài khoản Chimera | Octoplus vui lòng liên hệ{' '}
                                    <a
                                        href="https://zalo.me/0325882520"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold underline text-blue-600"
                                    >
                                        ZALO
                                    </a>
                                </p>
                            </div>
                            {/* Tầng 4: Banner Vàng (Thông báo Admin) */}
                            {settings?.bannerContent?.isEnabled ? (
                                <div className="bg-yellow-400 dark:bg-yellow-500 w-full overflow-hidden flex items-center">
                                    <div className="flex animate-marquee w-full">
                                        <p
                                            className="whitespace-nowrap text-black font-semibold px-8"
                                            style={{ fontSize: `${settings.bannerContent.fontSize || 16}px` }}
                                        >
                                            {settings.bannerContent.message}
                                        </p>
                                        <p
                                            className="whitespace-nowrap text-black font-semibold px-8"
                                            style={{ fontSize: `${settings.bannerContent.fontSize || 16}px` }}
                                            aria-hidden="true"
                                        >
                                            {settings.bannerContent.message}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-400 dark:bg-yellow-500 w-full" />
                            )}
                        </div>
                    </div>
                </div>
                {/* 2 tầng còn lại luôn full width trên mobile */}
                <div className="w-full md:hidden">
                    {/* Tầng 3: Banner Trắng */}
                    <div className="bg-white dark:bg-card w-full flex items-center justify-center h-12">
                        <p className="text-base font-semibold text-yellow-500 text-center w-full">
                            Có nhu cầu thuê tài khoản Chimera | Octoplus vui lòng liên hệ{' '}
                            <a
                                href="https://zalo.me/0325882520"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold underline text-blue-600"
                            >
                                ZALO
                            </a>
                        </p>
                    </div>
                    {/* Tầng 4: Banner Vàng */}
                    {settings?.bannerContent?.isEnabled ? (
                        <div className="bg-yellow-400 dark:bg-yellow-500 w-full overflow-hidden flex items-center h-12">
                            <div className="flex animate-marquee w-full">
                                <p
                                    className="whitespace-nowrap text-black font-semibold px-8"
                                    style={{ fontSize: `${settings.bannerContent.fontSize || 16}px` }}
                                >
                                    {settings.bannerContent.message}
                                </p>
                                <p
                                    className="whitespace-nowrap text-black font-semibold px-8"
                                    style={{ fontSize: `${settings.bannerContent.fontSize || 16}px` }}
                                    aria-hidden="true"
                                >
                                    {settings.bannerContent.message}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-400 dark:bg-yellow-500 w-full h-12" />
                    )}
                </div>
            </div>
        </header>
    );
}