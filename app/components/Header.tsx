import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm py-6">
      <div className="container">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="text-blue-500 hover:text-blue-700">
              На главную
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
