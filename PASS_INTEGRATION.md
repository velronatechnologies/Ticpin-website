# Ticpin Pass Integration Guide

## Overview
Ticpin Pass is a premium membership system integrated across Events, Play, and Dining with automated benefits application, renewal logic, and comprehensive dashboard.

## Features Implemented

### 1. **Pass Purchase Flow** (`/ticpin-pass`)
- **Step 1: Benefits Showcase** - Display all 3 benefits (free turf, discount, validity)
- **Step 2: User Details Form** - Collect name, phone, address, state, district, country
- **Step 3: Payment Confirmation** - Mock UPI payment with 2-second processing
- **Step 4: Confirmation** - Show pass ID, validity dates, next actions
- Firebase Storage: Stores in `ticpin_pass_users` collection
- Pricing: ₹999 → ₹849 (15% early bird discount)

### 2. **Pass Dashboard** (`/pass-dashboard`)
- **Status Cards**: Pass status, expiry date, active discount percentage
- **Free Turf Bookings Tracker**: Shows X/2 used with visual progress bar
- **Discount Savings Calculator**: Shows potential savings by category
- **Renewal Button**: Direct renewal with mock confirmation
- **Pass Information**: Purchase date, validity period, status
- Auto-refresh on renewal

### 3. **Pass Benefits Integration**

#### A. **PassBenefitsCard Component** (`/components/booking/PassBenefitsCard.tsx`)
Applied at checkout billing page for all booking types.

**Features:**
- Detects active pass automatically
- Shows two benefit options:
  1. **Free Turf Booking** (Play only): Uses free booking, amount becomes ₹0
  2. **15% Discount**: Reduces amount by discount percentage
- User can toggle between benefits or change selection
- Displays savings amount and final price
- Responsive design for mobile/desktop

**Usage:**
```tsx
<PassBenefitsCard
    email={userEmail}
    bookingType="play" // 'event' | 'play' | 'dining'
    totalAmount={amount}
    onDiscountApply={(finalAmount, isFreeBooking) => {
        // Handle applied benefit
        setFinalAmount(finalAmount);
    }}
/>
```

#### B. **PassStatusBanner Component** (`/components/booking/PassStatusBanner.tsx`)
Display pass status on event/play/dining listing pages.

**Features:**
- Shows active pass indicator
- Displays remaining free bookings (play only)
- Shows discount percentage and days remaining
- Encourages users to apply benefits at checkout

**Usage:**
```tsx
<PassStatusBanner 
    email={userEmail}
    bookingType="play"
/>
```

### 4. **Pass Utilities** (`/lib/passUtils.ts`)

| Function | Purpose |
|----------|---------|
| `getUserPass(email)` | Fetch active/expired pass by email |
| `hasActivePass(email)` | Quick boolean check for active pass |
| `canUseFreeBooking(email)` | Check if free booking still available |
| `getRemainingFreeTurfBookings(email)` | Get count of remaining free bookings |
| `useFreeBooking(passId)` | Deduct one free booking (backend updates) |
| `getUserDiscount(email)` | Get discount % (15 or 0) |
| `calculateDiscountedPrice(price, %)` | Calculate final price |
| `applyPassDiscount(email, price)` | Apply discount and return final amount |
| `getPassRemainingDays(expiryDate)` | Days until expiry |
| `shouldShowRenewalReminder(expiryDate)` | Alert if <7 days remaining |
| `renewPass(email, userId)` | Create new pass record, reset free bookings |
| `applyPassBenefit(email, item)` | Unified benefit application with details |

### 5. **Checkout Integration** (`/checkout/[type]/billing/page.tsx`)

**Updates:**
- Added PassBenefitsCard import and display
- Track `finalAmount` and `appliedBenefit` state
- Show benefit badge in order summary
- Send `pass_benefit_applied` and `discount_amount` to backend
- Disable benefit selection with email field validation

**Booking Payload Enhancement:**
```json
{
  "price": 700,
  "original_price": 1000,
  "pass_benefit_applied": "discount",
  "discount_amount": 300
}
```

### 6. **Profile Integration** (`/components/modals/auth/views/ProfileView.tsx`)
- Added "Ticpin Pass" link in user profile menu
- Directs to `/pass-dashboard`
- Shows alongside bookings, chat, terms, logout

### 7. **Pass Purchase Confirmation** (`/app/ticpin-pass/page.tsx`)
- Added "View Dashboard" button after purchase
- Links new users to their pass dashboard
- Shows pass benefits and next actions
- Supports immediate booking of free turf slot

## Data Flow

### Purchase Flow
1. User clicks "Get Ticpin Pass" on home page
2. AuthModal opens if not logged in
3. 4-step purchase process:
   - Benefits overview
   - Personal details collection
   - Payment confirmation (mock)
   - Purchase success confirmation
4. Pass stored in Firebase `ticpin_pass_users` collection
5. Redirect to dashboard with pass details

### Checkout Flow
1. User selects event/play/dining item
2. At billing page, PassBenefitsCard appears (if active pass exists)
3. User selects benefit: free booking OR discount
4. Final amount updated in order summary
5. Booking submitted with benefit metadata
6. Backend processes booking with discount/free status

### Renewal Flow
1. User clicks "Renew Pass" on dashboard
2. Redirect to `/ticpin-pass` (could be new purchase flow)
3. New pass record created with reset free bookings counter
4. Validity extends 3 months from renewal date
5. Dashboard refreshes with new expiry date

## Firebase Schema

### Collection: `ticpin_pass_users`
```
{
  id: string (auto-generated)
  email: string
  userId: string
  name: string
  phone: string
  address: string
  state: string
  district: string
  country: string
  purchaseDate: timestamp
  expiryDate: timestamp
  freeTurfBookings: 2
  usedTurfBookings: number (0-2)
  discountPercentage: 15
  status: 'active' | 'expired' | 'cancelled'
  renewalCount: number (optional)
  paymentStatus: 'confirmed' | 'pending'
  paymentMethod: 'mock_upi' | (future: 'razorpay', 'stripe')
  createdAt: timestamp
  updatedAt: timestamp
}
```

## User Types & Pass Availability

| User Type | Can Have Pass | Free Bookings | Discount | Renewal |
|-----------|--------------|---------------|----------|---------|
| Guest (non-logged-in) | ❌ | N/A | N/A | N/A |
| Normal User | ✅ | ✅ (Play) | ✅ (All) | ✅ |
| Organizer | ✅ | ✅ (Play) | ✅ (All) | ✅ |
| Admin | ✅ | ✅ (Play) | ✅ (All) | ✅ |

## Pass Benefits by Category

### Play (Turf Booking)
- **Benefit 1**: 2 free turf bookings (resets on renewal)
- **Benefit 2**: 15% discount on all bookings
- Default: Free booking if available, else 15% discount

### Events (Ticket Purchase)
- **Benefit**: 15% discount on all event tickets
- Final price applied at checkout

### Dining (Restaurant Booking)
- **Benefit**: 15% discount on total bill
- Final price applied at checkout

## Integration Checklist

- ✅ Pass purchase landing page (4-step flow)
- ✅ Payment confirmation (mock UPI)
- ✅ Firebase storage & retrieval
- ✅ Pass dashboard with status/benefits tracking
- ✅ Renewal functionality
- ✅ PassBenefitsCard component (all checkout types)
- ✅ PassStatusBanner component (listing pages)
- ✅ Profile menu integration
- ✅ PassUtils library (11 functions)
- ✅ Checkout billing page integration
- ⏳ Payment gateway (Razorpay/Stripe) - future
- ⏳ Email notifications - future
- ⏳ Analytics/usage tracking - future

## Next Steps

1. **Payment Gateway** (HIGH PRIORITY)
   - Replace mock UPI with Razorpay/Stripe
   - Payment verification before Firebase storage
   - Receipt generation and email

2. **Booking Flow Updates** (HIGH PRIORITY)
   - Deduct free booking in backend after confirmation
   - Update `usedTurfBookings` counter
   - Send confirmation email with pass details

3. **Email Notifications**
   - Purchase confirmation
   - Renewal reminders (<7 days)
   - Expiry notifications
   - Booking confirmations with pass benefits applied

4. **Analytics**
   - Track pass conversions
   - Monitor benefit usage
   - Renewal rate analysis
   - Discount impact on revenue

5. **Mobile App Integration**
   - PassBenefitsCard in mobile checkout
   - PassStatusBanner in mobile listings
   - One-click pass purchase

## API Endpoints (Backend)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/passes/:email` | GET | Fetch user's active pass |
| `/api/passes/:passId/renew` | POST | Renew expired pass |
| `/api/passes/:passId/use-booking` | PUT | Deduct free booking |
| `/api/passes/:email/status` | GET | Check pass validity |
| `/bookings` | POST | Create booking (now includes `pass_benefit_applied`) |

## Testing Checklist

- [ ] Purchase pass (test all 4 steps)
- [ ] View pass dashboard
- [ ] Verify free booking availability
- [ ] Test discount application at checkout
- [ ] Test renewal with reset bookings
- [ ] Verify email is pre-filled
- [ ] Check profile menu shows pass link
- [ ] Test on mobile & desktop
- [ ] Verify Firebase data structure
- [ ] Test expired pass show "No Active Pass"

