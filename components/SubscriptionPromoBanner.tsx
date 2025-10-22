'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function SubscriptionPromoBanner() {
  const pathname = usePathname();
  const [user, setUser] = useState(getCurrentUser());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  // Don't show on subscription or payment pages
  if (!user || pathname.includes('/subscription') || pathname.includes('/payment')) {
    return null;
  }

  // Don't show if user dismissed
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm animate-bounce">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-2xl p-6 relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-white hover:text-gray-200"
        >
          ✕
        </button>
        
        <div className="mb-3">
          <h3 className="text-xl font-bold mb-1">💎 Nâng cấp ngay!</h3>
          <p className="text-sm opacity-90">Đăng tin không giới hạn</p>
        </div>
        
        <Link 
          href="/subscription"
          className="block w-full bg-white text-purple-600 text-center py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          Xem gói đăng ký →
        </Link>
      </div>
    </div>
  );
}
