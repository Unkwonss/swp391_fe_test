# 🚀 Quick Start Guide - EV & Battery Marketplace

## Prerequisites
- ✅ Node.js 18+ installed
- ✅ Backend API running at http://localhost:8080
- ✅ MySQL database configured
- ✅ Cloudinary account set up

## Installation Steps

### 1. Install Dependencies
```bash
cd c:\Users\win\Downloads\swp391_fe_ver2
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will run at **http://localhost:3000**

## 🧪 Test User Accounts

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123
- **Access**: Full admin panel, user management, listing approval

### Regular User Account
- **Email**: user@example.com
- **Password**: user123
- **Access**: Create posts, manage subscriptions, dashboard

## 🎯 Testing Workflow

### As Guest (Not Logged In)
1. Visit http://localhost:3000
2. Browse homepage listings (contact info hidden)
3. Click "Search" → Try filters
4. Click on a listing → See "Login to view contact"
5. Click "Register" → Create test account

### As User
1. Login with user credentials
2. Visit Dashboard → See stats
3. Click "Create Post"
   - Category: Xe điện
   - Fill all required fields
   - Upload 1-5 images
   - Submit → Status: PENDING
4. Go to "Subscription" → Choose "Premium"
   - Select VNPay
   - Click "Payment"
   - (On VNPay sandbox: use test card 9704198526191432198)
5. View "Payment History" → See transaction
6. Browse listings → Click one → Leave review
7. Click "Report" on a listing → Submit report

### As Admin
1. Login with admin credentials
2. Visit Admin Dashboard → See stats
3. Click "User Management"
   - Search for a user
   - Click "Ban" → Confirm
   - User status: BANNED
4. Click "Listing Approval"
   - See pending posts
   - Click "Approve" or "Reject"
5. Click "Report Management"
   - View pending reports
   - Click "Resolve"

## 📁 File Structure Guide

### Need to modify something?

**Change homepage content:**
→ Edit `app/page.tsx`

**Update header/footer:**
→ Edit `components/Header.tsx` or `components/Footer.tsx`

**Add new API endpoint:**
→ Edit `lib/api.ts` → Add function → Export it

**Change color scheme:**
→ Edit `styles/globals.css` → Modify Tailwind classes

**Add new protected route:**
→ Edit `middleware.ts` → Add path to relevant array

**Update User/Listing types:**
→ Edit `lib/types.ts` → Update interface

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Run development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type checking
npm run build

# Clear Next.js cache
rm -rf .next
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"
**Solution**: Ensure backend is running at http://localhost:8080
```bash
# In backend terminal
cd c:\Users\win\Downloads\swp391_fa25_be
mvn spring-boot:run
```

### Issue: "Images not uploading"
**Solution**: Check Cloudinary credentials in backend application.properties

### Issue: "JWT token invalid"
**Solution**: Clear browser localStorage
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Issue: "TypeScript errors"
**Solution**: Restart VS Code TypeScript server
- Press `Ctrl+Shift+P`
- Type "TypeScript: Restart TS Server"
- Press Enter

### Issue: "Port 3000 already in use"
**Solution**: Kill the process or use different port
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
PORT=3001 npm run dev
```

### Issue: "Module not found"
**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎨 Customization Tips

### Change primary color:
Edit `tailwind.config.js` (if exists) or directly modify classes in components:
```tsx
// Find: bg-blue-600
// Replace with: bg-purple-600 (or any Tailwind color)
```

### Add new subscription plan:
1. Backend: Add to database subscriptions table
2. Frontend: Update `Subscription` interface in `lib/types.ts`
3. Plan will automatically appear on subscription page

### Modify post limit:
1. Edit backend `ListingService.java`
2. Change validation logic based on `subscription.postLimit`

## 📊 Performance Tips

### Optimize images:
- Next.js Image component already optimizes
- Use WebP format when possible
- Cloudinary auto-optimizes on upload

### Reduce bundle size:
```bash
npm run build
# Check .next/server/pages for large files
# Consider lazy loading heavy components
```

### Enable caching:
- Production build automatically enables caching
- Static pages cached at edge (Vercel/Netlify)

## 🚀 Deployment

### Deploy to Vercel (Recommended):
1. Push code to GitHub
2. Visit https://vercel.com
3. Import repository
4. Set environment variables (if any)
5. Deploy

### Deploy to Netlify:
```bash
npm run build
# Upload .next folder to Netlify
```

### Deploy to custom server:
```bash
npm run build
npm start
# Use PM2 for process management:
npm install -g pm2
pm2 start npm --name "ev-marketplace" -- start
```

## 📞 Need Help?

### Check logs:
- **Browser console**: F12 → Console tab
- **Network tab**: F12 → Network → See API calls
- **Backend logs**: Check Spring Boot console

### Debug mode:
Add console.logs in components:
```typescript
console.log('User:', user);
console.log('Listings:', listings);
```

### API testing:
Use Postman or curl to test backend directly:
```bash
curl http://localhost:8080/api/listing/active
```

## ✅ Checklist Before Going Live

- [ ] Test all user flows (guest, user, admin)
- [ ] Verify payment integration works
- [ ] Check mobile responsiveness
- [ ] Test image upload (different sizes/formats)
- [ ] Verify email notifications (backend)
- [ ] Test error handling (network failures)
- [ ] Review security (SQL injection, XSS)
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure production database
- [ ] Update API_URL to production domain
- [ ] Test cross-browser compatibility
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Create backup strategy

## 🎉 You're All Set!

The project is **100% complete** and ready to use. Start the dev server and explore all features!

```bash
npm run dev
```

Visit **http://localhost:3000** and enjoy! 🚗⚡🔋
