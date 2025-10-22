'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAllPaymentsByUser, cancelPayment } from '@/lib/api';

interface Payment {
  paymentId: number;
  orderId: string;
  amount: number;
  orderInfo: string;
  method: string;
  status: string;
  createDate: string;
  updatedAt?: string;
  responseCode?: string;
  bankCode?: string;
  transactionCode?: string;
  userSubscription: {
    userSubId: number;
    status: string;
    startDate?: string;
    endDate?: string;
    subscriptionId: {
      subId: number;
      subName: string;
      subPrice: string;
      duration: number;
    };
  };
}

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadPayments();
  }, [user, router]);

  const loadPayments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getAllPaymentsByUser(user.userID);
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (paymentId: number) => {
    if (!confirm('Bạn có chắc muốn hủy giao dịch này?')) return;

    try {
      setProcessingId(paymentId);
      await cancelPayment(paymentId);
      alert('Đã hủy giao dịch thành công!');
      await loadPayments();
    } catch (error: any) {
      alert(error.message || 'Không thể hủy giao dịch');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">✓ Thành công</span>;
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">⏳ Chờ thanh toán</span>;
      case 'FAILED':
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">✗ Thất bại</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">⊗ Đã hủy</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Đang tải lịch sử giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">💳 Lịch sử giao dịch</h1>
          <p className="text-gray-600">Quản lý tất cả giao dịch thanh toán của bạn</p>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có giao dịch nào</h3>
            <p className="text-gray-500 mb-6">Bạn chưa thực hiện giao dịch nào</p>
            <button
              onClick={() => router.push('/subscription')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Xem gói đăng ký
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.paymentId} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{payment.orderInfo || `Gói ${payment.userSubscription?.subscriptionId?.subName}`}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📦 Mã đơn hàng: <span className="font-mono font-semibold">{payment.orderId}</span></p>
                      <p>📅 Ngày tạo: {formatDate(payment.createDate)}</p>
                      <p>💳 Phương thức: {payment.method}</p>
                      {payment.bankCode && <p>🏦 Ngân hàng: {payment.bankCode}</p>}
                      {payment.transactionCode && <p>🔢 Mã GD: <span className="font-mono">{payment.transactionCode}</span></p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {payment.amount.toLocaleString('vi-VN')}₫
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>

                {/* Subscription Info */}
                {payment.userSubscription && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      📋 Gói: <span className="font-semibold">{payment.userSubscription.subscriptionId?.subName}</span>
                      {' • '}
                      ⏱️ {payment.userSubscription.subscriptionId?.duration} ngày
                      {' • '}
                      Trạng thái gói: <span className={`font-semibold ${
                        payment.userSubscription.status === 'ACTIVE' ? 'text-green-600' :
                        payment.userSubscription.status === 'PENDING_PAYMENT' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>{payment.userSubscription.status}</span>
                    </p>
                    {payment.userSubscription.startDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        ⏰ Từ {formatDate(payment.userSubscription.startDate)} đến {formatDate(payment.userSubscription.endDate)}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-3">
                  {payment.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(payment.paymentId)}
                      disabled={processingId === payment.paymentId}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      {processingId === payment.paymentId ? '⏳ Đang hủy...' : '✗ Hủy giao dịch'}
                    </button>
                  )}
                  {(payment.status === 'FAILED' || payment.status === 'CANCELLED') && (
                    <div className="text-sm text-gray-600 italic">
                      💡 Để thanh toán lại, vui lòng quay lại trang <button onClick={() => router.push('/subscription')} className="text-blue-600 hover:underline font-semibold">Gói đăng ký</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            ← Quay lại trang cá nhân
          </button>
        </div>
      </div>
    </div>
  );
}
