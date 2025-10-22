'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getActiveListings } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { Listing, User } from '@/lib/types';

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'all' | 'xe-dien' | 'pin'>('all');

  useEffect(() => {
    setUser(getCurrentUser());
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      // Backend returns array directly, not Page object
      const listings = await getActiveListings(0, 20);
      setListings(Array.isArray(listings) ? listings : []);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true;
    if (filter === 'xe-dien') return listing.categoryName?.includes('Car') || listing.categoryName?.includes('Electric');
    if (filter === 'pin') return listing.categoryName?.includes('Battery') || listing.categoryName?.includes('Pin');
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-12 mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Mua bán Xe Điện & Pin
        </h1>
        <p className="text-xl mb-6">
          Nền tảng rao vặt trực tuyến cho xe điện và pin đã qua sử dụng
        </p>
        <div className="flex gap-4">
          <Link href="/search" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Tìm kiếm ngay
          </Link>
          {user ? (
            <Link href="/create-post" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400">
              Đăng tin
            </Link>
          ) : (
            <Link href="/register" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400">
              Đăng ký ngay
            </Link>
          )}
        </div>
      </section>

      {/* Subscription Promotion Banner */}
      {user && (
        <section className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-8 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🚀 Nâng cấp tài khoản ngay!</h2>
              <p className="text-lg opacity-90">Đăng tin không giới hạn với gói Premium & VIP</p>
            </div>
            <Link 
              href="/subscription" 
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg"
            >
              💎 Xem gói đăng ký
            </Link>
          </div>
        </section>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('xe-dien')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'xe-dien' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          🚗 Xe điện
        </button>
        <button
          onClick={() => setFilter('pin')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            filter === 'pin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          🔋 Pin
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.listingId} listing={listing} showContact={user !== null} />
            ))}
          </div>
          
          {/* View All Button */}
          {filteredListings.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/search" className="btn-primary inline-block">
                Xem tất cả tin đăng →
              </Link>
            </div>
          )}
        </>
      )}

      {filteredListings.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Không có tin đăng nào</p>
        </div>
      )}
    </div>
  );
}

// Listing Card Component
function ListingCard({ listing, showContact }: { listing: Listing; showContact: boolean }) {
  const imageUrl = listing.imageUrls?.[0] || '/placeholder.jpg';
  
  return (
    <Link href={`/posts/${listing.listingId}`} className="card hover:shadow-xl transition-shadow">
      <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
        <Image
          src={imageUrl}
          alt={listing.title}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.jpg';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="badge-success">{listing.status}</span>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2 line-clamp-2">{listing.title}</h3>
      
      <div className="text-2xl font-bold text-blue-600 mb-2">
        {listing.price?.toLocaleString('vi-VN')} đ
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p className="line-clamp-2">{listing.description}</p>
        <p>📦 {listing.categoryName}</p>
        <p>👤 {listing.sellerName}</p>
        {showContact && (
          <p>📞 {listing.contact}</p>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        {new Date(listing.createdAt).toLocaleDateString('vi-VN')}
      </div>
    </Link>
  );
}
