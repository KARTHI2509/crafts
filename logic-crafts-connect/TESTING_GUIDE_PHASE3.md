# 🧪 PHASE 3 TESTING GUIDE

## Quick Testing Instructions for Messaging Features

---

## ✅ Prerequisites

1. **Phases 1 & 2 Complete**: ✓
2. **Backend Running**: `http://localhost:5000` ✓
3. **Frontend Running**: `http://localhost:5173`
4. **Test Accounts**:
   - Artisan account
   - Buyer account (to send test messages)

---

## 💬 Test Scenario 1: Create Test Conversations (As Buyer)

### Steps:

1. **Login as Buyer**
   - Use buyer credentials
   - Go to `/explore`

2. **Browse Crafts**
   - Find a craft from the test artisan
   - Click on craft card

3. **Send Message**
   - Look for "Contact Artisan" or message button
   - Send message: "Hi, I'm interested in this product. What are the dimensions?"
   - Send another: "Is this available in blue color?"

4. **Repeat for Multiple Crafts**
   - Message about 2-3 different crafts
   - Create diverse conversation history

### Expected Results:
✅ Messages send successfully  
✅ Confirmation appears  
✅ Multiple conversations created

---

## 📬 Test Scenario 2: View Artisan Inbox

### Steps:

1. **Login as Artisan**
   - Go to artisan dashboard
   - Click "💬 Messages"
   - OR visit `/artisan/messages`

2. **Verify Statistics Dashboard**
   - Should see 4 stat cards:
     - 💬 Total Conversations (e.g., 3)
     - 📩 Unread Messages (e.g., 6)
     - 📤 Messages Sent (e.g., 0)
     - 📥 Messages Received (e.g., 6)

3. **Check Conversations List**
   - Left panel shows all conversations
   - Each conversation displays:
     - ✅ Buyer's initial in circle avatar
     - ✅ Buyer name
     - ✅ Last message preview
     - ✅ Timestamp (e.g., "5m ago", "2h ago")
     - ✅ Craft title (📦 Handmade Pot)
     - ✅ Red unread badge with count

### Expected Results:
✅ All conversations appear  
✅ Statistics are accurate  
✅ Unread badges show correct counts  
✅ Latest conversations at top

---

## 💬 Test Scenario 3: Open and Read Messages

### Steps:

1. **Click on a Conversation**
   - Select first conversation from list

2. **Verify Messages Panel Opens**:
   - **Header shows**:
     - ✅ Buyer avatar and name
     - ✅ "Buyer" role label
     - ✅ Craft context (if applicable)
   
   - **Message history displays**:
     - ✅ All messages from buyer
     - ✅ Messages aligned left (white bubbles)
     - ✅ Timestamps visible (e.g., "2:45 PM")
     - ✅ Smooth scroll

3. **Check Unread Update**:
   - Unread badge should disappear
   - Unread count in stats should decrease

### Expected Results:
✅ Messages load correctly  
✅ Layout is clean and readable  
✅ Unread indicators update  
✅ Timestamps show properly

---

## ✍️ Test Scenario 4: Send Reply Messages

### Steps:

1. **With Conversation Open**
   - Type in message input at bottom
   - Enter: "Thank you for your interest! The dimensions are 10x8 inches."

2. **Send Message**:
   - Click "Send" button
   - OR press Enter key

3. **Verify Message Appears**:
   - Message shows immediately
   - Aligned to right side
   - Brown gradient background
   - White text
   - Timestamp shows

4. **Send Multiple Messages**:
   - Send 2-3 more messages
   - Verify each appears correctly
   - Check smooth animation

5. **Verify Updates**:
   - Conversation list updates
   - "You:" prefix on last message
   - Sent count in stats increases

### Expected Results:
✅ Messages send instantly  
✅ Appear on right side  
✅ Brown gradient styling  
✅ Stats update correctly  
✅ Conversation list updates

---

## 🔄 Test Scenario 5: Switch Between Conversations

### Steps:

1. **Click Different Conversation**
   - Select another buyer from list

2. **Verify Switching**:
   - Previous conversation closes
   - New conversation loads
   - Message history appears
   - Correct buyer info shows
   - Unread messages marked as read

3. **Switch Back and Forth**:
   - Click first conversation
   - Then second conversation
   - Then third conversation
   - Verify smooth transitions

### Expected Results:
✅ Conversations switch instantly  
✅ Message history loads correctly  
✅ No lag or errors  
✅ Unread counts update properly

---

## 📊 Test Scenario 6: Verify Statistics Accuracy

### Initial State:
- Record current statistics

### Perform Actions:
1. **Send 5 new messages** (different conversations)
2. **Open 2 unread conversations**

### Verify Changes:
- **Messages Sent**: Should increase by 5
- **Unread Messages**: Should decrease by count of unread in 2 conversations
- **Total Conversations**: Should remain same
- **Messages Received**: Should remain same

### Formula Check:
```
Unread Count = (All received messages) - (Read messages)
Conversation Count = Unique users messaged with
Sent Count = Total messages sent by artisan
Received Count = Total messages received by artisan
```

### Expected Results:
✅ All stats calculate correctly  
✅ Real-time updates work  
✅ No discrepancies

---

## 🎨 Test Scenario 7: Visual Design Verification

### Desktop View (> 992px):

**Layout:**
- [ ] Two panels side-by-side
- [ ] Conversations: 380px width
- [ ] Messages: Flexible width
- [ ] Both panels full height

**Messages:**
- [ ] Sent: Right-aligned, brown gradient
- [ ] Received: Left-aligned, white background
- [ ] Max 70% width
- [ ] Smooth slide-in animation

**Conversations:**
- [ ] Avatar circles with initials
- [ ] Names bold and clear
- [ ] Preview text gray
- [ ] Unread badges red and prominent

### Tablet View (768px - 992px):
- [ ] Conversations: 280px width
- [ ] Messages panel adjusts
- [ ] All text readable
- [ ] Buttons accessible

### Mobile View (< 768px):
- [ ] Panels stack vertically
- [ ] Conversations max-height 300px
- [ ] Messages panel flexible
- [ ] Message bubbles max 85% width
- [ ] Send button full width

### How to Test:
- Open DevTools (F12)
- Toggle device toolbar
- Test on:
  - iPhone SE (375px)
  - iPad (768px)
  - Desktop (1920px)

### Expected Results:
✅ Responsive at all breakpoints  
✅ No layout breaks  
✅ All features accessible  
✅ Text remains readable

---

## 🕐 Test Scenario 8: Timestamp Display

### Test Different Time Ranges:

**Recent Messages** (< 1 hour):
- Should show: "5m ago", "45m ago"

**Today** (< 24 hours):
- Should show: "2h ago", "8h ago"

**Older Messages** (> 24 hours):
- Should show: "Oct 23", "Oct 22"

### How to Verify:
1. Send new message → Shows minutes
2. Check yesterday's messages → Shows date
3. Look at message time in bubble → Shows HH:MM format

### Expected Results:
✅ Relative time in conversation list  
✅ Exact time in message bubbles  
✅ Format is consistent  
✅ Easy to understand

---

## 🎯 Test Scenario 9: Craft Context Display

### With Craft-Related Messages:

1. **Check Conversation List**:
   - Should show: "📦 Craft Title"
   - Below message preview
   - Color: brown

2. **Check Message Header**:
   - Should show: "📦 Regarding: Craft Title"
   - In header section
   - Gray background badge

### Without Craft Context:
- No craft title shown
- Just buyer name and message

### Expected Results:
✅ Craft context displays correctly  
✅ Helps identify conversation topic  
✅ Styling is consistent  
✅ Non-craft messages work too

---

## 🔍 Test Scenario 10: Edge Cases

### Empty States:

**No Conversations:**
- Login as new artisan with no messages
- Should show: "No conversations yet"
- Empty state icon and text

**No Selected Conversation:**
- Don't click any conversation
- Should show: "Select a conversation to start messaging"
- Large 💬 icon with text

### Long Messages:
- Send very long message (500 characters)
- Should wrap correctly
- Not overflow bubble
- Remain readable

### Many Conversations:
- Have 20+ conversations
- Should scroll smoothly
- Custom scrollbar shows
- No performance issues

### Rapid Messaging:
- Send 10 messages quickly
- All should appear
- Order preserved
- No duplicates

### Expected Results:
✅ All edge cases handled  
✅ No errors or crashes  
✅ Graceful degradation  
✅ User-friendly messages

---

## 🔌 Test Scenario 11: API Integration

### Using Browser DevTools Network Tab:

1. **Open Messages Page**:
   - Check: `GET /api/messages/inbox`
   - Should return conversations array

2. **Click Conversation**:
   - Check: `GET /api/messages/conversation/:userId`
   - Should return messages array
   - Check: `PUT /api/messages/mark-read/:senderId`
   - Should mark as read

3. **Send Message**:
   - Check: `POST /api/messages`
   - Body: `{ receiver_id, message_text, craft_id }`
   - Should return created message

4. **View Stats**:
   - Check: `GET /api/messages/stats`
   - Should return stats object

### Expected Responses:
✅ All API calls succeed (200/201)  
✅ Data structure matches expected  
✅ No console errors  
✅ Fast response times

---

## ⚡ Test Scenario 12: Performance

### Load Time:
- Measure time to load inbox
- Should be < 2 seconds
- Smooth transitions

### Scrolling:
- Scroll through 50+ messages
- Should be smooth
- No lag or jank
- Custom scrollbar works

### Message Sending:
- Send message
- Should appear within 500ms
- No delay or freeze

### Conversation Switching:
- Click between conversations
- Should load within 300ms
- Smooth animation

### Expected Results:
✅ Fast load times  
✅ Smooth scrolling  
✅ Instant message display  
✅ No performance issues

---

## ✅ Phase 3 Test Completion Checklist

### Inbox View:
- [ ] Statistics display correctly
- [ ] Conversations list loads
- [ ] Unread badges appear
- [ ] Timestamps are relative
- [ ] Craft context shows
- [ ] No console errors

### Messaging:
- [ ] Conversations open on click
- [ ] Messages load correctly
- [ ] Sent messages align right (brown)
- [ ] Received messages align left (white)
- [ ] Send button works
- [ ] Messages appear instantly
- [ ] Unread marks as read

### Real-Time Updates:
- [ ] Sent messages update list
- [ ] Unread count decreases
- [ ] Statistics update
- [ ] Conversation order updates

### Responsive Design:
- [ ] Desktop layout works
- [ ] Tablet layout works
- [ ] Mobile layout works
- [ ] All breakpoints tested

### Edge Cases:
- [ ] Empty states work
- [ ] Long messages wrap
- [ ] Many conversations scroll
- [ ] Rapid messages work

### Integration:
- [ ] All API calls succeed
- [ ] Data loads correctly
- [ ] No backend errors
- [ ] Performance is good

---

## 🎉 Success Criteria

Phase 3 is successful if:

1. ✅ Artisans can view all conversations
2. ✅ Statistics display accurately
3. ✅ Messages send and receive correctly
4. ✅ Unread tracking works
5. ✅ Visual design is professional
6. ✅ Responsive on all devices
7. ✅ Smooth animations work
8. ✅ No critical bugs or errors
9. ✅ Performance is acceptable
10. ✅ Integration with backend works

---

**If all tests pass, Phase 3 is COMPLETE! 🎊**

Artisans can now communicate effectively with buyers through a modern messaging interface!

Ready to proceed to Phase 4: Analytics & Insights! 📊
