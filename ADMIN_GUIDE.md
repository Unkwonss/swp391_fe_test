# 🔐 Hướng dẫn sử dụng Admin Dashboard

## ✅ Hoàn tất

Hệ thống admin dashboard đã được tích hợp đầy đủ với:

### Frontend (Next.js)
- ✅ Trang admin dashboard: `/admin`
- ✅ Trang duyệt bài: `/admin/listings`
- ✅ Trang quản lý users: `/admin/users`
- ✅ Trang xử lý reports: `/admin/reports`
- ✅ Auth guard: `isAdmin()` check
- ✅ Header link: Chỉ hiện với ADMIN/MODERATOR

### Backend (Spring Boot)
- ✅ API `/listing/pending` - Lấy tin chờ duyệt
- ✅ API `/listing/approve/{id}` - Duyệt tin
- ✅ API `/listing/reject/{id}` - Từ chối tin
- ✅ Security: `@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")`
- ✅ Notification: Tự động thông báo cho seller

## 🚀 Cách sử dụng

### 1. Đăng nhập Admin
```
Email: admin@example.com (hoặc account có role = ADMIN)
Password: [password của bạn]
```

### 2. Truy cập Admin Dashboard
- Sau khi đăng nhập, bạn sẽ thấy link **"Admin"** màu đỏ ở header
- Click vào link → Đến trang `/admin`

### 3. Duyệt tin đăng
**Bước 1:** Click vào card **"📝 Duyệt tin"**

**Bước 2:** Xem danh sách tin chờ duyệt
- Mỗi tin hiển thị đầy đủ: hình ảnh, tiêu đề, giá, mô tả, thông tin seller

**Bước 3:** Chọn hành động
- **✓ Duyệt**: 
  - Click nút "✓ Duyệt"
  - Confirm → Tin chuyển sang ACTIVE
  - Seller nhận thông báo
  - Tin hiện trên trang chủ
  
- **✗ Từ chối**:
  - Click nút "✗ Từ chối"
  - Modal hiện ra
  - **Nhập lý do từ chối** (bắt buộc)
  - Click "Xác nhận từ chối"
  - Tin chuyển sang REJECTED
  - Seller nhận thông báo kèm lý do

- **👁️ Xem chi tiết**:
  - Mở tin trong tab mới
  - Xem đầy đủ thông tin trước khi quyết định

## 🔒 Phân quyền

### Ai được truy cập?
| Role | Truy cập /admin | Duyệt bài | Quản lý users |
|------|----------------|-----------|---------------|
| GUEST | ❌ | ❌ | ❌ |
| USER | ❌ | ❌ | ❌ |
| MODERATOR | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ |

### Frontend Protection
```typescript
// Mỗi trang admin đều có check này
useEffect(() => {
  const user = getCurrentUser();
  if (!user || !isAdmin()) {
    router.push('/'); // Redirect về home
    return;
  }
  // ... load data
}, []);
```

### Backend Protection
```java
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
@PostMapping("/approve/{id}")
public ResponseEntity<?> approveListing(@PathVariable String id) {
    // Chỉ ADMIN/MODERATOR mới gọi được
}
```

## 📊 Dashboard Stats

### Thống kê hiển thị
1. **Tổng người dùng** (màu xanh)
2. **Tin chờ duyệt** (màu vàng)
3. **Báo cáo chờ xử lý** (màu đỏ)

### Quick Actions
- 👥 Người dùng
- 📝 Duyệt tin (hiển thị số tin chờ)
- 🚨 Báo cáo (hiển thị số báo cáo chờ)
- 💎 Gói đăng ký

## 🔄 Workflow hoàn chỉnh

### User đăng tin
```
1. User tạo tin mới
2. Backend set status = PENDING
3. Tin KHÔNG hiện trên trang chủ
4. User thấy tin trong "Tin của tôi" với status "Chờ duyệt"
```

### Admin duyệt
```
1. Admin vào /admin/listings
2. Xem danh sách tin PENDING
3. Click "Duyệt" HOẶC "Từ chối"
```

### Sau khi duyệt
```
✅ APPROVED (ACTIVE):
   - Status = ACTIVE
   - Tin hiện trên trang chủ
   - User nhận notification "Tin đã được duyệt"

❌ REJECTED:
   - Status = REJECTED
   - Tin KHÔNG hiện trên trang chủ
   - User nhận notification "Tin bị từ chối" + lý do
```

### Thông báo
Backend tự động gửi notification:
```java
// Khi approve
notificationService.notifyListingApproved(seller, listing);

// Khi reject
notificationService.notifyListingRejected(seller, listing);
```

## 🧪 Testing

### Test 1: Tạo tin PENDING
```
1. Đăng nhập với USER thường
2. Tạo tin mới → Status = PENDING
3. Vào "Tin của tôi" → Thấy tin status "Chờ duyệt"
4. Vào trang chủ → KHÔNG thấy tin
```

### Test 2: Kiểm tra quyền
```
1. Đăng nhập với USER (role = USER)
2. Vào /admin → Bị redirect về /
3. Header KHÔNG có link "Admin"

4. Đăng nhập với ADMIN (role = ADMIN)
5. Vào /admin → OK
6. Header CÓ link "Admin" màu đỏ
```

### Test 3: Duyệt tin
```
1. Đăng nhập ADMIN
2. Vào /admin/listings
3. Click "✓ Duyệt" trên một tin
4. Confirm → Tin biến mất khỏi danh sách pending
5. Vào trang chủ → Tin đã hiện
6. User nhận notification
```

### Test 4: Từ chối tin
```
1. Đăng nhập ADMIN
2. Vào /admin/listings
3. Click "✗ Từ chối" trên một tin
4. Modal hiện → Nhập lý do "Hình ảnh không phù hợp"
5. Click "Xác nhận từ chối"
6. Tin biến mất khỏi danh sách pending
7. User nhận notification kèm lý do
```

### Test 5: Security Backend
```
1. Logout khỏi admin
2. Dùng Postman gọi:
   POST http://localhost:8080/api/listing/approve/123
   (Không có token hoặc token của USER)
3. Kết quả: 403 Forbidden
```

## 🎨 UI/UX

### Color Coding
- **Blue**: User stats
- **Yellow**: Pending items
- **Red**: Reports/Alerts
- **Green**: Success states

### Responsive
- Desktop: Grid 3 columns
- Tablet: Grid 2 columns
- Mobile: Stack vertically

### Loading States
```tsx
{loading ? (
  <div className="spinner">...</div>
) : (
  <div className="content">...</div>
)}
```

### Error Handling
```typescript
try {
  await approveListing(id);
  alert('Đã duyệt tin!');
} catch (error: any) {
  alert(error.message || 'Duyệt thất bại!');
}
```

## 🔧 Troubleshooting

### Vấn đề: Không thấy link "Admin" ở header
**Nguyên nhân**: User không có role ADMIN/MODERATOR
**Giải pháp**: 
```sql
-- Kiểm tra role trong database
SELECT userID, userName, email, role FROM users WHERE email = 'your@email.com';

-- Update role
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### Vấn đề: Bị redirect về / khi vào /admin
**Nguyên nhân**: Token hết hạn hoặc không đủ quyền
**Giải pháp**:
1. Logout và login lại
2. Kiểm tra localStorage có token không
3. Kiểm tra role trong userData

### Vấn đề: API trả về 403 Forbidden
**Nguyên nhân**: Backend security không nhận role
**Giải pháp**:
```java
// Kiểm tra JWT filter có set authorities không
// Trong JwtAuthenticationFilter.java
UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
    userDetails,
    null,
    userDetails.getAuthorities() // ← Phải có
);
```

### Vấn đề: Tin không biến mất sau khi duyệt
**Nguyên nhân**: Frontend không refresh list
**Giải pháp**: 
```typescript
// Sau khi approve/reject
await approveListing(id);
setListings(listings.filter(l => l.listingId !== id)); // ← Loại bỏ khỏi list
```

## 📝 Notes

- ✅ Tất cả API đã được implement
- ✅ Security đã được thêm (`@PreAuthorize`)
- ✅ UI responsive với Tailwind CSS
- ✅ Loading states đã có
- ✅ Error handling đã có
- ✅ Notifications đã tích hợp
- ✅ Modal với backdrop
- ✅ Frontend auth guard

## 🎯 Next Steps (Optional)

### Nâng cao
1. **Bulk Actions**: Duyệt nhiều tin cùng lúc
2. **Filters**: Lọc theo category, date, seller
3. **Search**: Tìm tin theo title, seller
4. **Analytics**: Biểu đồ thống kê duyệt tin theo thời gian
5. **Activity Log**: Lưu lại lịch sử duyệt/từ chối của admin

### Tính năng thêm
- Email notification (thay vì in-app)
- Export danh sách tin (CSV/Excel)
- Schedule auto-reject tin quá 7 ngày không duyệt
- Rating system cho tin đăng
