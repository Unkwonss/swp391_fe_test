'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { createVNPayPayment, cancelPayment } from '@/lib/api';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(getCurrentUser());
  const [processing, setProcessing] = useState(false);
  const [pendingPaymentModal, setPendingPaymentModal] = useState<any>(null);

  const subId = searchParams.get('subId');
  const price = searchParams.get('price');
  const name = searchParams.get('name');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleCancelPendingPayment = async () => {
    if (!pendingPaymentModal) return;

    try {
      setProcessing(true);
      await cancelPayment(pendingPaymentModal.paymentId);
      alert('Đã hủy giao dịch cũ thành công!');
      setPendingPaymentModal(null);
      
      // Tự động thử lại thanh toán
      setTimeout(() => handleVNPayPayment(), 500);
    } catch (error: any) {
      alert(error.message || 'Không thể hủy giao dịch');
      setProcessing(false);
    }
  };

  const handleVNPayPayment = async () => {
    if (!user || !subId || !price) {
      alert('Thông tin thanh toán không hợp lệ');
      return;
    }

    setProcessing(true);
    try {
      const response = await createVNPayPayment({
        amount: Number(price),
        orderInfo: `Thanh toán gói ${name}`,
        subscriptionId: Number(subId),
        userId: user.userID,
      });

      // Redirect to VNPay payment URL
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        throw new Error('Không nhận được URL thanh toán');
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      
      // Kiểm tra nếu có payment PENDING
      if (error.message.includes('PENDING_PAYMENT_EXISTS')) {
        try {
          const errorData = JSON.parse(error.message.split('Error: ')[1]);
          setPendingPaymentModal(errorData.pendingPayment);
        } catch {
          alert('Bạn có giao dịch chưa hoàn tất. Vui lòng hủy giao dịch cũ trước.');
        }
      } else {
        alert(error.message || 'Không thể tạo thanh toán. Vui lòng thử lại!');
      }
      setProcessing(false);
    }
  };

  if (!user || !subId || !price || !name) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Thông tin thanh toán không hợp lệ</p>
        <button onClick={() => router.push('/subscription')} className="btn-primary mt-4">
          Quay lại trang gói đăng ký
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>

          {/* Order Summary */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Gói đăng ký:</span>
                <span className="font-semibold">{decodeURIComponent(name)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Người mua:</span>
                <span className="font-semibold">{user.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{user.userEmail}</span>
              </div>
              <div className="h-px bg-gray-300 my-4"></div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Tổng thanh toán:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {Number(price).toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
            <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-4">
                  VP
                </div>
                <div>
                  <h3 className="font-bold text-lg">VNPay</h3>
                  <p className="text-sm text-gray-600">Thanh toán qua cổng VNPay</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>✓ Hỗ trợ thanh toán qua ATM/Visa/MasterCard</p>
                <p>✓ Bảo mật tuyệt đối</p>
                <p>✓ Xác nhận thanh toán tức thì</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleVNPayPayment}
              disabled={processing}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                '💳 Thanh toán với VNPay'
              )}
            </button>

            <button
              onClick={() => router.push('/subscription')}
              className="w-full py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              disabled={processing}
            >
              ← Quay lại
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-600">
              🔒 <strong>Lưu ý:</strong> Bạn sẽ được chuyển đến trang thanh toán VNPay. 
              Sau khi thanh toán thành công, bạn sẽ được chuyển về trang xác nhận.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Pending Payment Warning */}
      {pendingPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Giao dịch chưa hoàn tất</h2>
              <p className="text-gray-600">
                Bạn có giao dịch đang chờ xử lý cho gói <span className="font-semibold">{pendingPaymentModal.packageName}</span>
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-mono font-semibold">{pendingPaymentModal.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold">{pendingPaymentModal.amount?.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian còn lại:</span>
                <span className="font-semibold text-yellow-600">{Math.floor(pendingPaymentModal.minutesRemaining)} phút</span>
              </div>
            </div>

            <p className="text-center text-gray-700 mb-6">
              Vui lòng hủy giao dịch cũ trước khi đăng ký gói mới
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCancelPendingPayment}
                disabled={processing}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
              >
                {processing ? 'Đang hủy...' : '✗ Hủy giao dịch cũ'}
              </button>
              <button
                onClick={() => router.push('/transactions')}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                📋 Xem lịch sử giao dịch
              </button>
              <button
                onClick={() => setPendingPaymentModal(null)}
                className="w-full py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
