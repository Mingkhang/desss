import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="flex items-stretch h-full">
      <img
        src="/logo.png"
        alt="Thuetool.online Logo"
        className="h-16 sm:h-full w-auto object-contain transition-all duration-300"
        style={{ minHeight: 0, minWidth: 0, maxHeight: '100%' }}
      />
    </Link>
  );
}