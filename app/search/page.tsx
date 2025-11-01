'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { searchListings, filterListingsByPrice, getListingsByCategory } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import type { Listing } from '@/lib/types';

export default function SearchPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [filters, setFilters] = useState({
    keyword: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    setUser(getCurrentUser());
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let response;
      
      if (filters.minPrice && filters.maxPrice) {
        response = await filterListingsByPrice(
          Number(filters.minPrice),
          Number(filters.maxPrice)
        );
      } else if (filters.keyword) {
        response = await searchListings(filters.keyword);
      } else if (filters.category !== 'all') {
        response = await getListingsByCategory(Number(filters.category));
      } else {
        const { getActiveListings } = await import('@/lib/api');
        response = await getActiveListings();
      }
      
      // FIXED: These functions now return arrays directly (not Page objects)
      setListings(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Search failed:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tìm kiếm tin đăng</h1>

      {/* Search & Filter Form */}
      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Từ khóa</label>
            <input
              type="text"
              className="input-field"
              placeholder="Tìm kiếm..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Danh mục</label>
            <select
              className="input-field"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">Tất cả</option>
              <option value="1">Xe điện</option>
              <option value="2">Xe máy điện</option>
              <option value="3">Pin xe điện</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Giá từ (VNĐ)</label>
            <input
              type="number"
              className="input-field"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Giá đến (VNĐ)</label>
            <input
              type="number"
              className="input-field"
              placeholder="1000000000"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <button onClick={handleSearch} className="btn-primary">
            🔍 Tìm kiếm
          </button>
          <button
            onClick={() => {
              setFilters({ keyword: '', category: 'all', minPrice: '', maxPrice: '' });
              handleSearch();
            }}
            className="btn-secondary"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            Tìm thấy <strong>{listings.length}</strong> kết quả
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.listingId} listing={listing} showContact={user !== null} />
            ))}
          </div>
        </>
      )}

      {listings.length === 0 && !loading && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Không tìm thấy kết quả nào</p>
        </div>
      )}
    </div>
  );
}

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
        />
      </div>

      <h3 className="font-bold text-lg mb-2 line-clamp-2">{listing.title}</h3>
      
      <div className="text-2xl font-bold text-blue-600 mb-2">
        {listing.price?.toLocaleString('vi-VN')} đ
      </div>

      <div className="text-sm text-gray-600">
        <p className="line-clamp-2 mb-2">{listing.description}</p>
        <p>📦 {listing.categoryName}</p>
        {showContact && <p>📞 {listing.contact}</p>}
      </div>
    </Link>
  );
}
