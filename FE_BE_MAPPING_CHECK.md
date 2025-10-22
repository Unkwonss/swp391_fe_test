# ✅ Kiểm tra Logic FE → BE - Tổng hợp

## 🔍 Đã kiểm tra toàn bộ flow

### 1. ✅ REGISTER (Đã sửa)

**Frontend gửi:**
```typescript
{
  userName: string,
  userEmail: string,
  password: string,  // ← FE dùng tên này
  phone: string
}
```

**Backend expect:**
```java
RegisterRequest {
  userName: String,
  userEmail: String,
  userPassword: String,  // ← BE expect tên này
  phone: String,
  dob: Date (optional),
  subId: Long (optional)
}
```

**❌ VẤN ĐỀ:** Field name không khớp: `password` vs `userPassword`

**✅ ĐÃ SỬA:** Trong `lib/auth.ts`
```typescript
const requestBody = {
  userName: userData.userName,
  userEmail: userData.userEmail,
  userPassword: userData.password,  // ← Map password → userPassword
  phone: userData.phone,
};
```

**Backend response:**
```java
RegisterResponse {
  userId: String,
  userName: String,
  userEmail: String,
  phone: String,
  roleName: String,
  status: UserStatus
}
```

---

### 2. ✅ LOGIN (Đúng rồi)

**Frontend gửi:**
```typescript
{
  email: string,
  password: string
}
```

**Backend expect:**
```java
LoginRequest {
  email: String,
  password: String
}
```

**✅ KHỚP!** Field names đúng.

**Backend response:**
```java
LoginResponse {
  userId: String,
  userName: String,
  userEmail: String,
  phone: String,
  userStatus: String,
  dob: Date,
  role: Role,
  token: String
}
```

**Frontend transform:**
```typescript
const user: User = {
  userID: data.userId,
  userName: data.userName,
  userEmail: data.userEmail,
  phone: data.phone,
  role: data.role?.roleName || data.role,
  userStatus: data.userStatus,
};
```

✅ Đúng!

---

### 3. ✅ CREATE LISTING (Đúng rồi)

**Frontend gửi:**
```typescript
// FormData multipart/form-data
{
  listing: JSON.stringify({
    ...listingData,
    category: { categoryId: listingData.categoryId }  // ← Transform
  }),
  files: File[]
}
```

**Backend expect:**
```java
@PostMapping(value = "/create", consumes = "multipart/form-data")
create(
  @RequestPart("listing") String listingJson,  // ← JSON string
  @RequestPart("files") MultipartFile[] files
)
```

**Backend parse:**
```java
Listing listing = mapper.readValue(listingJson, Listing.class);
// Listing có field: Category category (với categoryId)
```

✅ **ĐÚNG!** FE transform `categoryId` → `category: { categoryId }` để match BE.

**Security:**
```java
// Backend không tin FE về seller
String email = jwtUtils.getUsernameFromToken(token);
User seller = userRepo.findByUserEmail(email);
listing.setSeller(seller);  // ← Override FE data
```

✅ Tốt! Security đúng.

---

### 4. ✅ VNPAY PAYMENT (Đúng rồi)

**Frontend gửi:**
```typescript
{
  amount: number,
  orderInfo: string,
  subscriptionId: number,
  userId: string
}
```

**Backend expect:**
```java
VNPayPaymentRequest {
  Long amount,
  String orderInfo,
  Long subscriptionId,
  String userId
}
```

**✅ KHỚP!** Tất cả field names đúng.

**Type mismatch nhỏ:**
- FE: `subscriptionId: number` (TypeScript)
- BE: `subscriptionId: Long` (Java)

→ **OK!** JSON sẽ auto-convert number → Long.

**Backend flow:**
1. Validate user & subscription tồn tại
2. Check PENDING payment (block nếu <15min)
3. Auto-cancel expired PENDING (>15min)
4. Tạo User_Subscription PENDING_PAYMENT
5. Tạo Payment record
6. Generate VNPay URL
7. Return URL cho FE redirect

✅ Logic đúng!

---

### 5. ✅ RETRY PAYMENT (Đúng rồi)

**Frontend gửi:**
```typescript
{
  userSubId: number,
  userId: string
}
```

**Backend expect:**
```java
@PostMapping("/retry-payment")
retryPayment(@RequestBody Map<String, Object> request) {
  Long userSubId = ((Number) request.get("userSubId")).longValue();
  String userId = (String) request.get("userId");
}
```

✅ **ĐÚNG!** Backend dùng Map nên flexible với field names.

**Backend validation:**
```java
// Eager loading để tránh LazyInitializationException
User_Subscription userSub = userSubRepo.findByIdWithUser(userSubId);

// Check ownership
if (!userSub.getUser().getUserID().equals(userId)) {
  throw new RuntimeException("This subscription does not belong to you");
}
```

✅ Security + lazy loading fix đúng!

---

### 6. ✅ CANCEL PAYMENT (Đúng rồi)

**Frontend gửi:**
```typescript
PUT /payment/cancel/{paymentId}
```

**Backend expect:**
```java
@PutMapping("/cancel/{paymentId}")
cancelPayment(@PathVariable Long paymentId) {
  Payment payment = paymentRepo.findById(paymentId);
  payment.setStatus(PaymentStatus.CANCELLED);
  // ...
}
```

✅ **ĐÚNG!** Path variable đúng.

---

### 7. ✅ GET PENDING LISTINGS (Admin) (Đúng rồi)

**Frontend gửi:**
```typescript
GET /listing/pending?page=0&size=20
```

**Backend expect:**
```java
@GetMapping("/pending")
getAllPendingListings(
  @RequestParam(defaultValue = "0") int page,
  @RequestParam(defaultValue = "20") int size
)
```

✅ **ĐÚNG!** Query params khớp.

**Security:**
```java
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
```

✅ Đã thêm security!

---

### 8. ✅ APPROVE/REJECT LISTING (Admin) (Đúng rồi)

**Frontend gửi:**
```typescript
POST /listing/approve/{id}
POST /listing/reject/{id}
```

**Backend expect:**
```java
@PostMapping("/approve/{id}")
approveListing(@PathVariable String id)

@PostMapping("/reject/{id}")
rejectListing(@PathVariable String id)
```

✅ **ĐÚNG!** Path variables khớp.

**Security:**
```java
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
```

✅ Đã thêm security!

---

## 📊 Tổng kết

| API Endpoint | FE → BE | Status | Notes |
|--------------|---------|--------|-------|
| POST /users/register | `password` → `userPassword` | ✅ ĐÃ SỬA | Map trong auth.ts |
| POST /users/login | `email`, `password` | ✅ ĐÚNG | Field names khớp |
| POST /listing/create | `category: {categoryId}` | ✅ ĐÚNG | Transform đúng |
| POST /vnpay/create-payment | All fields match | ✅ ĐÚNG | Types auto-convert |
| POST /vnpay/retry-payment | `userSubId`, `userId` | ✅ ĐÚNG | Map flexible |
| PUT /payment/cancel/{id} | Path variable | ✅ ĐÚNG | - |
| GET /listing/pending | Query params | ✅ ĐÚNG | Security added |
| POST /listing/approve/{id} | Path variable | ✅ ĐÚNG | Security added |
| POST /listing/reject/{id} | Path variable | ✅ ĐÚNG | Security added |

---

## 🔒 Security Checks

### ✅ JWT Authentication
- FE gửi: `Authorization: Bearer ${token}`
- BE validate: `jwtUtils.checkValidToken(token)`
- All protected endpoints check token

### ✅ Authorization (Admin)
```java
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
```
- ✅ `/listing/pending`
- ✅ `/listing/approve/{id}`
- ✅ `/listing/reject/{id}`

### ✅ Data Override (Security)
```java
// Backend không tin FE về seller
listing.setSeller(seller);  // From JWT token, not FE
```

### ✅ Ownership Check
```java
if (!userSub.getUser().getUserID().equals(userId)) {
  throw new RuntimeException("Not your subscription");
}
```

---

## 🐛 Vấn đề đã sửa

### 1. Register - Field name mismatch ✅
**Before:**
```typescript
body: JSON.stringify(userData)  // { password: "..." }
```

**After:**
```typescript
body: JSON.stringify({
  userName: userData.userName,
  userEmail: userData.userEmail,
  userPassword: userData.password,  // ← Map đúng
  phone: userData.phone
})
```

### 2. Admin endpoints - Missing security ✅
**Before:**
```java
@GetMapping("/pending")  // No security!
```

**After:**
```java
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('MODERATOR')")
@GetMapping("/pending")
```

---

## ✅ Kết luận

**Tất cả logic FE → BE đã ĐÚNG sau khi sửa:**

1. ✅ Register: Map `password` → `userPassword`
2. ✅ Login: Field names khớp
3. ✅ Create listing: Transform category đúng
4. ✅ VNPay payment: All fields khớp
5. ✅ Retry payment: Map flexible
6. ✅ Cancel payment: Path variable đúng
7. ✅ Admin endpoints: Security added
8. ✅ Security: JWT + Authorization + Ownership checks

**Files đã sửa:**
- ✅ `lib/auth.ts` - Map password → userPassword
- ✅ `ListController.java` - Add @PreAuthorize

**Không cần sửa Backend khác!**
