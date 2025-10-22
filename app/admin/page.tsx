'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getAllUsers, getPendingListings, getAllReports } from '@/lib/api';
import type { User } from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingListings: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isAdmin()) {
      router.push('/');
      return;
    }
    setUser(currentUser);
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, listings, reports] = await Promise.all([
        getAllUsers().catch(() => []),
        getPendingListings().catch(() => []),
        getAllReports().catch(() => [])
      ]);

      // Backend returns arrays directly, not Page objects
      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        pendingListings: Array.isArray(listings) ? listings.length : 0,
        pendingReports: Array.isArray(reports) ? reports.filter((r: any) => r.status === 'PENDING').length : 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card bg-blue-50">
          <p className="text-gray-600 mb-2">Tổng người dùng</p>
          <p className="text-4xl font-bold text-blue-600">{stats.totalUsers}</p>
        </div>
        <div className="card bg-yellow-50">
          <p className="text-gray-600 mb-2">Tin chờ duyệt</p>
          <p className="text-4xl font-bold text-yellow-600">{stats.pendingListings}</p>
        </div>
        <div className="card bg-red-50">
          <p className="text-gray-600 mb-2">Báo cáo chờ xử lý</p>
          <p className="text-4xl font-bold text-red-600">{stats.pendingReports}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-2xl font-semibold mb-4">Quản lý</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/users" className="card hover:shadow-lg transition text-center py-8">
          <div className="text-5xl mb-3">👥</div>
          <h3 className="font-semibold text-lg">Người dùng</h3>
          <p className="text-sm text-gray-600 mt-1">{stats.totalUsers} users</p>
        </Link>

        <Link href="/admin/listings" className="card hover:shadow-lg transition text-center py-8">
          <div className="text-5xl mb-3">📝</div>
          <h3 className="font-semibold text-lg">Duyệt tin</h3>
          <p className="text-sm text-gray-600 mt-1">{stats.pendingListings} chờ duyệt</p>
        </Link>

        <Link href="/admin/reports" className="card hover:shadow-lg transition text-center py-8">
          <div className="text-5xl mb-3">🚨</div>
          <h3 className="font-semibold text-lg">Báo cáo</h3>
          <p className="text-sm text-gray-600 mt-1">{stats.pendingReports} chờ xử lý</p>
        </Link>

        <Link href="/subscription" className="card hover:shadow-lg transition text-center py-8">
          <div className="text-5xl mb-3">💎</div>
          <h3 className="font-semibold text-lg">Gói dịch vụ</h3>
          <p className="text-sm text-gray-600 mt-1">Xem tất cả</p>
        </Link>
      </div>
    </div>
  );
}
