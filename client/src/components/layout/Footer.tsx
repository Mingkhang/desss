import { Facebook, MessageSquare } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-100 dark:bg-zinc-800/50 py-4 mt-10">
      <div className="container mx-auto flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <p>Nếu cần hỗ trợ xin vui lòng liên hệ:</p>
          <div className="flex items-center gap-4 mt-2">
            <a href="https://zalo.me/0325882520" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <span>Zalo</span>
            </a>
            <a href="https://www.facebook.com/blacknekohi/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700">
              <Facebook className="w-6 h-6 text-blue-700" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          © {currentYear} Thuetool.online. All rights reserved.
        </p>
      </div>
    </footer>
  );
}