# Testing Guide: Artisan Craft Visibility Feature

## 🧪 Quick Testing Steps

### Prerequisites
1. Backend server running on `http://localhost:5000`
2. Frontend running on `http://localhost:5173` (or your Vite port)
3. Database properly configured
4. At least 3 user accounts:
   - 1 Admin account
   - 1 Artisan account
   - 1 Buyer account

---

## Test Scenario 1: Artisan Uploads Craft

### Steps:
1. **Login as Artisan**
   - Navigate to `/login`
   - Login with artisan credentials
   - Should redirect to Artisan Dashboard

2. **Upload New Craft**
   - Click "Upload Craft" or navigate to `/upload-craft`
   - Fill in the form:
     ```
     Title: Handwoven Basket
     Category: Basketry
     Price: 1500
     Location: Jaipur, Rajasthan
     Description: Beautiful handwoven basket made from natural materials
     Story: This basket represents 3 generations of weaving tradition...
     Image: Upload any image
     ```
   - Click "Upload Craft"

3. **Verify Success**
   - ✅ Success message appears: "Craft uploaded successfully! It will be visible after admin approval."
   - ✅ Redirected to dashboard
   - ✅ Craft appears in "My Crafts" section with status "pending"

### Expected Database State:
```sql
SELECT id, name, status, user_id FROM crafts WHERE name = 'Handwoven Basket';
-- Should return: status = 'pending'
```

---

## Test Scenario 2: Admin Approves Craft

### Steps:
1. **Login as Admin**
   - Logout from artisan account
   - Login with admin credentials

2. **Review Pending Crafts**
   - Navigate to Admin Dashboard
   - Look for "Pending Crafts" section
   - Find the newly uploaded craft

3. **Approve Craft**
   - Click "Approve" on the craft
   - Verify status changes to "approved"

### Expected API Call:
```
PATCH /api/crafts/:id/status
Body: { "status": "approved" }
```

### Expected Database State:
```sql
SELECT status FROM crafts WHERE name = 'Handwoven Basket';
-- Should return: status = 'approved'
```

---

## Test Scenario 3: Buyers See Approved Craft

### Steps:
1. **Test as Guest (Not Logged In)**
   - Navigate to Home page (`/`)
   - Scroll to "New Arrivals from Our Artisans" section
   - ✅ Verify craft is visible
   - ✅ Verify craft image displays
   - ✅ Verify price and location show correctly

2. **Login as Buyer**
   - Login with buyer credentials
   - Should redirect to Buyer Dashboard

3. **Check Buyer Dashboard**
   - Look for "Browse Available Crafts" section
   - ✅ Verify craft appears in the grid
   - ✅ Verify "Add to Cart" button is visible
   - ✅ Verify wishlist heart icon is visible

4. **Check Home Page**
   - Navigate to Home page
   - ✅ Verify craft appears in featured section
   - ✅ Click "View All Crafts" button
   - Should navigate to `/explore`

5. **Check Explore Page**
   - ✅ Verify craft appears in the list
   - ✅ Test filtering by category (Basketry)
   - ✅ Test filtering by location (Jaipur)
   - ✅ Verify "Verified Artisan" badge shows

---

## Test Scenario 4: Buyer Interactions

### Steps:
1. **Add to Cart (from Buyer Dashboard)**
   - Click "Add to Cart" on any craft
   - ✅ Success alert: "Added to cart!"
   - ✅ Cart count increases in header
   - ✅ Dashboard stats update

2. **Add to Wishlist (from Home Page)**
   - Navigate to Home page
   - Click heart icon on craft card
   - ✅ Success alert: "Added to wishlist!"
   - ✅ Heart icon fills/changes color
   - ✅ Wishlist count increases

3. **View Craft Details**
   - Click "Details" button on any craft
   - ✅ Navigate to craft detail page
   - ✅ All information displays correctly

---

## Test Scenario 5: Multiple Crafts Display

### Steps:
1. **Upload Multiple Crafts (as Artisan)**
   - Upload 10 different crafts with varied:
     - Categories (Pottery, Woodwork, Textiles, etc.)
     - Prices (₹500 to ₹5000)
     - Locations (different Indian cities)

2. **Approve All (as Admin)**
   - Approve all 10 crafts

3. **Verify Display Limits**
   - Home Page: ✅ Shows max 6 crafts
   - Buyer Dashboard: ✅ Shows max 8 crafts
   - Explore Page: ✅ Shows all approved crafts

4. **Test "View All" Buttons**
   - Home Page → "View All Crafts" → ✅ Navigate to Explore
   - Buyer Dashboard → "View All" → ✅ Navigate to Explore

---

## Test Scenario 6: Error Handling

### Test 1: Upload Without Login
- Logout
- Try to access `/upload-craft` directly
- ✅ Should redirect to login page

### Test 2: Invalid Data
- Login as artisan
- Try uploading craft without required fields
- ✅ Form validation prevents submission
- ✅ Error messages display

### Test 3: Network Failure
- Disconnect network
- Try to upload craft
- ✅ Error message: "Failed to upload craft. Please try again."

### Test 4: Buyer Can't Access Artisan Features
- Login as buyer
- Try to access `/upload-craft`
- ✅ Should show error or redirect

---

## Test Scenario 7: Bilingual Support

### Steps:
1. **Switch to Telugu**
   - Click language toggle in header
   - Select "తెలుగు" (Telugu)

2. **Verify Translations**
   - Home Page:
     - ✅ "New Arrivals from Our Artisans" → "మా కళాకారుల నుండి కొత్త రాకలు"
     - ✅ "View All Crafts" → "అన్ని హస్తకళలను చూడండి"
   
   - Buyer Dashboard:
     - ✅ "Browse Available Crafts" → "అందుబాటులో ఉన్న హస్తకళలను బ్రౌజ్ చేయండి"
     - ✅ "View All" → "అన్నీ చూడండి"
   
   - Upload Craft:
     - ✅ "Upload Craft" → "హస్తకళను అప్‌లోడ్ చేయండి"
     - ✅ Success message in Telugu

---

## Browser Console Checks

### During Craft Upload:
```javascript
// Should see in console:
POST http://localhost:5000/api/crafts 201 (Created)

// Response should include:
{
  success: true,
  message: "Craft created successfully",
  data: { craft: {...} }
}
```

### During Page Load (Home/Dashboard):
```javascript
// Should see:
GET http://localhost:5000/api/crafts 200 (OK)

// Response should include:
{
  success: true,
  count: 10,
  data: { crafts: [...] }
}
```

---

## Database Verification Queries

### Check Crafts:
```sql
SELECT 
  c.id,
  c.name,
  c.status,
  c.price,
  c.is_new_arrival,
  u.name as artisan_name,
  u.role
FROM crafts c
JOIN users u ON c.user_id = u.id
ORDER BY c.created_at DESC;
```

### Check Only Approved:
```sql
SELECT * FROM crafts WHERE status = 'approved';
```

### Check Craft Count by Status:
```sql
SELECT status, COUNT(*) FROM crafts GROUP BY status;
```

---

## Performance Testing

### Test 1: Load Time
- Measure Home page load time with 50+ crafts
- ✅ Should load in < 2 seconds

### Test 2: Image Loading
- Check if images load progressively
- ✅ No blocking behavior

### Test 3: Responsive Design
- Test on mobile (375px width)
- ✅ Cards stack vertically
- ✅ Text remains readable

---

## Accessibility Testing

1. **Keyboard Navigation**
   - ✅ Can tab through all craft cards
   - ✅ Can activate buttons with Enter/Space

2. **Screen Reader**
   - ✅ Images have alt text
   - ✅ Buttons have descriptive labels

3. **Color Contrast**
   - ✅ Text is readable on all backgrounds

---

## Known Issues to Watch For

### Issue 1: Base64 Image Size
- **Symptom**: Large images fail to upload
- **Solution**: Compress images before upload or implement proper file upload

### Issue 2: Stale Data
- **Symptom**: New crafts don't appear without page refresh
- **Solution**: User needs to refresh page (future: implement real-time updates)

### Issue 3: CORS Errors
- **Symptom**: "CORS policy blocked" in console
- **Solution**: Verify backend CORS configuration allows frontend origin

---

## Success Criteria Checklist

- [ ] Artisan can upload craft
- [ ] Craft saves with "pending" status
- [ ] Admin can approve craft
- [ ] Approved craft appears on Home page (max 6)
- [ ] Approved craft appears on Buyer Dashboard (max 8)
- [ ] Approved craft appears on Explore page (all)
- [ ] Buyers can add craft to cart
- [ ] Buyers can add craft to wishlist
- [ ] Guest users can view crafts
- [ ] Bilingual support works
- [ ] No console errors
- [ ] Responsive design works
- [ ] All buttons functional
- [ ] Loading states show
- [ ] Error handling works

---

## Quick Test Script

```bash
# 1. Start backend
cd backend
npm start

# 2. Start frontend (new terminal)
cd frontend
npm run dev

# 3. Run quick test:
# - Login as artisan → Upload craft
# - Login as admin → Approve craft
# - Login as buyer → View on dashboard
# - Visit home page → See in featured section
```

---

## Reporting Issues

If you find bugs, note:
1. User role (artisan/buyer/admin/guest)
2. Page where error occurred
3. Browser console errors
4. Network tab response
5. Steps to reproduce

---

**Happy Testing! 🚀**
