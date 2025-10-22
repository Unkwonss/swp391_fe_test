'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getListingById, createReview, reportListing } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { Listing, User } from '@/lib/types';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Report form
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    setUser(getCurrentUser());
    loadListing();
  }, [params.id]);

  const loadListing = async () => {
    try {
      const data = await getListingById(params.id as string);
      setListing(data);
    } catch (error) {
      console.error('Failed to load listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await createReview(listing!.listingId, rating, comment);
      alert('Đánh giá thành công!');
      setShowReviewForm(false);
      setComment('');
      setRating(5);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await reportListing(listing!.listingId, reportReason, reportDescription);
      alert('Báo cáo đã được gửi!');
      setShowReportForm(false);
      setReportReason('');
      setReportDescription('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Không tìm thấy tin đăng</p>
      </div>
    );
  }

  const images = listing.imageUrls || [];
  const canShowContact = user !== null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images & Details */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Main Image */}
            <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
              <Image
                src={images[selectedImage] || '/placeholder.jpg'}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative h-20 rounded-lg overflow-hidden ${
                      idx === selectedImage ? 'ring-2 ring-blue-600' : ''
                    }`}
                  >
                    <Image src={img} alt={`Image ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Price */}
            <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
            <div className="text-3xl font-bold text-blue-600 mb-6">
              {listing.price?.toLocaleString('vi-VN')} đ
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Mô tả</h2>
              <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Specifications */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Thông tin chi tiết</h2>
              <div className="grid grid-cols-2 gap-4">
                {listing.brand && <div><strong>Thương hiệu:</strong> {listing.brand}</div>}
                {listing.model && <div><strong>Model:</strong> {listing.model}</div>}
                {listing.year && <div><strong>Năm sản xuất:</strong> {listing.year}</div>}
                {listing.color && <div><strong>Màu sắc:</strong> {listing.color}</div>}
                {listing.seats && <div><strong>Số chỗ:</strong> {listing.seats}</div>}
                {listing.mileage && <div><strong>Quãng đường:</strong> {listing.mileage} km</div>}
                {listing.batteryCapacity && <div><strong>Dung lượng pin:</strong> {listing.batteryCapacity}</div>}
                {listing.cycleCount && <div><strong>Số chu kỳ sạc:</strong> {listing.cycleCount}</div>}
                {listing.warrantyInfo && <div><strong>Bảo hành:</strong> {listing.warrantyInfo}</div>}
              </div>
            </div>
          </div>

          {/* Review & Report Buttons */}
          {user && (
            <div className="flex gap-4 mt-6">
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-primary">
                ⭐ Đánh giá
              </button>
              <button onClick={() => setShowReportForm(!showReportForm)} className="btn-danger">
                🚨 Báo cáo
              </button>
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReview} className="card mt-4">
              <h3 className="text-lg font-semibold mb-4">Viết đánh giá</h3>
              <div className="mb-4">
                <label className="block mb-2">Đánh giá:</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="input-field">
                  {[5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{'⭐'.repeat(r)} ({r} sao)</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Nhận xét:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input-field"
                  rows={4}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Gửi đánh giá</button>
            </form>
          )}

          {/* Report Form */}
          {showReportForm && (
            <form onSubmit={handleReport} className="card mt-4">
              <h3 className="text-lg font-semibold mb-4">Báo cáo vi phạm</h3>
              <div className="mb-4">
                <label className="block mb-2">Lý do:</label>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="input-field" required>
                  <option value="">Chọn lý do</option>
                  <option value="spam">Spam</option>
                  <option value="fake">Thông tin giả mạo</option>
                  <option value="inappropriate">Nội dung không phù hợp</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Mô tả chi tiết:</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="input-field"
                  rows={4}
                  required
                />
              </div>
              <button type="submit" className="btn-danger">Gửi báo cáo</button>
            </form>
          )}
        </div>

        {/* Right: Contact Info */}
        <div>
          <div className="card sticky top-20">
            <h3 className="text-xl font-semibold mb-4">Thông tin người bán</h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">👤 {listing.sellerName}</p>
              <p className="text-gray-600 mb-2">📧 {canShowContact ? listing.sellerEmail : '***@***.com'}</p>
              <p className="text-gray-600 mb-4">📞 {canShowContact ? listing.contact : '***-***-****'}</p>
            </div>

            {!canShowContact && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  Đăng nhập để xem thông tin liên hệ
                </p>
              </div>
            )}

            {canShowContact ? (
              <button className="w-full btn-primary mb-2">
                📞 Gọi điện
              </button>
            ) : (
              <button onClick={() => router.push('/login')} className="w-full btn-primary mb-2">
                Đăng nhập để liên hệ
              </button>
            )}

            <div className="text-sm text-gray-500 mt-4">
              <p>Đăng ngày: {new Date(listing.createdAt).toLocaleDateString('vi-VN')}</p>
              <p>Trạng thái: <span className="badge-success">{listing.status}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
