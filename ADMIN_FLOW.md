# TICPIN ADMIN FLOW - COMPLETE DOCUMENTATION

## Table of Contents
1. [Phase 1: Admin Role & Responsibilities](#phase-1-admin-role--responsibilities)
2. [Phase 2: Admin Dashboard Overview](#phase-2-admin-dashboard-overview)
3. [Phase 3: Category-Specific Approval Workflows](#phase-3-category-specific-approval-workflows)
4. [Phase 4: User Impact & Visibility](#phase-4-user-impact--visibility)
5. [Implementation Checklist](#implementation-checklist)

---

## Phase 1: Admin Role & Responsibilities

### 1.1 Who is an Admin?

```
Admin User Characteristics:
├─ Login method: Phone number 0000000000 + OTP 123456
├─ Username: admin
└─ Role flags:
    ├─ is_admin: true
    ├─ is_organizer: false
    └─ organizer_category: null

Admin Access:
├─ Full platform access (unrestricted)
├─ Cannot see organizer footer links
├─ Auto-redirect after login → /admin
└─ No verification needed (already admin)
```

---

### 1.2 Core Admin Responsibilities

```
Admin Duties:
├─ VERIFY ORGANIZERS
│   ├─ Review PAN Card documents
│   ├─ Verify identity documents
│   ├─ Check background verification
│   └─ Approve/Reject verification requests
│
├─ MANAGE CATEGORIES
│   ├─ Monitor event organizers
│   ├─ Monitor play venue operators
│   ├─ Monitor dining restaurant partners
│   └─ Handle category-specific approvals
│
├─ USER MANAGEMENT
│   ├─ View all users (normal users)
│   ├─ View all organizers
│   ├─ Monitor user activity
│   └─ Handle user complaints/reports
│
├─ BOOKING OVERSIGHT
│   ├─ View all bookings across categories
│   ├─ Monitor booking status
│   ├─ Handle disputes/cancellations
│   └─ Manage refunds
│
└─ PLATFORM ANALYTICS
    ├─ View revenue reports
    ├─ View user statistics
    ├─ Category performance metrics
    └─ Organizer performance data
```

---

## Phase 2: Admin Dashboard Overview

### 2.1 Admin Dashboard Structure

```
/admin Dashboard:

┌─────────────────────────────────────────┐
│ ADMIN PANEL - MAIN DASHBOARD            │
├─────────────────────────────────────────┤
│                                         │
│  A. VERIFICATION CENTER                │
│     ├─ Pending Verification Requests    │
│     │   ├─ Events: 5 pending            │
│     │   ├─ Play: 3 pending              │
│     │   └─ Dining: 7 pending            │
│     │                                   │
│     ├─ View Details                     │
│     │   ├─ Organizer Profile            │
│     │   ├─ PAN Card Verification        │
│     │   ├─ Identity Documents           │
│     │   ├─ Bank Account Details         │
│     │   └─ Action: APPROVE / REJECT     │
│     │                                   │
│     └─ Verification History             │
│         ├─ Date Submitted               │
│         ├─ Organizer Name               │
│         ├─ Status: APPROVED/REJECTED    │
│         └─ Action Timestamp             │
│                                         │
├─────────────────────────────────────────┤
│  B. CATEGORY MANAGEMENT                 │
│     ├─ Events                           │
│     │   ├─ Total Organizers: 45         │
│     │   ├─ Verified: 30                 │
│     │   ├─ Pending: 10                  │
│     │   ├─ Rejected: 5                  │
│     │   └─ Active Listings: 120         │
│     │                                   │
│     ├─ Play (Sports & Venues)           │
│     │   ├─ Total Operators: 28          │
│     │   ├─ Verified: 18                 │
│     │   ├─ Pending: 5                   │
│     │   ├─ Rejected: 5                  │
│     │   └─ Active Listings: 85          │
│     │                                   │
│     └─ Dining (Restaurants)             │
│         ├─ Total Partners: 52           │
│         ├─ Verified: 35                 │
│         ├─ Pending: 12                  │
│         ├─ Rejected: 5                  │
│         └─ Active Listings: 180         │
│                                         │
├─────────────────────────────────────────┤
│  C. USER MANAGEMENT                     │
│     ├─ Total Users: 1,240               │
│     ├─ Active Users (Last 7 days): 450  │
│     ├─ New Users (This week): 60        │
│     │                                   │
│     └─ Organizers Overview              │
│         ├─ Total Organizers: 125        │
│         ├─ Events: 45                   │
│         ├─ Play: 28                     │
│         ├─ Dining: 52                   │
│         └─ Multi-Category: 30 (verified│
│            in multiple categories)      │
│                                         │
├─────────────────────────────────────────┤
│  D. BOOKING MANAGEMENT                  │
│     ├─ Total Bookings: 3,450            │
│     ├─ This Week: 320                   │
│     │                                   │
│     ├─ By Status:                       │
│     │   ├─ Confirmed: 2,800             │
│     │   ├─ Pending: 450                 │
│     │   ├─ Cancelled: 180               │
│     │   └─ Disputed: 20                 │
│     │                                   │
│     └─ By Category:                     │
│         ├─ Events: 1,200 bookings       │
│         ├─ Play: 1,100 bookings         │
│         └─ Dining: 1,150 bookings       │
│                                         │
└─────────────────────────────────────────┘
```

---

### 2.2 Admin Navigation Menu

```
Admin Sidebar Menu:

📊 Dashboard
│
├─ 🔍 Verification Center
│   ├─ Pending Requests (15)
│   ├─ Review Applications
│   ├─ Approval History
│   └─ Rejected Applications
│
├─ 📋 Categories
│   ├─ Events
│   │   ├─ Active Organizers
│   │   ├─ Event Listings
│   │   └─ Category Settings
│   │
│   ├─ Play (Sports & Venues)
│   │   ├─ Active Operators
│   │   ├─ Venue Listings
│   │   └─ Category Settings
│   │
│   └─ Dining (Restaurants)
│       ├─ Active Partners
│       ├─ Restaurant Listings
│       └─ Category Settings
│
├─ 👥 User Management
│   ├─ All Users
│   ├─ Organizers
│   ├─ User Reports
│   └─ Blocked Users
│
├─ 💳 Bookings
│   ├─ All Bookings
│   ├─ Pending Bookings
│   ├─ Disputes
│   └─ Refunds
│
├─ 📈 Analytics
│   ├─ Revenue Reports
│   ├─ User Statistics
│   ├─ Category Performance
│   └─ Operator Rankings
│
└─ ⚙️ Settings
    ├─ Platform Settings
    ├─ Category Rules
    ├─ Verification Requirements
    └─ Admin Logs
```

---

## Phase 3: Category-Specific Approval Workflows

### 3.1 Events Category Approval Workflow

```
EVENT ORGANIZER VERIFICATION FLOW (Admin Perspective)

Step 1: Organizer Submits Verification Request
┌──────────────────────────────────────────────┐
│ Submitted Data:                              │
│ ├─ Email: organizer@example.com              │
│ ├─ PAN Card: ABCDE1234F                      │
│ ├─ Full Name: John Event                     │
│ ├─ Category: EVENTS                          │
│ ├─ Documents:                                │
│ │   ├─ PAN Card Photo (both sides)           │
│ │   ├─ ID Proof (Aadhar/DL/Passport)       │
│ │   ├─ Address Proof (Utility Bill)          │
│ │   └─ Bank Account Details                  │
│ ├─ Bank Account Details:                     │
│ │   ├─ Account Holder Name                   │
│ │   ├─ Account Number                        │
│ │   ├─ IFSC Code                             │
│ │   └─ Bank Name                             │
│ └─ Self-Declared Information:                │
│     ├─ Event Experience (years)              │
│     └─ Previous Events Organized             │
└──────────────────────────────────────────────┘
         ↓
    ADMIN RECEIVES
         ↓

Step 2: Admin Reviews in Verification Center
┌──────────────────────────────────────────────┐
│ ADMIN SCREENS:                               │
│                                              │
│ 2.1 PAN Verification Screen                  │
│   ├─ PAN entered: ABCDE1234F                 │
│   ├─ Check: Is this PAN already used?        │
│   │   └─ If YES → Reject (One PAN = One Email)
│   ├─ Check: Email linked to another PAN?    │
│   │   └─ If YES → Reject (One Email = One PAN)
│   ├─ Check: PAN format validity              │
│   └─ Check: PAN age (must be 5+ years old)   │
│       └─ Decision: VALID / INVALID           │
│                                              │
│ 2.2 Document Verification Screen             │
│   ├─ View PAN Card Images                    │
│   │   ├─ Check: Clarity & readability        │
│   │   └─ Check: Expiry (if applicable)       │
│   ├─ View ID Proof                           │
│   │   ├─ Check: Valid ID document            │
│   │   ├─ Check: Photo matches applicant      │
│   │   └─ Check: Expiry date                  │
│   ├─ View Address Proof                      │
│   │   ├─ Check: Recent document (< 6 months) │
│   │   └─ Check: Address matches PAN          │
│   └─ Decision: APPROVED / REJECTED           │
│                                              │
│ 2.3 Bank Details Verification                │
│   ├─ Account Holder Name                     │
│   │   └─ Check: Matches PAN name?            │
│   ├─ IFSC Code                               │
│   │   └─ Check: Valid Indian bank IFSC       │
│   ├─ Account Number                          │
│   │   └─ Check: Valid format                 │
│   └─ Decision: APPROVED / REJECTED           │
│                                              │
│ 2.4 Manual Review Notes                      │
│   ├─ Admin Notes Section                     │
│   ├─ Attach Additional Docs (if needed)      │
│   └─ Flag for Manual Investigation (if needed)
│                                              │
└──────────────────────────────────────────────┘
         ↓

Step 3: Admin Decision
┌──────────────────────────────────────────────┐
│ APPROVE EVENT ORGANIZER                      │
├──────────────────────────────────────────────┤
│ ✓ All documents valid                        │
│ ✓ PAN validation passed                      │
│ ✓ Bank details verified                      │
│ ✓ No duplicate PAN or Email                  │
│                                              │
│ Action: APPROVE                              │
├──────────────────────────────────────────────┤
│ Backend Update:                              │
│ ├─ User.categories_verified.events.verified  │
│ │   = TRUE                                   │
│ ├─ User.categories_verified.events.verified_at
│ │   = current_timestamp                      │
│ ├─ User.categories_verified.events.pan_used  │
│ │   = "ABCDE1234F"                           │
│ ├─ User.organizer_category = "events"        │
│ └─ Create audit log entry                    │
│                                              │
│ Frontend Update (Organizer):                 │
│ ├─ Email notification sent                   │
│ ├─ "Events" category now shows as VERIFIED   │
│ ├─ Can now create/edit/delete events         │
│ └─ Redirect to /organizer-dashboard?category │
│                                              │
└──────────────────────────────────────────────┘

OR

┌──────────────────────────────────────────────┐
│ REJECT EVENT ORGANIZER                       │
├──────────────────────────────────────────────┤
│ ✗ PAN already linked to another email        │
│ OR                                           │
│ ✗ Documents are unclear/expired              │
│ OR                                           │
│ ✗ Duplicate verification attempt             │
│ OR                                           │
│ ✗ Suspicious activity detected               │
│                                              │
│ Action: REJECT                               │
├──────────────────────────────────────────────┤
│ Admin Input:                                 │
│ ├─ Rejection Reason (predefined list)        │
│ │   ├─ PAN already exists                    │
│ │   ├─ Invalid documents                     │
│ │   ├─ Expired documents                     │
│ │   ├─ Address mismatch                      │
│ │   └─ Other (with custom reason)            │
│ └─ Detailed Rejection Message                │
│                                              │
│ Backend Update:                              │
│ ├─ User.categories_verified.events.verified  │
│ │   = FALSE                                  │
│ ├─ User.verification_rejected = TRUE         │
│ ├─ User.rejection_reason = "PAN already..."  │
│ └─ Create audit log entry                    │
│                                              │
│ Frontend Update (Organizer):                 │
│ ├─ Email notification sent                   │
│ ├─ Shows rejection reason                    │
│ ├─ Option to RESUBMIT with corrections       │
│ └─ Redirect to /organizer-onboarding with    │
│    error message                             │
│                                              │
└──────────────────────────────────────────────┘

Step 4: Organizer Creates Events
┌──────────────────────────────────────────────┐
│ Once APPROVED:                               │
│                                              │
│ Organizer Dashboard Access:                  │
│ /organizer-dashboard?category=events         │
│                                              │
│ Available Actions:                           │
│ ├─ CREATE EVENT                              │
│ │  ├─ Event Title                            │
│ │  ├─ Date & Time                            │
│ │  ├─ Venue Location                         │
│ │  ├─ Ticket Categories & Pricing            │
│ │  ├─ Event Description                      │
│ │  ├─ Event Images/Posters                   │
│ │  └─ Submit for listing                     │
│ │                                            │
│ ├─ EDIT EVENT                                │
│ │  └─ Modify all event details               │
│ │                                            │
│ ├─ DELETE EVENT                              │
│ │  └─ Remove event listing                   │
│ │                                            │
│ └─ VIEW BOOKINGS                             │
│    ├─ Bookings list for each event           │
│    ├─ Buyer details                          │
│    ├─ Payment status                         │
│    └─ Download transaction receipts          │
│                                              │
│ Event Listing Goes LIVE:                     │
│ ├─ Shows in /events (publicly)               │
│ ├─ Visible to all users                      │
│ ├─ Users can browse & book tickets           │
│ └─ Admin can see in analytics                │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 3.2 Play Category Approval Workflow (Sports & Venues)

```
PLAY VENUE OPERATOR VERIFICATION FLOW (Admin Perspective)

Similar to Events, but with Play-specific fields:

Step 1: Operator Submits Verification Request
┌──────────────────────────────────────────────┐
│ Play-Specific Submitted Data:                │
│ ├─ Email: operator@sports.com                │
│ ├─ PAN Card: XYZZZ9999F                      │
│ ├─ Category: PLAY (Sports & Venues)          │
│ ├─ Venue Details:                            │
│ │   ├─ Venue Name                            │
│ │   ├─ Venue Type (Indoor/Outdoor/Both)      │
│ │   ├─ Sports Available (Cricket, Badminton.)│
│ │   ├─ Capacity                              │
│ │   ├─ Operating Hours                       │
│ │   └─ Location with GPS coordinates         │
│ ├─ Documents:                                │
│ │   ├─ PAN Card (both sides)                 │
│ │   ├─ ID Proof                              │
│ │   ├─ Venue Registration Certificate        │
│ │   ├─ Safety Compliance Certificate         │
│ │   ├─ Insurance Cover                       │
│ │   └─ Bank Details                          │
│ └─ Venue Photos:                             │
│     ├─ Venue exterior                        │
│     ├─ Playing area                          │
│     ├─ Facilities                            │
│     └─ Equipment                             │
└──────────────────────────────────────────────┘
         ↓
    ADMIN RECEIVES
         ↓

Step 2: Admin Reviews Play-Specific Requirements
┌──────────────────────────────────────────────┐
│ ADMIN SCREENS:                               │
│                                              │
│ 2.1 PAN & Document Verification              │
│   ├─ Same as Events workflow                 │
│   ├─ Check: PAN not already used             │
│   ├─ Check: Email not linked to another PAN  │
│   └─ Check: All documents valid              │
│                                              │
│ 2.2 Venue-Specific Verification              │
│   ├─ Venue Registration                      │
│   │   ├─ Check: Valid registration           │
│   │   ├─ Check: Venue name matches           │
│   │   └─ Check: Property ownership proof     │
│   ├─ Safety Compliance                       │
│   │   ├─ Check: Fire safety certificate      │
│   │   ├─ Check: Building structural safety   │
│   │   └─ Check: Health & hygiene             │
│   ├─ Insurance                               │
│   │   ├─ Check: Active insurance cover       │
│   │   ├─ Check: Minimum coverage amount      │
│   │   └─ Check: Covers sports activities     │
│   └─ Location Verification                   │
│       ├─ Check: GPS coordinates valid        │
│       └─ Check: Not in restricted area       │
│                                              │
│ 2.3 Venue Photos Review                      │
│   ├─ Visual inspection of venue              │
│   ├─ Check: Equipment & facilities match     │
│   ├─ Check: No safety concerns visible       │
│   └─ Check: Standard cleanliness             │
│                                              │
└──────────────────────────────────────────────┘
         ↓

Step 3: Admin Decision (APPROVE / REJECT)
├─ Same approval/rejection process as Events
├─ Categories become VERIFIED for Play
├─ Venue listing goes LIVE in /play section
└─ Users can now book time slots

Step 4: Operator Manages Venue & Bookings
┌──────────────────────────────────────────────┐
│ Once APPROVED:                               │
│                                              │
│ Operator Dashboard:                          │
│ /organizer-dashboard?category=play           │
│                                              │
│ Available Actions:                           │
│ ├─ MANAGE VENUE DETAILS                      │
│ │  ├─ Update venue info                      │
│ │  ├─ Update photos                          │
│ │  ├─ Update operating hours                 │
│ │  └─ Update sports available                │
│ │                                            │
│ ├─ SET PRICING & AVAILABILITY                │
│ │  ├─ Time slot pricing                      │
│ │  ├─ Available slots per day                │
│ │  ├─ Blackout dates                         │
│ │  └─ Peak vs off-peak rates                 │
│ │                                            │
│ ├─ MANAGE BOOKINGS                           │
│ │  ├─ View all slot bookings                 │
│ │  ├─ Confirm/cancel bookings                │
│ │  └─ View payment details                   │
│ │                                            │
│ └─ VIEW ANALYTICS                            │
│     ├─ Occupancy rates                       │
│     ├─ Revenue reports                       │
│     └─ Popular time slots                    │
│                                              │
│ User Booking Flow:                           │
│ ├─ Users see venue in /play                  │
│ ├─ Browse available time slots               │
│ ├─ Select date & time                        │
│ ├─ Confirm booking & pay                     │
│ └─ Get booking confirmation                  │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 3.3 Dining Category Approval Workflow (Restaurants)

```
RESTAURANT PARTNER VERIFICATION FLOW (Admin Perspective)

Step 1: Partner Submits Verification Request
┌──────────────────────────────────────────────┐
│ Dining-Specific Submitted Data:              │
│ ├─ Email: partner@restaurant.com             │
│ ├─ PAN Card: PQRST5555F                      │
│ ├─ Category: DINING (Restaurants)            │
│ ├─ Restaurant Details:                       │
│ │   ├─ Restaurant Name                       │
│ │   ├─ Cuisine Types (Multi-select)          │
│ │   ├─ Seating Capacity                      │
│ │   ├─ Average Cost for 2 persons            │
│ │   ├─ Operating Hours                       │
│ │   ├─ Location & GPS coordinates            │
│ │   └─ Parking & Facilities                  │
│ ├─ Documents:                                │
│ │   ├─ PAN Card (both sides)                 │
│ │   ├─ ID Proof                              │
│ │   ├─ Food License (FSSAI)                  │
│ │   ├─ Health Department Certificate         │
│ │   ├─ GST Registration                      │
│ │   ├─ Insurance Certificate                 │
│ │   └─ Bank Details                          │
│ ├─ Menu Details:                             │
│ │   ├─ Cuisine categories                    │
│ │   ├─ Vegetarian/Non-vegetarian options    │
│ │   └─ Dietary preferences supported         │
│ └─ Restaurant Photos:                        │
│     ├─ Exterior/storefront                   │
│     ├─ Dining area interiors                 │
│     ├─ Kitchen (if permitted)                │
│     └─ Sample food photos                    │
└──────────────────────────────────────────────┘
         ↓
    ADMIN RECEIVES
         ↓

Step 2: Admin Reviews Dining-Specific Requirements
┌──────────────────────────────────────────────┐
│ ADMIN SCREENS:                               │
│                                              │
│ 2.1 PAN & Basic Documents                    │
│   ├─ Same PAN validation as Events/Play      │
│   ├─ Verify ID and address proof             │
│   └─ Check bank details                      │
│                                              │
│ 2.2 Food Safety & Licensing                  │
│   ├─ FSSAI License Verification              │
│   │   ├─ Check: License is ACTIVE            │
│   │   ├─ Check: License not expired          │
│   │   ├─ Check: Restaurant name matches      │
│   │   └─ Check: Hygiene standards met        │
│   ├─ Health Department Certificate           │
│   │   ├─ Check: Valid & recent (< 2 yrs)    │
│   │   └─ Check: No major violations          │
│   └─ GST Registration                        │
│       ├─ Check: Valid GST number             │
│       └─ Check: Restaurant name matches      │
│                                              │
│ 2.3 Insurance & Safety                       │
│   ├─ Insurance Cover                         │
│   │   ├─ Check: Active policy                │
│   │   ├─ Check: Covers food service          │
│   │   └─ Check: Adequate coverage amount     │
│   └─ Safety Compliance                       │
│       ├─ Check: Fire safety certificate      │
│       ├─ Check: No health violations record  │
│       └─ Check: Proper equipment             │
│                                              │
│ 2.4 Restaurant Details Verification          │
│   ├─ Location Check                          │
│   │   ├─ GPS coordinates valid?              │
│   │   └─ Not in restricted zones?            │
│   ├─ Capacity Check                          │
│   │   └─ Reasonable seating capacity?        │
│   └─ Cuisine Check                           │
│       └─ Matches FSSAI license category?     │
│                                              │
│ 2.5 Photo Review                             │
│   ├─ Visual inspection of restaurant         │
│   ├─ Check: Cleanliness & hygiene            │
│   ├─ Check: Ambiance matches claims          │
│   └─ Check: Professional quality             │
│                                              │
└──────────────────────────────────────────────┘
         ↓

Step 3: Admin Decision (APPROVE / REJECT)
├─ Same approval/rejection process as Events/Play
├─ Restaurant listing goes LIVE in /dining section
└─ Users can now browse menus & make reservations

Step 4: Restaurant Partner Manages Listings
┌──────────────────────────────────────────────┐
│ Once APPROVED:                               │
│                                              │
│ Partner Dashboard:                           │
│ /organizer-dashboard?category=dining         │
│                                              │
│ Available Actions:                           │
│ ├─ MANAGE RESTAURANT INFO                    │
│ │  ├─ Update restaurant details              │
│ │  ├─ Update photos                          │
│ │  ├─ Update cuisine types                   │
│ │  ├─ Update operating hours                 │
│ │  └─ Update facilities                      │
│ │                                            │
│ ├─ MANAGE MENU                               │
│ │  ├─ Add/edit menu items                    │
│ │  ├─ Set prices                             │
│ │  ├─ Upload dish photos                     │
│ │  ├─ Mark vegetarian/vegan items            │
│ │  ├─ Add dietary restriction tags           │
│ │  └─ Manage menu availability                │
│ │                                            │
│ ├─ MANAGE RESERVATIONS                       │
│ │  ├─ Set table availability                 │
│ │  ├─ View reservation requests               │
│ │  ├─ Confirm/cancel reservations            │
│ │  ├─ Send special offers                    │
│ │  └─ Handle walk-in bookings                │
│ │                                            │
│ ├─ SPECIAL OFFERS                            │
│ │  ├─ Create promotional offers              │
│ │  ├─ Happy hour pricing                     │
│ │  ├─ Group discounts                        │
│ │  └─ Combo deals                            │
│ │                                            │
│ └─ VIEW ANALYTICS                            │
│     ├─ Reservation trends                    │
│     ├─ Revenue reports                       │
│     ├─ Popular dishes                        │
│     └─ Customer ratings                      │
│                                              │
│ User Booking Flow:                           │
│ ├─ Users browse restaurants in /dining       │
│ ├─ View reviews & ratings                    │
│ ├─ Browse menu & dishes                      │
│ ├─ Select date/time & party size             │
│ ├─ Confirm reservation & pay                 │
│ └─ Get confirmation & directions             │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Phase 4: User Impact & Visibility

### 4.1 How Admin Decisions Affect User Experience

```
BEFORE ORGANIZER APPROVAL:

User Browsing /events Page:
├─ Can see ALL APPROVED events
├─ Cannot see unverified/rejected organizers' listings
├─ Only shows listings from VERIFIED organizers
└─ User confidence: "Only trusted organizers here"

User Browsing /play Page:
├─ Can see ALL APPROVED venues
├─ Cannot see unverified/rejected venue listings
├─ Only shows listings from VERIFIED operators
└─ User confidence: "All venues are safe & compliant"

User Browsing /dining Page:
├─ Can see ALL APPROVED restaurants
├─ Cannot see unverified/rejected restaurant listings
├─ Only shows listings from VERIFIED partners
└─ User confidence: "All restaurants are licensed & safe"

---

AFTER ORGANIZER APPROVAL:

Approved Organizer's Listing:
👤 Organizer "John Events"
├─ Email: john@events.com
├─ ✅ VERIFIED ORGANIZER (by admin)
│
├─ Event: "Annual Festival 2024"
│   ├─ Date: Feb 28, 2024
│   ├─ Venue: City Convention Center
│   ├─ Tickets: ₹500 - ₹2000
│   ├─ Bookings: 450/500 sold
│   └─ Rating: 4.8★ (Based on previous events)
│
├─ Event: "Corporate Workshop"
│   ├─ Date: Mar 5, 2024
│   ├─ Capacity: 200 people
│   ├─ Tickets: ₹1000 each
│   └─ Bookings: 120 confirmed

Rejected Organizer's Listing:
❌ NOT VISIBLE TO USERS

Reason: Pending verification (PAN not yet verified)
- Cannot list events
- Cannot accept bookings until verified
- Organizer gets notification with rejection reason
```

---

### 4.2 Admin Monitoring of Live Listings

```
/admin → Categories → Events → Active Listings

┌──────────────────────────────────────────────┐
│ EVENTS - ACTIVE LISTINGS (Admin View)       │
├──────────────────────────────────────────────┤
│                                              │
│ Filter By:                                   │
│ ├─ Organizer Status (Verified/Pending)       │
│ ├─ Date Range                                │
│ ├─ Location                                  │
│ ├─ Status (Active/Draft/Completed)           │
│ └─ Bookings (High/Medium/Low)                │
│                                              │
│ LISTING 1:                                   │
│ ├─ Event: "Annual Festival"                  │
│ ├─ Organizer: John Events (Verified ✅)     │
│ ├─ Date: Feb 28, 2024                       │
│ ├─ Status: ACTIVE                            │
│ ├─ Bookings: 450/500                         │
│ ├─ Revenue: ₹10,00,000 collected            │
│ ├─ Admin Actions:                            │
│ │   ├─ FLAG (if concern)                     │
│ │   ├─ SUSPEND (if violation)                │
│ │   ├─ DELETE (if fraudulent)                │
│ │   └─ VIEW BOOKINGS                         │
│ └─ Analytics:                                │
│     ├─ View per-ticket breakdown             │
│     ├─ View buyer demographics               │
│     └─ Generate transaction report           │
│                                              │
│ LISTING 2:                                   │
│ ├─ Event: "Corporate Workshop"               │
│ ├─ Organizer: Jane Events (Verified ✅)     │
│ ├─ Date: Mar 5, 2024                         │
│ ├─ Status: ACTIVE                            │
│ ├─ Bookings: 120/200                         │
│ ├─ Revenue: ₹1,20,000 collected             │
│ └─ [Similar admin actions available]        │
│                                              │
└──────────────────────────────────────────────┘
```

---

### 4.3 Relationship Between Admin Actions & User Visibility

```
DECISION TREE: Admin Action → User Impact

┌─────────────────────────────────────────────────────────┐
│ ORGANIZER APPLICATION SUBMITTED                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ STATUS: PENDING VERIFICATION                            │
│ ├─ Admin: Reviewing documents                           │
│ ├─ User (Organizer): Cannot list (awaiting approval)   │
│ ├─ Users (Customers): Don't see this organizer yet    │
│ └─ Platform: No listings visible                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
                      ↓
            ┌─────────┴─────────┐
            ↓                   ↓
    ✅ APPROVED         ❌ REJECTED
    │                 │
    ├─ Organizer can │ ├─ Organizer notified
    │ now list items │ │ with reason
    │                 │ ├─ No listings allowed yet
    ├─ New listings  │ ├─ Can resubmit with
    │ appear on site │ │ corrections
    │                 │ └─ Status: REJECTED
    ├─ Users see in  │
    │ search results │
    │                 │
    ├─ Start getting │
    │ bookings       │
    │                 │
    └─ Admin tracks  │
      in analytics   │


┌─────────────────────────────────────────────────────────┐
│ LIVE LISTING - ADMIN CAN SUSPEND/DELETE                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Reason: User complaint, safety concern, or violation   │
│                                                         │
│ Admin Action: SUSPEND LISTING                           │
│ ├─ Booking immediately stops                           │
│ ├─ Listing disappears from user view                   │
│ ├─ Organizer notified of suspension                    │
│ ├─ Customers with bookings get notification           │
│ ├─ Refund initiated if applicable                      │
│ └─ Organizer can appeal or fix issues                  │
│                                                         │
│ Admin Action: DELETE LISTING                            │
│ ├─ Permanent removal                                   │
│ ├─ Cannot be recovered                                 │
│ ├─ All bookings must be refunded                       │
│ ├─ Serious violations only                             │
│ └─ Legal action may follow                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 5: Admin-Side System Flows

### 5.1 Verification Request Priority Queue

```
/admin → Verification Center → Pending Requests

Task: Organize verification by priority

Priority Scoring:
├─ URGENT (High Priority tasks)
│   ├─ New organizers waiting > 7 days
│   ├─ Resubmissions after rejection
│   ├─ Applications with flagged documents
│   └─ VIP/bulk organizer applications
│
├─ NORMAL (Regular Priority)
│   ├─ New applications (0-7 days old)
│   ├─ Complete documentation
│   └─ Standard PAN verification
│
└─ BACKLOG (Lower Priority)
    ├─ Additional documents requested
    ├─ Waiting for organizer response
    └─ Pending clarification

Admin Features:
├─ Filter by priority
├─ Sort by submission date
├─ Search by organizer name/PAN
├─ Batch actions (approve multiple)
├─ Mark as flagged for investigation
└─ Assign to specific admin
```

---

### 5.2 Audit Trail & Compliance

```
/admin → Settings → Audit Logs

Every Admin Action is Logged:

┌──────────────────────────────────────────────┐
│ VERIFICATION APPROVAL LOG                     │
├──────────────────────────────────────────────┤
│                                              │
│ Timestamp: 2024-02-15 10:30:45 IST          │
│ Admin: Rajesh Kumar                          │
│ Action: APPROVED                             │
│ Organizer: John Events (john@events.com)     │
│ Category: Events                             │
│ PAN: ABCDE1234F                              │
│ Reason: All documents verified               │
│ Notes: PAN validation passed, ID proof valid │
│        FSSAI certificate verified, Insurance │
│        coverage confirmed                    │
│ IP Address: 192.168.1.100                    │
│ Status: VERIFIED                             │
│                                              │
│ ---                                          │
│                                              │
│ Timestamp: 2024-02-15 11:15:22 IST          │
│ Admin: Priya Sharma                          │
│ Action: REJECTED                             │
│ Organizer: Jane Dining (jane@dining.com)     │
│ Category: Dining                             │
│ PAN: PQRST5555F                              │
│ Reason: FSSAI License Expired                │
│ Notes: License expired on 2023-12-31, need   │
│        renewal certificate. Asked organizer │
│        to resubmit after renewal             │
│ IP Address: 192.168.1.101                    │
│ Status: REJECTED - AWAITING RESUBMISSION     │
│                                              │
│ ---                                          │
│                                              │
│ [More log entries...]                        │
│                                              │
└──────────────────────────────────────────────┘

Compliance Requirements:
├─ Every approval must have documented reason
├─ Every rejection must show reason & instructions
├─ Time taken to process visible
├─ Admin responsible for their actions
├─ Records kept for 7+ years for compliance
├─ Exportable for audits
└─ Any changes flagged with timestamp
```

---

## Implementation Checklist

### Admin Backend Requirements
- [ ] Create `/admin` route with admin-only middleware
- [ ] Create Verification Center (GET /admin/verifications)
- [ ] Implement approval endpoint (POST /admin/verifications/:id/approve)
- [ ] Implement rejection endpoint (POST /admin/verifications/:id/reject)
- [ ] Create audit log system (POST /admin/audit-logs)
- [ ] Add category management endpoints
- [ ] Add user management endpoints
- [ ] Add booking management endpoints
- [ ] Add analytics endpoints (revenue, statistics, performance)

### Admin Frontend Requirements
- [ ] Create `/admin/dashboard` page
- [ ] Create Verification Center UI
- [ ] Create approval/rejection screens (per category)
- [ ] Create admin sidebar navigation
- [ ] Add category management pages
- [ ] Add user search & filter
- [ ] Add booking management interface
- [ ] Add analytics dashboard with charts
- [ ] Add audit log viewer
- [ ] Admin authentication & role checks

### Database Schema Updates
- [ ] Add `categories_verified` to User model
- [ ] Track verification status per category
- [ ] Store `pan_card` and `pan_verified` fields
- [ ] Create `VerificationRequest` model
- [ ] Create `AuditLog` model for compliance
- [ ] Add timestamp fields for tracking

### Validation & Security
- [ ] **ONE EMAIL = ONE PAN** validation (backend)
- [ ] **ONE PAN = ONE EMAIL** validation (backend)
- [ ] PAN format validation (backend)
- [ ] Document validity checks (backend)
- [ ] Admin-only access to verification endpoints
- [ ] Audit trail for all admin actions
- [ ] Document expiry checks & reminders

### Testing
- [ ] Test all approval/rejection flows
- [ ] Test duplicate PAN detection
- [ ] Test duplicate email detection
- [ ] Test category verification status
- [ ] Test user visibility changes
- [ ] Test audit logging
- [ ] Test admin access control

---

## Summary

This documentation covers the complete **ADMIN FLOW** in Ticpin:

### Key Responsibilities:
1. **Verify Organizers** - Review documents, validate PAN, approve/reject
2. **Manage Categories** - Oversee events, play venues, restaurants
3. **Monitor Listings** - Track active listings, handle violations
4. **Process Bookings** - Monitor transactions, handle disputes
5. **Analytics** - Track platform performance & revenue

### Key Rules:
- ✓ **ONE EMAIL = ONE PAN** (Email cannot use multiple PANs)
- ✓ **ONE PAN = ONE EMAIL** (PAN cannot be shared across emails)
- ✓ Each category verified independently (same email, same PAN)
- ✓ All admin actions audit-logged for compliance
- ✓ Organizers hidden from users until verified
- ✓ Verified organizers visible in category pages

### Impact on Users:
- Users see ONLY verified organizers' listings
- Rejected organizers disappear (cannot list)
- Admin can suspend/delete violating listings
- Audit trail for all platform decisions
