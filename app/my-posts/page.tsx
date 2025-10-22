'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getListingsBySeller, deleteListing } from '@/lib/api';
import type { User, Listing } from '@/lib/types';

export default function MyPostsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'REJECTED'>('ALL');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    try {
      if (!user) return;
      // FIXED: Backend uses /listing/seller/{id} not /my-posts
      const data = await getListingsBySeller(user.userID);
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin này?')) return;

    try {
      await deleteListing(id);
      setListings(listings.filter(l => l.listingId !== id));
      alert('Đã xóa tin thành công!');
    } catch (error: any) {
      alert(error.message || 'Xóa thất bại!');
    }
  };

  const filteredListings = filter === 'ALL' 
    ? listings 
    : listings.filter(l => l.status === filter);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tin đăng của tôi</h1>
        <Link href="/create-post" className="btn-primary">
          ➕ Đăng tin mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Tất cả</p>
          <p className="text-2xl font-bold">{listings.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Đang bán</p>
          <p className="text-2xl font-bold text-green-600">
            {listings.filter(l => l.status === 'ACTIVE').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-600">
            {listings.filter(l => l.status === 'PENDING').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-gray-600 mb-1">Từ chối</p>
          <p className="text-2xl font-bold text-red-600">
            {listings.filter(l => l.status === 'REJECTED').length}
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
          onClick={() => setFilter('ACTIVE')}
          className={`px-4 py-2 rounded-lg ${filter === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Đang bán
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg ${filter === 'PENDING' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
        >
          Chờ duyệt
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 rounded-lg ${filter === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          Từ chối
        </button>
      </div>

      {/* Listings */}
      {filteredListings.length > 0 ? (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <div key={listing.listingId} className="card flex gap-4">
              <div className="relative w-48 h-32 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={listing.imageUrls?.[0] || '/placeholder.jpg'}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{listing.title}</h3>
                    <p className="text-2xl font-bold text-blue-600">{listing.price?.toLocaleString('vi-VN')} đ</p>
                  </div>
                  <div>
                    {listing.status === 'ACTIVE' && <span className="badge-success">Đang bán</span>}
                    {listing.status === 'PENDING' && <span className="badge-warning">Chờ duyệt</span>}
                    {listing.status === 'REJECTED' && <span className="badge-danger">Từ chối</span>}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Đăng ngày: {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                  </p>

                  <div className="flex gap-2">
                    <Link href={`/posts/${listing.listingId}`} className="btn-secondary px-3 py-1 text-sm">
                      Xem
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.listingId)}
                      className="btn-danger px-3 py-1 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Không có tin đăng nào</p>
          <Link href="/create-post" className="btn-primary inline-block">
            Đăng tin ngay
          </Link>
        </div>
      )}
    </div>
  );
}
