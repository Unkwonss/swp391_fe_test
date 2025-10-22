# 🔧 TÓM TẮT CÁC LỖI API ĐÃ SỬA (Frontend Ver 2)

## ✅ Đã Audit Toàn Bộ 15 Backend Controllers

### 📋 Danh Sách Controllers Đã Đọc:
1. ✅ ListController.java (19 endpoints)
2. ✅ UserController.java (13 endpoints)
3. ✅ SubController.java (8 endpoints)
4. ✅ PaymentController.java (13 endpoints)
5. ✅ ReviewController.java (10 endpoints)
6. ✅ ReportController.java (8 endpoints)
7. ✅ UserSubController.java (6 endpoints)
8. ✅ CategoryController.java (5 endpoints)
9. ✅ NotificationController.java (4 endpoints)
10. ✅ FavoriteController.java (3 endpoints)
11. ✅ HomeController.java (2 endpoints - OAuth)
12. ✅ AdminDashController.java (1 endpoint)
13. ✅ VNPayController.java (3 endpoints)
14. ✅ RoleController.java
15. ✅ ImgController.java

---

## 🚨 CÁC LỖI NGHIÊM TRỌNG ĐÃ SỬA

### 1. **AUTHENTICATION APIs** (lib/auth.ts)
#### ❌ LỖI:
```typescript
// SAI - Backend không có /api/auth/register
const res = await fetch(`${API_URL}/auth/register`, ...)
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG - Backend dùng /api/users/register
const res = await fetch(`${API_URL}/users/register`, ...)
```

**File:** `lib/auth.ts` line 91

---

### 2. **USER MANAGEMENT APIs** (lib/api.ts)

#### ❌ LỖI #1: Get All Users
```typescript
// SAI - Backend dùng /users/list không phải /users
return fetchApi(`/users?page=${page}&size=${size}`);
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG
return fetchApi(`/users/list?page=${page}&size=${size}`);
```

---

#### ❌ LỖI #2: Ban User
```typescript
// SAI - Backend dùng PUT /users/ban/{id} không phải POST /users/{id}/ban
return fetchApi(`/users/${userId}/ban`, { method: 'POST' });
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG
return fetchApi(`/users/ban/${userId}`, { method: 'PUT' });
```

---

#### ❌ LỖI #3: Unban User
```typescript
// SAI - Backend dùng PUT /users/active/{id} không phải POST /users/{id}/unban
return fetchApi(`/users/${userId}/unban`, { method: 'POST' });
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG
return fetchApi(`/users/active/${userId}`, { method: 'PUT' });
```

---

### 3. **LISTING APIs** (lib/api.ts)

#### ❌ LỖI #1: Search Listings
```typescript
// SAI - Backend không có generic search endpoint
return fetchApi(`/listing/search?q=${query}&page=${page}&size=${size}`);
```

#### ✅ ĐÃ SỬA - Thêm Các Endpoint Cụ Thể:
```typescript
// Backend có các endpoint search riêng biệt:
searchByBrand(brand)     → /listing/search/brand
searchByModel(model)     → /listing/search/model
searchByColor(color)     → /listing/search/color
searchByVehicleType(type) → /listing/search/vehicle-type
```

---

#### ❌ LỖI #2: Filter By Price
```typescript
// SAI - Backend dùng minPrice/maxPrice không phải min/max
return fetchApi(`/listing/filter/price?min=${min}&max=${max}&page=${page}&size=${size}`);
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG
return fetchApi(`/listing/filter/price?minPrice=${minPrice}&maxPrice=${maxPrice}&page=${page}&size=${size}`);
```

---

### 4. **SUBSCRIPTION APIs** (lib/api.ts)

#### ❌ LỖI:
```typescript
// SAI - Backend dùng /subscription không phải /subscriptions
return fetchApi('/subscriptions');
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG
return fetchApi('/subscription');
```

---

### 5. **REVIEW APIs** (lib/api.ts)

#### ❌ LỖI:
```typescript
// SAI - Backend dùng /review không phải /reviews
// Và reviews là cho users không phải listings
return fetchApi(`/reviews/listing/${listingId}?page=${page}&size=${size}`);
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG - Reviews là về người dùng
getReviewsByReviewer(userId)   → /review/reviewer/{userId}
getReviewsAboutUser(userId)    → /review/reviewed/{userId}
getUserReviewSummary(userId)   → /review/summary/{userId}
```

---

### 6. **REPORT APIs** (lib/api.ts)

#### ❌ LỖI:
```typescript
// SAI - Backend dùng /report không phải /reports
return fetchApi('/reports', { method: 'POST', ... });
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG
return fetchApi('/report/create', { method: 'POST', ... });
```

---

### 7. **PAYMENT APIs** (lib/api.ts)

#### ❌ LỖI:
```typescript
// SAI - Backend dùng /payment không phải /payments
return fetchApi(`/payments/history?page=${page}&size=${size}`);
```

#### ✅ ĐÃ SỬA:
```typescript
// ĐÚNG
return fetchApi(`/payment/user/${userId}`);
```

---

## 🆕 CÁC API MỚI ĐÃ THÊM

### **USER APIs:**
- ✅ `getUserById(userId)` → GET /users/{id}
- ✅ `getUsersByCity(city)` → GET /users/city
- ✅ `updateUserProfile(data)` → PUT /users/profile
- ✅ `updateUserStatus(userId, status)` → PUT /users/status/{id}
- ✅ `updateUserRole(userId, roleId)` → PUT /users/role/{id}
- ✅ `deleteUser(userId)` → DELETE /users/{id}
- ✅ `updateAvatar(file)` → POST /users/avatar (multipart)

### **LISTING APIs:**
- ✅ `getListingsBySeller(sellerId)` → GET /listing/seller/{id}
- ✅ `getListingsByStatus(status)` → GET /listing/status/{status}
- ✅ `searchByBrand(brand)` → GET /listing/search/brand
- ✅ `searchByModel(model)` → GET /listing/search/model
- ✅ `searchByColor(color)` → GET /listing/search/color
- ✅ `searchByVehicleType(type)` → GET /listing/search/vehicle-type
- ✅ `filterListingsByYear(start, end)` → GET /listing/filter/year
- ✅ `filterListingsByCity(city)` → GET /listing/filter/city
- ✅ `updateListingStatus(id, status)` → PUT /listing/status/{id}

### **SUBSCRIPTION APIs:**
- ✅ `getSubscriptionById(id)` → GET /subscription/{id}
- ✅ `getSubscriptionByName(name)` → GET /subscription/name
- ✅ `subscribeToPackage(subId)` → POST /subscription/SubPackage
- ✅ `cancelSubscription(subId)` → PUT /subscription/cancel

### **REVIEW APIs:**
- ✅ `getAllReviews()` → GET /review
- ✅ `getReviewById(reviewId)` → GET /review/{reviewId}
- ✅ `getReviewsByReviewer(userId)` → GET /review/reviewer/{userId}
- ✅ `getReviewsAboutUser(userId)` → GET /review/reviewed/{userId}
- ✅ `getUserAverageRating(userId)` → GET /review/{userId}/rate
- ✅ `getUserReviewSummary(userId)` → GET /review/summary/{userId}
- ✅ `updateReview(reviewId, data)` → PUT /review/update/{reviewId}
- ✅ `deleteReview(reviewId)` → DELETE /review/delete/{reviewId}

### **REPORT APIs:**
- ✅ `getAllReports()` → GET /report
- ✅ `getReportById(id)` → GET /report/id/{id}
- ✅ `getReportsByStatus(status)` → GET /report/status/{status}
- ✅ `updateReport(reportId, data)` → PUT /report/update/{reportId}
- ✅ `updateReportStatus(reportId, status)` → PUT /report/status/{reportId}
- ✅ `deleteReport(reportId)` → DELETE /report/{reportId}

### **PAYMENT APIs:**
- ✅ `getAllPayments()` → GET /payment
- ✅ `getPaymentById(id)` → GET /payment/{id}
- ✅ `getPaymentsByStatus(status)` → GET /payment/status
- ✅ `getPaymentByTransactionCode(code)` → GET /payment/transactioncode
- ✅ `getPaymentsByMethod(method)` → GET /payment/method
- ✅ `getTransactionHistory(userId)` → GET /payment/user/{userId}
- ✅ `createPayment(data)` → POST /payment/create
- ✅ `updatePayment(id, data)` → PUT /payment/update/{id}
- ✅ `updatePaymentStatus(id, status)` → PUT /payment/update/status/{id}
- ✅ `deletePayment(id)` → DELETE /payment/{id}

### **VNPAY APIs:**
- ✅ `createVNPayPayment(...)` → POST /vnpay/create-payment
- ✅ `handleVNPayReturn(params)` → GET /vnpay/return

### **CATEGORY APIs:**
- ✅ `getCategoryByName(name)` → GET /category/name
- ✅ `getCategoryById(id)` → GET /category/{id}
- ✅ `createCategory(data)` → POST /category/create
- ✅ `updateCategory(id, data)` → PUT /category/update/{id}
- ✅ `deleteCategory(id)` → DELETE /category/{id}

### **NOTIFICATION APIs:**
- ✅ `getNotificationsByUser(userId)` → GET /notifications/{userId}
- ✅ `createNotification(userId, message)` → POST /notifications
- ✅ `hideNotification(userId, notificationId)` → PUT /notifications/{userId}/{notificationId}/hide
- ✅ `hideAllNotifications(userId)` → PUT /notifications/{userId}/hide-all

### **FAVORITE APIs:**
- ✅ `getFavoritesByUser(userId)` → GET /favorite/user/{userId}
- ✅ `addFavorite(listingId)` → POST /favorite/create
- ✅ `removeFavorite(listingId)` → DELETE /favorite/remove

### **USER SUBSCRIPTION APIs:**
- ✅ `createUserSubscription(userId, subId)` → POST /UserSub/create
- ✅ `deleteUserSubscription(id)` → DELETE /UserSub/{id}
- ✅ `updateUserSubscription(id, data)` → PUT /UserSub/{id}
- ✅ `getRemainingDays(userId)` → GET /UserSub/remainday/{userId}

### **ADMIN APIs:**
- ✅ `getAdminDashboard()` → GET /admin/dashboard

---

## 📊 THỐNG KÊ

### Files Đã Sửa:
- ✅ `lib/auth.ts` - 1 lỗi critical
- ✅ `lib/api.ts` - 10+ lỗi + 70+ endpoints mới

### Tổng Số API Endpoints:
- **Trước:** ~20 endpoints
- **Sau:** ~100+ endpoints
- **Đã thêm:** 80+ endpoints mới
- **Đã sửa:** 10+ endpoints sai

### Breaking Changes:
1. ⚠️ `register()` - Đổi từ `/auth/register` → `/users/register`
2. ⚠️ `getAllUsers()` - Đổi từ `/users` → `/users/list`
3. ⚠️ `banUser()` - Đổi từ POST `/users/{id}/ban` → PUT `/users/ban/{id}`
4. ⚠️ `unbanUser()` - Đổi từ POST `/users/{id}/unban` → PUT `/users/active/{id}`
5. ⚠️ `filterListingsByPrice()` - Đổi params từ `min/max` → `minPrice/maxPrice`
6. ⚠️ `searchListings()` - Xóa, thay bằng `searchByBrand()`, `searchByModel()`, etc.
7. ⚠️ All review endpoints - Đổi từ `/reviews` → `/review`
8. ⚠️ All report endpoints - Đổi từ `/reports` → `/report`
9. ⚠️ All payment endpoints - Đổi từ `/payments` → `/payment`
10. ⚠️ All subscription endpoints - Đổi từ `/subscriptions` → `/subscription`

---

## ✅ KẾT QUẢ

- 🎯 **100% backend controllers đã được audit**
- 🔧 **Tất cả API endpoints đã được sửa cho khớp với backend**
- 📝 **Không có thay đổi nào ở backend code**
- ✨ **Frontend (swp391_fe_ver2) đã được cập nhật hoàn toàn**
- 🚀 **Sẵn sàng để test với backend**

---

**Ngày cập nhật:** 22/10/2025
**Frontend Version:** swp391_fe_ver2
**Backend Base URL:** http://localhost:8080/api
