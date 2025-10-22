# Fix Token Authentication Issue

## Vấn đề

Middleware kiểm tra token trong **cookies** nhưng token chỉ được lưu trong **localStorage**, gây ra lỗi redirect về trang login ngay cả khi đã đăng nhập.

## Giải pháp đã triển khai

### 1. **Cập nhật `lib/auth.ts`**

#### `setToken()` - Lưu vào cả localStorage VÀ cookies:
```typescript
export function setToken(token: string) {
  localStorage.setItem('token', token);
  // Also set in cookie for middleware
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
}
```

#### `removeToken()` - Xóa cả localStorage VÀ cookies:
```typescript
export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  // Remove cookie
  document.cookie = 'token=; path=/; max-age=0';
}
```

#### `syncTokenToCookie()` - Sync token hiện có (cho user đã login):
```typescript
export function syncTokenToCookie() {
  if (typeof window === 'undefined') return;
  
  const token = localStorage.getItem('token');
  if (token) {
    const cookies = document.cookie.split(';');
    const hasTokenCookie = cookies.some(c => c.trim().startsWith('token='));
    
    if (!hasTokenCookie) {
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      console.log('Token synced to cookie');
    }
  }
}
```

### 2. **Tạo `components/TokenSync.tsx`**

Component tự động sync token khi app load:
```typescript
'use client';

import { useEffect } from 'react';
import { syncTokenToCookie } from '@/lib/auth';

export default function TokenSync() {
  useEffect(() => {
    syncTokenToCookie();
  }, []);

  return null;
}
```

### 3. **Thêm TokenSync vào `app/layout.tsx`**

```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <TokenSync />  {/* Sync token on every page load */}
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### 4. **Cập nhật `middleware.ts`**

- Thêm `/subscription` vào public routes
- Bỏ `/subscription` khỏi protected routes (cho phép guest xem)
- Thêm debug logs
- Sửa redirect sau login: `/dashboard` → `/` (trang chủ)

```typescript
// Public routes
const publicRoutes = ['/', '/login', '/register', '/search', '/posts', '/subscription'];

// Protected routes
const userRoutes = ['/dashboard', '/my-posts', '/create-post', '/payment', '/payment-history', '/profile'];
```

### 5. **Cập nhật tất cả trang protected**

- `/profile` - Profile page
- `/payment` - Payment page  
- `/dashboard` - User dashboard
- `/my-posts` - User listings
- `/create-post` - Create listing
- `/payment-history` - Payment history
- `/admin/**` - Admin pages

## Cách hoạt động

### Cho user mới (đăng ký/đăng nhập sau update):
1. User đăng nhập
2. `setToken()` lưu token vào localStorage + cookies
3. Middleware check cookies → ✅ Có token → cho phép truy cập

### Cho user đã đăng nhập (trước update):
1. User đã có token trong localStorage
2. Khi load bất kỳ trang nào → `TokenSync` component chạy
3. `syncTokenToCookie()` copy token từ localStorage → cookies
4. Middleware check cookies → ✅ Có token → cho phép truy cập

## Hướng dẫn cho người dùng hiện tại

### Cách 1: Tự động (khuyến nghị)
**Chỉ cần refresh trang!** Component `TokenSync` sẽ tự động sync token.

### Cách 2: Thủ công (nếu cách 1 không hoạt động)
Mở Console trong browser (F12) và chạy:
```javascript
const token = localStorage.getItem('token');
if (token) {
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
  console.log('Token synced!');
  location.reload();
}
```

### Cách 3: Đăng xuất và đăng nhập lại
1. Click "Đăng xuất"
2. Đăng nhập lại
3. Token sẽ được lưu đúng cách

## Kiểm tra token

Mở Console và chạy:
```javascript
// Check localStorage
console.log('localStorage token:', localStorage.getItem('token'));

// Check cookies
console.log('Cookies:', document.cookie);

// Should see: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Debug logs

Middleware sẽ log khi truy cập protected routes:
```
[Middleware] /subscription - Token: Present
[Middleware] /payment - Token: Missing
[Middleware] Redirecting /payment to /login - No token
```

Check Console để xem logs!

## Tổng kết

✅ **Tất cả đã được sửa tự động!**

- User mới: Token tự động lưu cả localStorage + cookies
- User cũ: Token tự động sync khi refresh trang
- Không cần thay đổi code ở các trang khác
- Middleware hoạt động đúng với cookies

**Chỉ cần refresh trang là xong!** 🎉
