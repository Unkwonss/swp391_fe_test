# Admin Dashboard

Hệ thống quản trị dành cho Admin/Moderator.

## Chức năng

### 1. Trang chủ Admin (`/admin`)
- Hiển thị thống kê tổng quan:
  - Tổng số người dùng
  - Số tin chờ duyệt
  - Số báo cáo chờ xử lý
- Quick links đến các trang quản lý

### 2. Duyệt tin đăng (`/admin/listings`)
- Xem danh sách tin chờ duyệt (status = PENDING)
- **Duyệt tin**: Click nút "✓ Duyệt" → tin chuyển sang ACTIVE
- **Từ chối tin**: Click nút "✗ Từ chối" → nhập lý do → tin chuyển sang REJECTED
- **Xem chi tiết**: Mở tin trong tab mới để xem đầy đủ

### 3. Quản lý người dùng (`/admin/users`)
- Xem danh sách tất cả người dùng
- Thông tin: email, role, trạng thái

### 4. Xử lý báo cáo (`/admin/reports`)
- Xem các báo cáo từ người dùng
- Xử lý và đóng báo cáo

## Phân quyền

### Ai có thể truy cập?
- **ADMIN**: Full quyền
- **MODERATOR**: Full quyền (ngang với Admin)
- **USER/GUEST**: Bị redirect về trang chủ

### Kiểm tra quyền
```typescript
// Trong mỗi trang admin
useEffect(() => {
  const user = getCurrentUser();
  if (!user || !isAdmin()) {
    router.push('/'); // Redirect về home nếu không phải admin
    return;
  }
  // ... load data
}, []);
```

## API Endpoints (Backend)

### Listing Management
- `GET /api/listing/pending?page=0&size=20` - Lấy tin chờ duyệt
- `POST /api/listing/approve/{id}` - Duyệt tin
- `POST /api/listing/reject/{id}` - Từ chối tin

### User Management
- `GET /api/users` - Lấy tất cả users

### Reports
- `GET /api/reports` - Lấy tất cả báo cáo
- `GET /api/reports/pending` - Lấy báo cáo chờ xử lý

## UI/UX

### Header
- Link "Admin" (màu đỏ) chỉ hiện khi user có role ADMIN/MODERATOR
- Click vào sẽ đến `/admin`

### Thống kê cards
- **Màu xanh**: Tổng người dùng
- **Màu vàng**: Tin chờ duyệt
- **Màu đỏ**: Báo cáo chờ xử lý

### Duyệt tin
- Mỗi tin hiển thị:
  - Hình ảnh
  - Tiêu đề, giá
  - Mô tả (3 dòng)
  - Thông tin: category, seller, email, phone
  - 3 nút: Duyệt, Từ chối, Xem chi tiết

### Modal từ chối
- Bắt buộc nhập lý do từ chối
- Có nút Hủy để đóng modal
- Xác nhận từ chối → gọi API reject

## Workflow duyệt bài

1. **User đăng tin**
   - Status = PENDING
   - Tin không hiện trên trang chủ

2. **Admin duyệt**
   - Vào `/admin/listings`
   - Xem danh sách tin PENDING
   - Click "Duyệt" hoặc "Từ chối"

3. **Sau khi duyệt**
   - ACTIVE → Tin hiện trên trang chủ
   - REJECTED → Tin không hiện, user nhận thông báo

4. **Thông báo**
   - Backend gửi notification cho seller
   - `notificationService.notifyListingApproved()` hoặc `notifyListingRejected()`

## Testing

### Tạo tin PENDING
```typescript
// Đăng nhập với user thường
// Tạo tin mới → Status mặc định là PENDING
```

### Test quyền Admin
```typescript
// Đăng nhập với user role = USER
// Truy cập /admin → Redirect về /
// Không thấy link "Admin" ở header

// Đăng nhập với user role = ADMIN
// Truy cập /admin → OK
// Thấy link "Admin" màu đỏ ở header
```

### Test duyệt tin
```typescript
// Đăng nhập Admin → vào /admin/listings
// Click "Duyệt" → Tin biến mất khỏi danh sách
// Kiểm tra trang chủ → Tin đã hiện
```

## Security

### Frontend Protection
- `isAdmin()` check trong useEffect
- Redirect nếu không phải admin
- Link "Admin" chỉ render với admin

### Backend Protection
**CẦN KIỂM TRA**: Backend cần có `@PreAuthorize("hasRole('ADMIN')")` hoặc middleware tương tự

```java
@PostMapping("/approve/{id}")
@PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
public ResponseEntity<?> approveListing(@PathVariable String id) {
    // ...
}
```

Nếu chưa có, phải thêm Spring Security config!

## Notes
- Tất cả API admin đã được implement
- UI responsive với Tailwind CSS
- Loading states đã có
- Error handling đã có (try-catch + alert)
- Modal với backdrop để từ chối tin
