'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout, isAdmin } from '@/lib/auth';
import type { User } from '@/lib/types';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
          ⚡ EV Market
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className={`hover:text-blue-600 ${pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}>
            Trang chủ
          </Link>
          <Link href="/search" className={`hover:text-blue-600 ${pathname === '/search' ? 'text-blue-600 font-semibold' : ''}`}>
            Tìm kiếm
          </Link>
          <Link href="/subscription" className={`hover:text-blue-600 ${pathname === '/subscription' ? 'text-blue-600 font-semibold' : ''}`}>
            💎 Gói đăng ký
          </Link>

          {user ? (
            <>
              <Link href="/create-post" className="btn-primary">
                + Đăng tin
              </Link>
              
              {isAdmin() && (
                <Link href="/admin" className={`text-red-600 hover:text-red-700 font-semibold ${pathname.startsWith('/admin') ? 'underline' : ''}`}>
                  Admin
                </Link>
              )}

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:text-blue-600"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    {user.userName?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.userName}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                      👤 Tài khoản
                    </Link>
                    <Link href="/my-posts" className="block px-4 py-2 hover:bg-gray-100">
                      📝 Tin đăng của tôi
                    </Link>
                    <Link href="/subscription" className="block px-4 py-2 hover:bg-gray-100">
                      ⭐ Gói dịch vụ
                    </Link>
                    <Link href="/transactions" className="block px-4 py-2 hover:bg-gray-100">
                      💳 Lịch sử giao dịch
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      🚪 Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-primary">
                Đăng nhập
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl">
          ☰
        </button>
      </nav>
    </header>
  );
}
