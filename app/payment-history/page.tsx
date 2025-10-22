'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getPaymentHistory } from '@/lib/api';
import type { User, Payment } from '@/lib/types';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'>('ALL');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await getPaymentHistory();
      setPayments(data.content || []);
    } catch (error) {
      console.error('Failed to load payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge-success">Thành công</span>;
      case 'PENDING':
        return <span className="badge-warning">Đang xử lý</span>;
      case 'FAILED':
        return <span className="badge-danger">Thất bại</span>;
      default:
        return <span className="badge-warning">{status}</span>;
    }
  };

  const filteredPayments = filter === 'ALL' 
    ? payments 
    : payments.filter(p => p.status === filter);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lịch sử thanh toán</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-4 py-2 rounded-lg ${filter === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Thành công
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg ${filter === 'PENDING' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
        >
          Đang xử lý
        </button>
        <button
          onClick={() => setFilter('FAILED')}
          className={`px-4 py-2 rounded-lg ${filter === 'FAILED' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          Thất bại
        </button>
      </div>

      {/* Payments Table */}
      {filteredPayments.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Ngày</th>
                <th className="text-left py-3 px-4">Gói đăng ký</th>
                <th className="text-left py-3 px-4">Phương thức</th>
                <th className="text-right py-3 px-4">Số tiền</th>
                <th className="text-center py-3 px-4">Trạng thái</th>
                <th className="text-left py-3 px-4">Mã GD</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.paymentId} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {new Date(payment.createdAt).toLocaleDateString('vi-VN')}
                    <div className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleTimeString('vi-VN')}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {payment.subscription?.subName || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    VNPay
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-blue-600">
                    {payment.amount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {payment.transactionCode || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500">Không có giao dịch nào</p>
        </div>
      )}

      {/* Summary */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card text-center">
            <p className="text-gray-600 mb-2">Tổng giao dịch</p>
            <p className="text-3xl font-bold">{payments.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-gray-600 mb-2">Thành công</p>
            <p className="text-3xl font-bold text-green-600">
              {payments.filter(p => p.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-gray-600 mb-2">Tổng chi tiêu</p>
            <p className="text-2xl font-bold text-blue-600">
              {payments
                .filter(p => p.status === 'COMPLETED')
                .reduce((sum, p) => sum + p.amount, 0)
                .toLocaleString('vi-VN')} đ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
