'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, register } from '@/lib/auth';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const validateForm = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!isLogin && !emailRegex.test(formData.userEmail)) {
      setError('Email không hợp lệ');
      return false;
    }

    // Validate phone number (Vietnam format: 10 digits, starts with 0)
    const phoneRegex = /^0\d{9}$/;
    if (!isLogin && !phoneRegex.test(formData.phone)) {
      setError('Số điện thoại phải có 10 chữ số và bắt đầu bằng 0');
      return false;
    }

    // Validate password strength
    if (!isLogin && formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    // Validate password match
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    // Validate name
    if (!isLogin && formData.userName.trim().length < 3) {
      setError('Họ tên phải có ít nhất 3 ký tự');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form before submit
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.userEmail, formData.password);
        // Redirect to home page after successful login
        router.push('/');
      } else {
        await register({
          userName: formData.userName.trim(),
          userEmail: formData.userEmail.toLowerCase().trim(),
          password: formData.password,
          phone: formData.phone,
        });
        
        // Reset form and show success message
        setFormData({
          userName: '',
          userEmail: '',
          password: '',
          confirmPassword: '',
          phone: '',
        });
        setIsLogin(true);
        setError('✅ Đăng ký thành công! Vui lòng đăng nhập với tài khoản vừa tạo.');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  minLength={3}
                />
                <p className="text-xs text-gray-500 mt-1">Tối thiểu 3 ký tự</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: value });
                  }}
                  placeholder="0123456789"
                  maxLength={10}
                  pattern="0\d{9}"
                />
                <p className="text-xs text-gray-500 mt-1">10 chữ số, bắt đầu bằng 0</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                minLength={isLogin ? 1 : 6}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  minLength={6}
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Mật khẩu không khớp</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600 mt-1">✓ Mật khẩu khớp</p>
                )}
              </div>
            )}

            {error && (
              <div className={`p-4 rounded-lg flex items-start gap-2 ${
                error.includes('✅') || error.includes('thành công') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <span className="text-lg">
                  {error.includes('✅') || error.includes('thành công') ? '✅' : '⚠️'}
                </span>
                <span className="flex-1">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isLogin ? 'Đang đăng nhập...' : 'Đang xử lý...'}
                </span>
              ) : (
                isLogin ? 'Đăng nhập' : 'Đăng ký'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                // Reset form when switching
                setFormData({
                  userName: '',
                  userEmail: '',
                  password: '',
                  confirmPassword: '',
                  phone: '',
                });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
                Quay về trang chủ
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
