'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getAllReports, resolveReport } from '@/lib/api';
import type { User, Report } from '@/lib/types';

export default function AdminReportsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !isAdmin()) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await getAllReports();
      setReports(data.content || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    if (!confirm('Đánh dấu báo cáo này là đã xử lý?')) return;

    try {
      await resolveReport(id);
      setReports(reports.map(r => r.reportId === id ? { ...r, status: 'RESOLVED' } : r));
      alert('Đã xử lý báo cáo!');
    } catch (error: any) {
      alert(error.message || 'Xử lý thất bại!');
    }
  };

  const filteredReports = filter === 'ALL' 
    ? reports 
    : reports.filter(r => r.status === filter);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Quản lý báo cáo</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Tổng</p>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Chờ xử lý</p>
          <p className="text-2xl font-bold text-yellow-600">
            {reports.filter(r => r.status === 'PENDING').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Đã xử lý</p>
          <p className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg ${filter === 'PENDING' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
        >
          Chờ xử lý
        </button>
        <button
          onClick={() => setFilter('RESOLVED')}
          className={`px-4 py-2 rounded-lg ${filter === 'RESOLVED' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Đã xử lý
        </button>
      </div>

      {/* Reports Table */}
      {filteredReports.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Người báo cáo</th>
                <th className="text-left py-3 px-4">Tin đăng</th>
                <th className="text-left py-3 px-4">Lý do</th>
                <th className="text-left py-3 px-4">Mô tả</th>
                <th className="text-left py-3 px-4">Ngày</th>
                <th className="text-center py-3 px-4">Trạng thái</th>
                <th className="text-center py-3 px-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.reportId} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">{report.reportId}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{report.reporter.userName}</div>
                    <div className="text-xs text-gray-500">{report.reporter.userEmail}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Link 
                      href={`/posts/${report.listing.listingId}`}
                      target="_blank"
                      className="text-blue-600 hover:underline line-clamp-2"
                    >
                      {report.listing.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge-warning">{report.reason}</span>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="line-clamp-2 text-sm">{report.description}</p>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {report.status === 'PENDING' ? (
                      <span className="badge-warning">Chờ xử lý</span>
                    ) : (
                      <span className="badge-success">Đã xử lý</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {report.status === 'PENDING' && (
                      <button
                        onClick={() => handleResolve(report.reportId)}
                        className="btn-primary px-3 py-1 text-sm"
                      >
                        Xử lý
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">Không có báo cáo nào</p>
        </div>
      )}
    </div>
  );
}
