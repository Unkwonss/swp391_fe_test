'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getSubscriptions, getMySubscription } from '@/lib/api';
import type { User, Subscription, UserSubscription } from '@/lib/types';

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [mySubscription, setMySubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Ensure we're in browser environment
    if (typeof window !== 'undefined') {
      const currentUser = getCurrentUser();
      console.log('Current user:', currentUser); // Debug log
      setUser(currentUser);
      loadData(currentUser);
    }
  }, []);

  const loadData = async (currentUser: User | null) => {
    try {
      const subs = await getSubscriptions();
      // Filter out Free package
      setSubscriptions(subs.filter((s: Subscription) => s.subName !== 'Free'));
      
      // Only load user subscription if logged in
      if (currentUser) {
        try {
          const mySub = await getMySubscription();
          setMySubscription(mySub);
        } catch (error) {
          console.log('No active subscription');
        }
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (sub: Subscription) => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    // Redirect to payment page with subscription info
    router.push(`/payment?subId=${sub.subId}&price=${sub.subPrice}&name=${encodeURIComponent(sub.subName)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Don't render until mounted (avoid SSR mismatch)
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Chọn gói đăng ký phù hợp</h1>
          <p className="text-lg text-gray-600">Nâng cấp tài khoản để đăng tin không giới hạn</p>
        </div>

        {/* Login Notice for Guest Users */}
        {mounted && !user && (
          <div className="max-w-2xl mx-auto mb-12 bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-semibold mb-1">Bạn chưa đăng nhập</h3>
                <p className="text-gray-600">
                  Vui lòng <Link href="/login" className="text-blue-600 font-semibold hover:underline">đăng nhập</Link> để mua gói đăng ký
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription */}
        {mySubscription && (
          <div className="max-w-2xl mx-auto mb-12 bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-2">📦 Gói hiện tại của bạn</h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{mySubscription.subscription.subName}</p>
                <p className="text-sm text-gray-600">
                  Hết hạn: {new Date(mySubscription.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                mySubscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {mySubscription.status === 'ACTIVE' ? '✓ Đang hoạt động' : '⚠ Hết hạn'}
              </span>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subscriptions.map((sub) => {
            const isCurrent = mySubscription?.subscription.subId === sub.subId;
            const isPopular = sub.subName === 'Premium';

            return (
              <div
                key={sub.subId}
                className={`bg-white rounded-xl shadow-xl p-8 relative transform transition hover:scale-105 ${
                  isPopular ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      ⭐ Phổ biến nhất
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{sub.subName}</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {sub.subPrice.toLocaleString('vi-VN')}₫
                  </div>
                  <p className="text-sm text-gray-600">{sub.duration} ngày</p>
                </div>

                <div className="mb-8 space-y-4">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span className="text-gray-700">
                      <strong>Không giới hạn</strong> tin đăng
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span className="text-gray-700">
                      Ưu tiên mức <strong>{sub.priorityLevel}</strong>
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-3 text-xl">✓</span>
                    <span className="text-gray-700">{sub.subDetails}</span>
                  </div>
                </div>

                {isCurrent ? (
                  <button className="w-full py-3 px-6 bg-gray-300 text-gray-600 rounded-lg font-semibold" disabled>
                    ✓ Gói hiện tại
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(sub)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition ${
                      isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    {user ? '🚀 Nâng cấp ngay' : '🔐 Đăng nhập để mua'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
