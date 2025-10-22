'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';
import { getListingsBySeller, getMySubscription } from '@/lib/api';
import type { User, Listing, UserSubscription } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user) return;
      
      const [listingsRes, subRes] = await Promise.all([
        getListingsBySeller(user.userID),
        getMySubscription().catch(() => null)
      ]);
      setListings(listingsRes.content || []);
      setSubscription(subRes);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'ACTIVE').length;
  const pendingListings = listings.filter(l => l.status === 'PENDING').length;
  const recentListings = listings.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Xin chào, {user?.userName}!</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-gray-600 mb-2">Tin đang hoạt động</div>
          <div className="text-3xl font-bold text-blue-600">{activeListings}</div>
        </div>
        <div className="card">
          <div className="text-gray-600 mb-2">Tin chờ duyệt</div>
          <div className="text-3xl font-bold text-yellow-600">{pendingListings}</div>
        </div>
        <div className="card">
          <div className="text-gray-600 mb-2">Gói đăng ký</div>
          <div className="text-xl font-semibold text-green-600">
            {subscription?.subscription?.subName || 'Free'}
          </div>
          {subscription && (
            <div className="text-sm text-gray-500 mt-1">
              Hết hạn: {new Date(subscription.endDate).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/create-post" className="card hover:shadow-lg transition text-center py-6">
            <div className="text-4xl mb-2">➕</div>
            <div className="font-semibold">Đăng tin mới</div>
          </Link>
          <Link href="/my-posts" className="card hover:shadow-lg transition text-center py-6">
            <div className="text-4xl mb-2">📝</div>
            <div className="font-semibold">Quản lý tin</div>
          </Link>
          <Link href="/subscription" className="card hover:shadow-lg transition text-center py-6">
            <div className="text-4xl mb-2">💎</div>
            <div className="font-semibold">Nâng cấp</div>
          </Link>
          <Link href="/payment-history" className="card hover:shadow-lg transition text-center py-6">
            <div className="text-4xl mb-2">💳</div>
            <div className="font-semibold">Lịch sử</div>
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Tin đăng gần đây</h2>
          <Link href="/my-posts" className="text-blue-600 hover:underline">Xem tất cả →</Link>
        </div>

        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentListings.map((listing) => (
              <div key={listing.listingId} className="card">
                <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={listing.imageUrls?.[0] || '/placeholder.jpg'}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {listing.status === 'ACTIVE' && <span className="badge-success">Đang bán</span>}
                    {listing.status === 'PENDING' && <span className="badge-warning">Chờ duyệt</span>}
                    {listing.status === 'REJECTED' && <span className="badge-danger">Từ chối</span>}
                  </div>
                </div>
                <h3 className="font-semibold mb-2 truncate">{listing.title}</h3>
                <p className="text-blue-600 font-bold mb-2">{listing.price?.toLocaleString('vi-VN')} đ</p>
                <p className="text-sm text-gray-500">
                  {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <Link href={`/posts/${listing.listingId}`} className="btn-primary w-full mt-4">
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">Bạn chưa có tin đăng nào</p>
            <Link href="/create-post" className="btn-primary inline-block">
              Đăng tin ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
