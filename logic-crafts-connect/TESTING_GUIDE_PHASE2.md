# 🧪 PHASE 2 TESTING GUIDE

## Quick Testing Instructions for Order Management Features

---

## ✅ Prerequisites

1. **Phase 1 Complete**: ✓ (Crafts uploaded)
2. **Backend Running**: `http://localhost:5000` ✓
3. **Frontend Running**: `http://localhost:5173`
4. **Test Accounts**:
   - Artisan account (to manage orders)
   - Buyer account (to place test orders)

---

## 🛍️ Test Scenario 1: Place Test Orders (As Buyer)

### Steps:

1. **Login as Buyer**
   - Use buyer credentials
   - Add items to cart
   - Proceed to checkout

2. **Place Orders**
   - Place at least 3-5 test orders
   - Use different artisans if available
   - Vary order amounts

3. **Verify Orders Created**
   - Check buyer orders page
   - Note order numbers

---

## 📦 Test Scenario 2: View Orders Dashboard (As Artisan)

### Steps:

1. **Login as Artisan**
   - Go to artisan dashboard
   - Click "🛒 Manage Orders"
   - OR visit `/artisan/orders`

2. **Verify Statistics Dashboard**
   - Should see 7 stat cards:
     - 📦 Total Orders
     - 🆕 New Orders
     - ⏳ In Progress
     - 🚚 Shipped
     - ✅ Completed
     - 💰 Total Revenue (highlighted)
     - 📊 Avg Order Value

3. **Check Order Cards**
   - Each order should display:
     - ✅ Order number
     - ✅ Status badge
     - ✅ Buyer name
     - ✅ Order date
     - ✅ Number of items
     - ✅ Total amount (₹)
     - ✅ Product previews (images)
     - ✅ "View Details" button
     - ✅ "Reject" button (for new orders)

### Expected Results:
✅ All statistics display correctly  
✅ Order cards show complete information  
✅ Product images load properly  
✅ Status badges are color-coded

---

## 🔍 Test Scenario 3: Filter Orders

### Steps:

1. **On Orders Dashboard** (`/artisan/orders`)

2. **Test Each Filter**:
   - Click "All Orders" → Shows all
   - Click "New" → Shows only 'placed' status
   - Click "Confirmed" → Shows only 'confirmed' status
   - Click "Processing" → Shows only 'processing' status
   - Click "Shipped" → Shows only 'shipped' status
   - Click "Delivered" → Shows only 'delivered' status
   - Click "Cancelled" → Shows only 'cancelled' status

3. **Verify Active State**:
   - Active tab has brown background
   - Other tabs are gray

### Expected Results:
✅ Filter buttons work correctly  
✅ Order list updates dynamically  
✅ Active filter is highlighted  
✅ Empty state message if no orders

---

## 📋 Test Scenario 4: View Order Details

### Steps:

1. **Click "View Details"** on any order

2. **Verify Order Details Page Shows**:
   - ✅ Order number and status badge
   - ✅ Order date
   - ✅ Back button

3. **Check Buyer Information Section**:
   - ✅ Buyer name
   - ✅ Email address
   - ✅ Phone number
   - ✅ Shipping address

4. **Check Tracking Information Section**:
   - ✅ Tracking number (or "Not set")
   - ✅ Estimated delivery (or "Not set")
   - ✅ "Update Tracking" button

5. **Check Order Items Table**:
   - ✅ Product images (80x80px)
   - ✅ Item names
   - ✅ Descriptions (2 lines)
   - ✅ Quantity
   - ✅ Price at purchase
   - ✅ Subtotal

6. **Check Order Summary**:
   - ✅ Payment method
   - ✅ Total amount (bold, large)
   - ✅ Customer notes (if any)

7. **Check Status Update Section** (if not delivered/cancelled):
   - ✅ Status progression buttons
   - ✅ Current status highlighted
   - ✅ Past statuses grayed out
   - ✅ Future statuses clickable

### Expected Results:
✅ All information displays correctly  
✅ Images load properly  
✅ Currency formatted as ₹X,XXX  
✅ Status buttons functional

---

## 🔄 Test Scenario 5: Update Order Status

### Steps:

1. **On Order Details Page**
   - Find an order with status "placed" or "confirmed"

2. **Update Status Progression**:
   - Click "Confirmed" → Confirm dialog → Order updates
   - Refresh and click "Processing" → Order updates
   - Continue: "Shipped" → "Out for Delivery" → "Delivered"

3. **Verify Each Update**:
   - Alert shows "Order status updated successfully"
   - Page refreshes with new status
   - Status badge changes color
   - Statistics update on orders page

4. **Check Status Progression Logic**:
   - Cannot go backwards (past statuses disabled)
   - Current status is highlighted
   - Only forward progression allowed

### Expected Results:
✅ Status updates successfully  
✅ Visual feedback on each update  
✅ Statistics reflect changes  
✅ Cannot revert to past statuses

---

## 📦 Test Scenario 6: Update Tracking Information

### Steps:

1. **On Order Details Page**
   - Click "Update Tracking" button

2. **Enter Tracking Number**:
   - Prompt appears: "Tracking Number:"
   - Enter: "TRK1234567890"
   - Click OK

3. **Enter Estimated Delivery**:
   - Prompt appears: "Estimated Delivery (YYYY-MM-DD):"
   - Enter: "2025-10-30"
   - Click OK

4. **Verify Update**:
   - Alert: "Tracking information updated"
   - Page refreshes
   - Tracking number displays
   - Estimated delivery displays

### Expected Results:
✅ Prompts appear correctly  
✅ Information saves successfully  
✅ Displays on order details  
✅ Buyer can see tracking info

---

## ❌ Test Scenario 7: Reject Order

### Steps:

1. **On Orders List**
   - Find order with "New" or "Confirmed" status
   - Click "Reject" button

2. **Confirm Rejection**:
   - Dialog: "Are you sure you want to reject this order?"
   - Click OK

3. **Enter Reason**:
   - Prompt: "Please enter rejection reason:"
   - Enter: "Out of stock"
   - Click OK

4. **Verify Rejection**:
   - Alert: "Order rejected successfully"
   - Order status changes to "Cancelled"
   - Order appears in "Cancelled" filter
   - Statistics update (new orders -1, cancelled orders +1)

### Expected Results:
✅ Rejection flow works  
✅ Reason is saved  
✅ Status updates to cancelled  
✅ Cannot reject delivered orders

---

## 📊 Test Scenario 8: Statistics Accuracy

### Steps:

1. **Record Initial Statistics**:
   - Total Orders: X
   - New Orders: Y
   - Total Revenue: ₹Z

2. **Perform Actions**:
   - Update 1 order to "delivered"
   - Reject 1 order
   - Place new order (as buyer)

3. **Refresh Orders Page**

4. **Verify Updated Statistics**:
   - Total Orders should increase by 1 (new order)
   - New Orders should increase by 1
   - Completed Orders should increase by 1
   - Cancelled Orders should increase by 1
   - Total Revenue should increase by delivered order amount

### Expected Results:
✅ Statistics calculate correctly  
✅ Revenue only counts delivered orders  
✅ Average order value is accurate  
✅ All counters update properly

---

## 📱 Test Scenario 9: Responsive Design

### Desktop View (> 992px):
- [ ] 7-column stats grid
- [ ] Order cards display well
- [ ] Order details table is readable
- [ ] Status buttons in single row

### Tablet View (768px - 992px):
- [ ] 4-column stats grid
- [ ] Order cards adapt
- [ ] Buyer info in grid

### Mobile View (< 768px):
- [ ] 2-column stats grid
- [ ] Order cards stack
- [ ] Table converts to cards
- [ ] Status buttons stack vertically

### How to Test:
- Open DevTools (F12)
- Toggle device toolbar
- Test on:
  - iPhone SE (375px)
  - iPad (768px)
  - Desktop (1920px)

### Expected Results:
✅ Layout adapts smoothly  
✅ No horizontal scrolling  
✅ All buttons remain clickable  
✅ Text remains readable

---

## 🔌 Test Scenario 10: API Endpoint Testing

Use Postman or Thunder Client:

### 1. Get Artisan Statistics
```http
GET http://localhost:5000/api/orders/artisan/stats
Authorization: Bearer YOUR_ARTISAN_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_orders": "5",
      "new_orders": "2",
      "pending_orders": "1",
      "shipped_orders": "1",
      "completed_orders": "1",
      "cancelled_orders": "0",
      "total_revenue": "2500.00",
      "average_order_value": "2500.00"
    }
  }
}
```

### 2. Get Revenue Data
```http
GET http://localhost:5000/api/orders/artisan/revenue?period=monthly
Authorization: Bearer YOUR_ARTISAN_TOKEN
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": {
    "revenue": [
      {
        "period": "2025-10",
        "order_count": "1",
        "revenue": "2500.00",
        "avg_order_value": "2500.00"
      }
    ]
  }
}
```

### 3. Reject Order
```http
PUT http://localhost:5000/api/orders/1/reject
Authorization: Bearer YOUR_ARTISAN_TOKEN
Content-Type: application/json

{
  "reason": "Out of stock"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order rejected successfully",
  "data": {
    "order": {
      "id": 1,
      "status": "cancelled",
      "cancellation_reason": "Out of stock",
      ...
    }
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "No orders found"
**Solution**: Place test orders as a buyer first.

### Issue 2: Statistics showing 0
**Solution**: 
- Make sure orders exist in database
- Check that artisan_id matches logged-in user
- Verify backend API returns data

### Issue 3: Can't update status
**Solution**:
- Check you're logged in as artisan
- Verify order belongs to you
- Check backend logs for errors

### Issue 4: Reject button not showing
**Solution**:
- Only visible for "placed" and "confirmed" orders
- Check order status

### Issue 5: Images not loading
**Solution**:
- Check image_url in crafts table
- Verify image URLs are valid
- Check browser console for 404 errors

---

## ✅ Phase 2 Test Completion Checklist

### Backend:
- [ ] `GET /api/orders/artisan/stats` works
- [ ] `GET /api/orders/artisan/revenue` works
- [ ] `PUT /api/orders/:id/reject` works
- [ ] `PUT /api/orders/:id/status` works
- [ ] `PUT /api/orders/:id/tracking` works
- [ ] All endpoints return correct data
- [ ] No backend errors in console

### Frontend - Orders List:
- [ ] Statistics dashboard displays
- [ ] All 7 stat cards show correct data
- [ ] Filter tabs work
- [ ] Order cards display properly
- [ ] Product previews load
- [ ] View Details button works
- [ ] Reject button works
- [ ] Responsive on mobile

### Frontend - Order Details:
- [ ] Order information displays
- [ ] Buyer info section complete
- [ ] Tracking info section works
- [ ] Order items table shows
- [ ] Order summary correct
- [ ] Status update buttons work
- [ ] Update tracking works
- [ ] Back button works
- [ ] Responsive on mobile

### Integration:
- [ ] Navigation from dashboard works
- [ ] Statistics update after actions
- [ ] Order status flow is logical
- [ ] Tracking info saves correctly
- [ ] Rejection flow complete
- [ ] No console errors

### Design:
- [ ] All colors match design system
- [ ] Hover effects work
- [ ] Animations smooth
- [ ] Mobile layout works
- [ ] Tables readable
- [ ] Buttons accessible

---

## 🎉 Success Criteria

Phase 2 is successful if:

1. ✅ Artisans can view all their orders
2. ✅ Statistics display accurately
3. ✅ Filters work correctly
4. ✅ Order details show complete information
5. ✅ Status can be updated through progression
6. ✅ Tracking information can be added
7. ✅ Orders can be rejected with reasons
8. ✅ All 3 new API endpoints work
9. ✅ Responsive design works on all devices
10. ✅ No critical bugs or errors

---

**If all tests pass, Phase 2 is COMPLETE! 🎊**

Ready to proceed to Phase 4: Analytics & Insights with visual charts!
