'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { getPendingListings, approveListing, rejectListing } from '@/lib/api';
import type { User, Listing } from '@/lib/types';

export default function AdminListingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !isAdmin()) {
      router.push('/');
      return;
    }
    setCurrentUser(user);
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      // Backend returns array directly, not Page object
      const data = await getPendingListings();
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt tin này?')) return;

    try {
      await approveListing(id);
      setListings(listings.filter(l => l.listingId !== id));
      alert('Đã duyệt tin!');
      setSelectedListing(null);
    } catch (error: any) {
      alert(error.message || 'Duyệt thất bại!');
    }
  };

  const handleReject = async () => {
    if (!selectedListing) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }

    try {
      await rejectListing(selectedListing.listingId);
      setListings(listings.filter(l => l.listingId !== selectedListing.listingId));
      alert(`Đã từ chối tin!\nLý do: ${rejectReason}`);
      setSelectedListing(null);
      setRejectReason('');
    } catch (error: any) {
      alert(error.message || 'Từ chối thất bại!');
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
      <h1 className="text-3xl font-bold mb-8">Duyệt tin đăng</h1>

      <div className="mb-4">
        <p className="text-gray-600">Có <strong>{listings.length}</strong> tin chờ duyệt</p>
      </div>

      {listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.listingId} className="card flex gap-6">
              <div className="relative w-64 h-48 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={listing.imageUrls?.[0] || '/placeholder.jpg'}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {listing.price?.toLocaleString('vi-VN')} đ
                </p>

                <p className="text-gray-700 mb-3 line-clamp-3">{listing.description}</p>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                  <p>📦 {listing.categoryName}</p>
                  <p>👤 {listing.sellerName}</p>
                  <p>📧 {listing.sellerEmail}</p>
                  <p>📞 {listing.contact}</p>
                  {listing.brand && <p>🏷️ {listing.brand}</p>}
                  {listing.model && <p>📱 {listing.model}</p>}
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Đăng ngày: {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(listing.listingId)}
                    className="btn-primary px-6 py-2"
                  >
                    ✓ Duyệt
                  </button>
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="btn-danger px-6 py-2"
                  >
                    ✗ Từ chối
                  </button>
                  <button
                    onClick={() => window.open(`/posts/${listing.listingId}`, '_blank')}
                    className="btn-secondary px-6 py-2"
                  >
                    👁️ Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Không có tin chờ duyệt</p>
        </div>
      )}

      {/* Reject Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Từ chối tin đăng</h2>
            <p className="text-gray-700 mb-4">
              Bạn đang từ chối tin: <strong>{selectedListing.title}</strong>
            </p>
            <div className="mb-6">
              <label className="block mb-2 font-medium">Lý do từ chối:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field"
                rows={4}
                placeholder="Nhập lý do từ chối (bắt buộc)..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setRejectReason('');
                }}
                className="flex-1 btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="flex-1 btn-danger"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
