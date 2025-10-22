'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getAllUsers, banUser, unbanUser } from '@/lib/api';
import type { User } from '@/lib/types';

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !isAdmin()) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data.content || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn khóa tài khoản này?')) return;

    try {
      await banUser(userId);
      setUsers(users.map(u => u.userID === userId ? { ...u, userStatus: 'BANNED' } : u));
      alert('Đã khóa tài khoản!');
    } catch (error: any) {
      alert(error.message || 'Khóa thất bại!');
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await unbanUser(userId);
      setUsers(users.map(u => u.userID === userId ? { ...u, userStatus: 'ACTIVE' } : u));
      alert('Đã mở khóa tài khoản!');
    } catch (error: any) {
      alert(error.message || 'Mở khóa thất bại!');
    }
  };

  const filteredUsers = users.filter(u => 
    u.userName?.toLowerCase().includes(search.toLowerCase()) ||
    u.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Quản lý người dùng</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="input-field max-w-md"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Tổng</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.userStatus === 'ACTIVE').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Banned</p>
          <p className="text-2xl font-bold text-red-600">
            {users.filter(u => u.userStatus === 'BANNED').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Admin</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Tên</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">SĐT</th>
              <th className="text-center py-3 px-4">Role</th>
              <th className="text-center py-3 px-4">Trạng thái</th>
              <th className="text-center py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.userID} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4">{user.userID}</td>
                <td className="py-3 px-4 font-medium">{user.userName}</td>
                <td className="py-3 px-4">{user.userEmail}</td>
                <td className="py-3 px-4">{user.phone}</td>
                <td className="py-3 px-4 text-center">
                  {user.role === 'ADMIN' ? (
                    <span className="badge-success">ADMIN</span>
                  ) : (
                    <span className="badge-warning">USER</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {user.userStatus === 'ACTIVE' ? (
                    <span className="badge-success">Active</span>
                  ) : (
                    <span className="badge-danger">Banned</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {user.role !== 'ADMIN' && (
                    <>
                      {user.userStatus === 'ACTIVE' ? (
                        <button
                          onClick={() => handleBan(user.userID)}
                          className="btn-danger px-3 py-1 text-sm"
                        >
                          Khóa
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnban(user.userID)}
                          className="btn-primary px-3 py-1 text-sm"
                        >
                          Mở khóa
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">Không tìm thấy người dùng</div>
      )}
    </div>
  );
}
