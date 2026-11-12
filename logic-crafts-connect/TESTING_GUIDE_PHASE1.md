# 🧪 PHASE 1 TESTING GUIDE

## Quick Testing Instructions for Artisan Features

---

## ✅ Prerequisites

1. **Backend Running**: `http://localhost:5000` ✓
2. **Frontend Running**: `http://localhost:5173` (or your Vite port)
3. **Database**: PostgreSQL with enhanced crafts table ✓
4. **User Account**: Artisan role account

---

## 🧑‍🎨 Test Scenario 1: Upload New Craft with Enhanced Features

### Steps:

1. **Login as Artisan**
   - Go to `http://localhost:5173/login`
   - Use artisan credentials
   - You should be redirected to `/artisan-dashboard`

2. **Navigate to Enhanced Upload Form**
   - Click "Upload New Craft" button
   - OR click "📦 Manage My Crafts" → then "+ Add New Craft"
   - OR directly visit `/upload-craft-enhanced`

3. **Fill Out the Form**
   - **Craft Name**: "Handmade Terracotta Vase"
   - **Category**: Select "Pottery"
   - **Craft Type**: "Decorative Pottery"
   - **Description**: "Beautiful handmade terracotta vase with traditional patterns"
   - **Price**: 750
   - **Stock**: 5
   - **Delivery Days**: 10
   - **Location**: (pre-filled with your location)
   - **Contact**: (pre-filled with your phone)

4. **Upload Multiple Images**
   - Click "Choose Files"
   - Select 3-5 images
   - Verify previews appear in grid
   - First image should show "Main" badge
   - Click "×" on one image to test removal

5. **Set Product Flags**
   - Check "Mark as New Arrival" ✓
   - Check "Made to Order" ✓
   - Leave "Featured" and "Limited Edition" unchecked

6. **Submit**
   - Click "Upload Craft"
   - Wait for success message
   - Should redirect to `/artisan/crafts`

### Expected Results:
✅ Form validates all required fields  
✅ Images preview correctly  
✅ Alert: "Craft uploaded successfully!"  
✅ Redirects to craft management page  
✅ New craft appears in the list with "Pending" status

---

## 📊 Test Scenario 2: View Artisan Statistics Dashboard

### Steps:

1. **Navigate to Crafts Management**
   - From dashboard, click "📦 Manage My Crafts"
   - OR visit `/artisan/crafts`

2. **Verify Statistics Overview**
   - Should see 6 stat cards:
     - 📦 Total Crafts
     - 👁️ Total Views
     - ❤️ Total Saves
     - 🛒 Total Orders
     - ⭐ Featured
     - ✅ Approved

3. **Check Numbers**
   - Total Crafts should match your uploaded count
   - Views, Saves, Orders start at 0 for new crafts
   - Pending count should include newly uploaded craft

### Expected Results:
✅ All stat cards display with correct icons  
✅ Numbers are accurate  
✅ Cards have hover animation  
✅ Responsive grid layout

---

## 🔍 Test Scenario 3: Filter Crafts

### Steps:

1. **On Crafts Management Page** (`/artisan/crafts`)

2. **Test Each Filter**
   - Click "All Crafts" → Shows all your crafts
   - Click "Approved" → Shows only approved crafts
   - Click "Pending" → Shows only pending crafts
   - Click "Featured" → Shows crafts marked as featured
   - Click "New Arrivals" → Shows crafts marked as new

3. **Verify Active State**
   - Active tab should have brown background
   - Other tabs should be gray

### Expected Results:
✅ Filter buttons work correctly  
✅ Craft list updates when filter changes  
✅ Active filter is highlighted  
✅ "No crafts found" message if filter returns empty

---

## 🗑️ Test Scenario 4: Delete Craft

### Steps:

1. **On Crafts Management Page**
   - Find a test craft
   - Click the 🗑️ (trash) button

2. **Confirmation Dialog**
   - Should show: "Are you sure you want to delete this craft?"
   - Click "Cancel" first (nothing should happen)
   - Click trash again, then "OK"

3. **Verify Deletion**
   - Should see alert: "Craft deleted successfully"
   - Craft should disappear from list
   - Statistics should update (total crafts -1)

### Expected Results:
✅ Confirmation dialog appears  
✅ Craft is removed from list  
✅ Stats update automatically  
✅ Backend API call succeeds

---

## 🎨 Test Scenario 5: Craft Card Display

### Steps:

1. **Review Craft Cards on Management Page**

2. **Verify Each Card Shows:**
   - ✅ Craft image (200x200px on desktop)
   - ✅ Status badge (Approved/Pending/Rejected)
   - ✅ Craft name as heading
   - ✅ Description (2 lines max with ellipsis)
   - ✅ Meta info: Price, Stock, Delivery days
   - ✅ Performance stats: Views, Saves, Orders
   - ✅ Tags: "Made to Order", "Limited Edition" (if applicable)
   - ✅ Edit button (✏️)
   - ✅ Delete button (🗑️)

3. **Check Badges**
   - Featured crafts should have "⭐ Featured" badge on image
   - New arrivals should have "🆕 New" badge on image

4. **Hover Effects**
   - Card should lift slightly on hover
   - Shadow should deepen

### Expected Results:
✅ All information displays correctly  
✅ Images load properly  
✅ Badges appear when applicable  
✅ Hover animations work smoothly

---

## 📱 Test Scenario 6: Responsive Design

### Steps:

1. **Desktop View** (> 992px)
   - Stats grid: 6 columns
   - Craft card: Image (200px) | Details | Actions (horizontal)
   - Filter tabs: Single row

2. **Tablet View** (768px - 992px)
   - Stats grid: 4 columns
   - Craft card: Image (150px) | Details | Actions (horizontal)
   - Filter tabs: Wrap to multiple rows

3. **Mobile View** (< 768px)
   - Stats grid: 2 columns
   - Craft card: Vertical stack (image full width, then details, then actions)
   - Filter tabs: Horizontal scroll

### How to Test:
- Open DevTools (F12)
- Click device toggle icon
- Select different devices:
  - iPhone SE (375px)
  - iPad (768px)
  - Desktop (1920px)

### Expected Results:
✅ Layout adapts smoothly  
✅ No horizontal scrolling  
✅ Text remains readable  
✅ Buttons remain clickable  
✅ Images scale appropriately

---

## 🔌 Test Scenario 7: API Endpoints

### Using Postman or Thunder Client:

#### 1. **Get Artisan Statistics**
```http
GET http://localhost:5000/api/crafts/artisan/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_crafts": "3",
      "total_views": "0",
      "total_saves": "0",
      "total_orders": "0",
      "featured_count": "0",
      "approved_count": "2",
      "pending_count": "1"
    }
  }
}
```

#### 2. **Track Craft View**
```http
POST http://localhost:5000/api/crafts/1/view
Authorization: Bearer YOUR_TOKEN_HERE (optional)
```

**Expected Response:**
```json
{
  "success": true,
  "message": "View tracked"
}
```

#### 3. **Save a Craft**
```http
POST http://localhost:5000/api/crafts/1/save
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Craft saved successfully"
}
```

#### 4. **Check Saved Status**
```http
GET http://localhost:5000/api/crafts/1/saved
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "isSaved": true
  }
}
```

#### 5. **Unsave a Craft**
```http
DELETE http://localhost:5000/api/crafts/1/save
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Craft unsaved successfully"
}
```

#### 6. **Create Craft with New Fields**
```http
POST http://localhost:5000/api/crafts
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Test Pottery",
  "description": "Beautiful handmade pot",
  "craft_type": "Pottery",
  "category": "Pottery",
  "price": 500,
  "location": "Jaipur",
  "contact": "9876543210",
  "images": ["url1", "url2", "url3"],
  "stock": 10,
  "delivery_days": 7,
  "is_featured": false,
  "is_new_arrival": true,
  "made_to_order": false,
  "limited_edition": false
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Craft created successfully",
  "data": {
    "craft": {
      "id": 4,
      "name": "Test Pottery",
      "status": "pending",
      "stock": 10,
      "is_new_arrival": true,
      ...
    }
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot read property 'role' of undefined"
**Solution**: Make sure you're logged in. Check `localStorage.getItem('token')` exists.

### Issue 2: Images not previewing
**Solution**: Check file input accepts `image/*` and FileReader is supported in browser.

### Issue 3: Stats showing null/undefined
**Solution**: Database might be empty. Upload at least one craft first.

### Issue 4: 404 on `/artisan/crafts`
**Solution**: Check App.jsx has the route and frontend server is running.

### Issue 5: Backend API errors
**Solution**: 
- Check PostgreSQL is running
- Verify database migration completed
- Check `crafts` table has new columns
- Restart backend server

### Issue 6: CORS errors
**Solution**: Backend should have CORS enabled in `server.js`:
```javascript
app.use(cors());
```

---

## ✅ Test Completion Checklist

- [ ] Logged in as artisan
- [ ] Accessed enhanced upload form
- [ ] Uploaded craft with multiple images
- [ ] Set product flags (featured, new arrival, etc.)
- [ ] Viewed statistics dashboard
- [ ] Tested all filter tabs
- [ ] Deleted a test craft
- [ ] Verified craft card displays all info
- [ ] Tested responsive design (mobile/tablet/desktop)
- [ ] Verified API endpoints with Postman
- [ ] No console errors in browser
- [ ] Backend logs show no errors

---

## 🎉 Success Criteria

Phase 1 is considered successful if:

1. ✅ Artisans can upload crafts with 5+ images
2. ✅ Stock, delivery days, and flags are saved correctly
3. ✅ Statistics dashboard shows accurate data
4. ✅ Filters work on crafts management page
5. ✅ Delete functionality works with confirmation
6. ✅ All 6 new API endpoints respond correctly
7. ✅ Responsive design works on all screen sizes
8. ✅ No critical bugs or errors
9. ✅ Bilingual support (English/Telugu) works
10. ✅ Backend handles all new database fields

---

**If all tests pass, Phase 1 is COMPLETE! 🎊**

Ready to proceed to Phase 2: Advanced Analytics & Reporting.
