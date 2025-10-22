'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getRoleName } from '@/lib/auth';
import { getUserById, updateUserProfile } from '@/lib/api';
import type { User } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    street: '',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    loadUserProfile(currentUser.userID);
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      const data = await getUserById(userId);
      setUser(data);
      setFormData({
        userName: data.userName || '',
        userEmail: data.userEmail || '',
        phone: data.phone || '',
        city: data.city || '',
        district: data.district || '',
        ward: data.ward || '',
        street: data.street || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      alert('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile(formData);
      alert('Cập nhật thông tin thành công!');
      setEditing(false);
      if (user) {
        loadUserProfile(user.userID);
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      alert(error.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Không tìm thấy thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-primary">
              ✏️ Chỉnh sửa
            </button>
          ) : (
            <div className="space-x-2">
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Đang lưu...' : '💾 Lưu'}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">
                ❌ Hủy
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Họ và tên</label>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700">{user.userName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                {editing ? (
                  <input
                    type="email"
                    className="input-field"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700">{user.userEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại</label>
                {editing ? (
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700">{user.phone || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Vai trò</label>
                <p className="text-gray-700">
                  <span className="badge-success">{getRoleName(user.role)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">Địa chỉ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố</label>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700">{user.city || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quận/Huyện</label>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700">{user.district || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phường/Xã</label>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700">{user.ward || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Đường</label>
                {editing ? (
                  <input
                    type="text"
                    className="input-field"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  />
                ) : (
                  <p className="text-gray-700">{user.street || 'Chưa cập nhật'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Gói đăng ký</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                Gói hiện tại: <strong className="text-blue-600">Free</strong>
              </p>
              <button
                onClick={() => router.push('/subscription')}
                className="btn-primary mt-4"
              >
                🚀 Nâng cấp gói
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
