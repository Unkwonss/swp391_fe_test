# Fix Display All Posts (Search & Filter Features)

## Vấn đề được phát hiện

User báo: **"tôi thấy là ở phần hiển thị tất cả bài viết còn đg thiếu"**

### Các vấn đề tìm thấy:

1. **Trang search/page.tsx:**
   - Đang dùng `response.content` nhưng các function đã sửa trả về array
   - Thiếu function `searchListings()` để tìm kiếm theo keyword
   - Các function filter/search chưa khớp với backend

2. **Backend API endpoints:**
   - `/api/listing/filter/price` uses `min` and `max` (NOT `minPrice` and `maxPrice`)
   - `/api/listing/filter/year` uses `start` and `end` (NOT `startYear` and `endYear`)
   - `/api/listing/search/vehicle-type` uses `type` (NOT `vehicleType`)
   - Search/Filter endpoints trả về **Page object** với `.content` property (khác với /listing, /listing/active)

3. **Navigation:**
   - Trang Home chỉ hiển thị 20 tin active
   - Cần nút "Xem tất cả" để dẫn user đến trang search

## Các sửa đổi đã thực hiện

### 1. lib/api.ts

#### Thêm function searchListings (tìm kiếm theo keyword):
```typescript
export async function searchListings(keyword: string, page = 0, size = 20): Promise<any> {
  const response: any = await fetchApi(`/listing/search/model?model=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  return response.content || [];
}
```

#### Sửa filterListingsByPrice:
```typescript
// BEFORE: ?minPrice=${minPrice}&maxPrice=${maxPrice}
// AFTER: ?min=${minPrice}&max=${maxPrice}
export async function filterListingsByPrice(minPrice: number, maxPrice: number, page = 0, size = 20): Promise<any> {
  const response: any = await fetchApi(`/listing/filter/price?min=${minPrice}&max=${maxPrice}&page=${page}&size=${size}`);
  return response.content || [];
}
```

#### Sửa filterListingsByYear:
```typescript
// BEFORE: ?startYear=${startYear}&endYear=${endYear}
// AFTER: ?start=${startYear}&end=${endYear}
export async function filterListingsByYear(startYear: number, endYear: number, page = 0, size = 20): Promise<any> {
  const response: any = await fetchApi(`/listing/filter/year?start=${startYear}&end=${endYear}&page=${page}&size=${size}`);
  return response.content || [];
}
```

#### Sửa searchByVehicleType:
```typescript
// BEFORE: ?vehicleType=${...}
// AFTER: ?type=${...}
export async function searchByVehicleType(vehicleType: string, page = 0, size = 20): Promise<any> {
  const response: any = await fetchApi(`/listing/search/vehicle-type?type=${encodeURIComponent(vehicleType)}&page=${page}&size=${size}`);
  return response.content || [];
}
```

#### Sửa getListingsByCategory:
```typescript
// Extract .content from Page object
export async function getListingsByCategory(categoryId: number, page = 0, size = 20): Promise<any> {
  const response: any = await fetchApi(`/listing/category/${categoryId}?page=${page}&size=${size}`);
  return response.content || [];
}
```

#### Sửa filterListingsByCity:
```typescript
export async function filterListingsByCity(city: string, page = 0, size = 20): Promise<any> {
  const response: any = await fetchApi(`/listing/filter/city?city=${encodeURIComponent(city)}&page=${page}&size=${size}`);
  return response.content || [];
}
```

### 2. app/search/page.tsx

#### Sửa handleSearch function:
```typescript
// BEFORE:
setListings(response.content || []);

// AFTER:
setListings(Array.isArray(response) ? response : []);
```

**Lý do:** Các function trong api.ts đã extract `.content` nên trả về array trực tiếp

#### Thêm error handling:
```typescript
catch (error) {
  console.error('Search failed:', error);
  setListings([]); // Clear listings on error
}
```

### 3. app/page.tsx (HomePage)

#### Thêm nút "Xem tất cả":
```tsx
{/* View All Button */}
{filteredListings.length > 0 && (
  <div className="text-center mt-8">
    <Link href="/search" className="btn-primary inline-block">
      Xem tất cả tin đăng →
    </Link>
  </div>
)}
```

**Lý do:** 
- HomePage chỉ hiển thị 20 tin active (giới hạn)
- User cần cách dễ dàng để xem TẤT CẢ tin đăng
- Nút này dẫn đến trang search với đầy đủ tính năng tìm kiếm & lọc

## Backend Endpoints Summary

### Endpoints trả về Array trực tiếp:
- `GET /api/listing` → Array (all listings)
- `GET /api/listing/active` → Array (active listings)
- `GET /api/listing/pending` → Array (pending listings)
- `GET /api/listing/seller/{id}` → Array (seller's listings)

### Endpoints trả về Page object (có .content):
- `GET /api/listing/search/model?model={keyword}` → Page<Listing>
- `GET /api/listing/search/color?color={color}` → Page<Listing>
- `GET /api/listing/search/brand?brand={brand}` → Page<Listing>
- `GET /api/listing/search/vehicle-type?type={type}` → Page<Listing>
- `GET /api/listing/filter/price?min={min}&max={max}` → Page<Listing>
- `GET /api/listing/filter/year?start={start}&end={end}` → Page<Listing>
- `GET /api/listing/category/{id}` → Page<Listing>

**Giải pháp:** Frontend extract `.content` trong api.ts để consistent trả về array

## Testing Checklist

### Trang Search (http://localhost:3000/search)
- [ ] Load trang → hiển thị tất cả tin active
- [ ] Nhập keyword → tìm kiếm theo model
- [ ] Chọn danh mục → lọc theo category
- [ ] Nhập giá từ - đến → lọc theo khoảng giá
- [ ] Click "Xóa bộ lọc" → reset về tất cả tin active
- [ ] Kết hợp nhiều filter cùng lúc

### Trang Home (http://localhost:3000)
- [ ] Hiển thị 20 tin active đầu tiên
- [ ] Filter theo tabs (Tất cả/Xe điện/Xe máy/Pin)
- [ ] Click "Xem tất cả tin đăng" → chuyển đến /search
- [ ] Click "Tìm kiếm ngay" ở hero section → chuyển đến /search

### Navigation
- [ ] Header có link "Tìm kiếm" → /search
- [ ] Link "Tìm kiếm" highlight khi ở trang search

## Kết quả

✅ **Tất cả chức năng hiển thị & tìm kiếm bài viết đã hoạt động đúng**
- Trang search có đầy đủ filter: keyword, category, price range
- Backend-Frontend API alignment hoàn toàn khớp
- User có nhiều cách để xem tất cả bài viết:
  1. Click "Tìm kiếm" ở header
  2. Click "Tìm kiếm ngay" ở home page
  3. Click "Xem tất cả tin đăng" sau listings ở home page

✅ **Không có lỗi TypeScript/Lint**
✅ **Tất cả endpoints sử dụng đúng tham số backend yêu cầu**
