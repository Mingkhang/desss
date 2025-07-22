import { Link } from 'react-router-dom';

export function SimpleHeader() {
  const message = "Chúc anh em mobile có nhiều kèo - Chúc anh em mobile có nhiều kèo ";

  return (
    // Header có nền xanh, chữ vàng, chiều cao cố định và ẩn đi phần nội dung bị tràn
    <header className="w-full bg-green-600 text-yellow-300 overflow-hidden flex items-center h-12 font-semibold text-lg">
      {/* Link về trang chủ được bọc trong ô màu vàng */}
      <Link to="/" className="flex-shrink-0 ml-4 bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-300 transition-colors font-bold">
        <span className="block md:hidden">Quay về</span>
        <span className="hidden md:block">Quay Về Trang Chủ</span>
      </Link>
      <div className="flex-grow flex items-center overflow-hidden">
        {/* Nội dung chữ chạy được lặp lại 4 lần để đảm bảo hiệu ứng mượt mà */}
        <div className="flex animate-marquee-fast whitespace-nowrap">
          <span className="mx-4">{message}</span>
          <span className="mx-4">{message}</span>
          <span className="mx-4" aria-hidden="true">{message}</span>
          <span className="mx-4" aria-hidden="true">{message}</span>
        </div>
      </div>
    </header>
  );
}