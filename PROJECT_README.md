# EV & Battery Marketplace - Frontend Application

## 🚀 Project Overview
Complete Next.js 15 frontend for Second-hand EV & Battery Listing Platform.

## ✅ Completed Features (100%)

### 🔐 Authentication & Authorization
- [x] Login/Register pages with form validation
- [x] JWT token management (localStorage)
- [x] Route protection middleware
- [x] Role-based access control (GUEST/USER/ADMIN)
- [x] Auto-redirect logic (logged-in users away from /login)

### 👤 User Features
- [x] **Dashboard** - Personal stats, quick actions, recent posts
- [x] **Create Post** - Multi-category form with image upload (max 5)
- [x] **My Posts** - Manage personal listings with status filters
- [x] **Post Detail** - Full listing view with conditional contact info
- [x] **Search** - Advanced filters (keyword, category, price range)
- [x] **Subscription** - Plan comparison with VNPay/MoMo payment
- [x] **Payment History** - Transaction list with status tracking
- [x] **Review System** - Rate and comment on listings
- [x] **Report System** - Report inappropriate listings

### 👨‍💼 Admin Features
- [x] **Admin Dashboard** - System statistics overview
- [x] **User Management** - Ban/unban users, view roles
- [x] **Listing Approval** - Approve/reject pending posts
- [x] **Report Management** - Handle user reports

### 🎨 UI/UX Components
- [x] Responsive Header with user menu
- [x] Footer with links
- [x] Global styles with Tailwind utilities
- [x] Badge system (success, warning, danger)
- [x] Button variants (primary, secondary, danger)
- [x] Card layouts
- [x] Loading spinners
- [x] Modal dialogs

## 📁 Project Structure

```
swp391_fe_ver2/
├── app/
│   ├── layout.tsx                  # Root layout with Header/Footer
│   ├── page.tsx                    # Homepage with listings grid
│   ├── login/page.tsx              # Combined login/register
│   ├── register/page.tsx           # Register wrapper
│   ├── search/page.tsx             # Advanced search
│   ├── dashboard/page.tsx          # User dashboard
│   ├── create-post/page.tsx        # Create listing form
│   ├── my-posts/page.tsx           # Manage user's posts
│   ├── subscription/page.tsx       # Subscription plans + payment
│   ├── payment-history/page.tsx    # Transaction history
│   ├── posts/[id]/page.tsx         # Post detail page
│   └── admin/
│       ├── page.tsx                # Admin dashboard
│       ├── users/page.tsx          # User management
│       ├── listings/page.tsx       # Listing approval
│       └── reports/page.tsx        # Report management
├── components/
│   ├── Header.tsx                  # Global navigation
│   └── Footer.tsx                  # Site footer
├── lib/
│   ├── types.ts                    # TypeScript interfaces
│   ├── auth.ts                     # JWT auth functions
│   └── api.ts                      # Backend API calls
├── middleware.ts                   # Route protection
└── styles/
    └── globals.css                 # Tailwind + custom utilities
```

## 🔌 API Integration

### Endpoints Implemented
- **Auth**: `/auth/login`, `/auth/register`
- **Listings**: `/listing/active`, `/listing/{id}`, `/listing/create`, `/listing/update/{id}`, `/listing/delete/{id}`, `/listing/my-listings`, `/listing/search`
- **Subscriptions**: `/subscriptions`, `/subscriptions/my-subscription`
- **Payments**: `/payments/create`, `/payments/history`
- **Reviews**: `/reviews/listing/{id}`, `/reviews/create`
- **Reports**: `/reports/create`
- **Admin**: `/admin/users`, `/admin/listings/pending`, `/admin/listings/approve/{id}`, `/admin/listings/reject/{id}`, `/admin/reports`, `/admin/reports/resolve/{id}`

### API Base URL
```typescript
const API_URL = 'http://localhost:8080/api';
```

## 🛠️ Tech Stack
- **Framework**: Next.js 15.0.0 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.0
- **Image Optimization**: Next.js Image component
- **State Management**: React hooks (useState, useEffect)
- **Routing**: Next.js navigation (useRouter, usePathname)
- **Authentication**: JWT tokens in localStorage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running at `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment
The app will run on `http://localhost:3000`

## 🔑 Key Features Details

### 1. **Multi-Category Support**
- **Xe điện** (Electric Cars) - seats, mileage, batteryCapacity
- **Xe máy điện** (Electric Motorcycles) - seats, mileage, batteryCapacity
- **Pin xe điện** (EV Batteries) - voltage, cycleCount, warrantyInfo

### 2. **Subscription System**
- **Free**: 1 post limit
- **Basic**: Unlimited posts, basic support
- **Premium**: Unlimited posts, priority support (Popular)
- **VIP**: Unlimited posts, VIP support

### 3. **Payment Integration**
- VNPay gateway
- MoMo wallet
- Payment status tracking (PENDING → COMPLETED/FAILED)
- Return URL handling for UX

### 4. **Contact Visibility**
- **Logged-out users**: Contact info hidden (***@***.com, ***-***-****)
- **Logged-in users**: Full contact displayed

### 5. **Admin Workflow**
- **Listing Approval**: PENDING → ACTIVE/REJECTED
- **User Management**: ACTIVE ↔ BANNED
- **Report Handling**: PENDING → RESOLVED

## 📝 Type System

### Core Interfaces
```typescript
interface User {
  userID: string;
  userName: string;
  userEmail: string;
  role: 'GUEST' | 'USER' | 'ADMIN' | 'MODERATOR';
  userStatus: 'ACTIVE' | 'BANNED';
}

interface Listing {
  listingId: string;
  title: string;
  description: string;
  price: number;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
  imageUrls: string[];
  categoryName: string;
  sellerName: string;
  contact: string;
}

interface Subscription {
  subId: number;
  subName: 'Free' | 'Basic' | 'Premium' | 'VIP';
  subPrice: number;
  duration: number;
  postLimit: number;
}
```

## 🎯 User Journeys

### Guest User
1. Visit homepage → See listings (no contact info)
2. Click "Search" → Filter by keyword/category/price
3. View post detail → Prompted to login to see contact
4. Click "Register" → Create account
5. Redirected to dashboard

### Regular User
1. Login → Dashboard
2. "Create Post" → Fill form → Upload images → Submit
3. Post status: PENDING (awaiting admin approval)
4. Browse subscriptions → Choose plan → Pay via VNPay/MoMo
5. View payment history
6. Manage own posts (view, delete)
7. Leave reviews on other listings
8. Report inappropriate content

### Admin
1. Login → Admin Dashboard
2. View stats: Total users, pending listings, pending reports
3. **User Management**: Ban/unban users
4. **Listing Approval**: Approve or reject with reason
5. **Report Management**: Mark reports as resolved

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563EB)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Gray Scale**: 50-900

### Components
- **btn-primary**: Blue background, white text
- **btn-secondary**: Gray background
- **btn-danger**: Red background
- **badge-success/warning/danger**: Status indicators
- **input-field**: Consistent form styling
- **card**: White background with shadow

## 🔒 Security Features
- JWT token validation on protected routes
- Role-based access control
- Admin-only routes (/admin/*)
- Seller verification (JWT email → backend user)
- XSS protection via Next.js built-in escaping

## 📊 Current Status
**Progress: 100% Complete** ✅

All planned features implemented:
- ✅ 10 user-facing pages
- ✅ 4 admin pages
- ✅ Full API integration
- ✅ Authentication & authorization
- ✅ Payment system
- ✅ Review & report features
- ✅ Responsive design
- ✅ Type-safe TypeScript

## 🐛 Known Issues
None currently. All TypeScript compilation errors resolved.

## 🚀 Next Steps (Optional Enhancements)
- [ ] Image drag-and-drop upload
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] Export reports to PDF/Excel
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Progressive Web App (PWA)
- [ ] Email notifications
- [ ] Chat between buyer-seller
- [ ] Saved searches/favorites

## 📞 Support
For backend API documentation, refer to `PROJECT_FLOWS.md` in the backend repository.

## 📄 License
Private project for educational purposes.

---

**Built with ❤️ using Next.js 15 + TypeScript + Tailwind CSS**
