# TICPIN ORGANIZER FLOW - COMPLETE DOCUMENTATION

## Table of Contents
1. [Phase 1: Footer Links Interaction](#phase-1-footer-links-interaction)
2. [Phase 2: Key Validation Rules](#phase-2-key-validation-rules)
3. [Implementation checklist](#implementation-checklist)

---

## Phase 1: Footer Links Interaction

### Overview
When users click organizer-related links in the footer, the system performs verification checks before allowing access to organizer tools.

---

### 1.1 When "List your events" (footer) is clicked:

```
"List your events" button clicked
    ↓
Check user login status:
    ├─ NOT LOGGED IN (guest)
    │   └─ Show Auth Modal (email login only)
    │       └─ Hide: Phone login option
    │       └─ Show: Email/Password + Email OTP options
    │       └─ Once logged in → Redirect to event verification
    │
    ├─ LOGGED IN AS NORMAL USER (phone)
    │   └─ Show Auth Modal (email login only)
    │       └─ This upgrades them to ORGANIZER role
    │       └─ Hide: Phone login option
    │       └─ Show: Email/Password + Email OTP options
    │       └─ Once logged in as organizer → Redirect to event verification
    │
    └─ LOGGED IN AS ORGANIZER (email)
        └─ Check Event verification status in user profile
            ├─ VERIFIED ✓
            │   └─ Redirect → /organizer-dashboard?category=events
            │       └─ Show: Create Event | Edit Event | View Events
            │       └─ Full CRUD functionality enabled
            │
            └─ NOT VERIFIED ✗
                └─ Redirect → /organizer-onboarding?category=events
                    └─ Show "Start Your Journey - Events"
                    └─ Required: Setup PAN Card & Documents
                    └─ Once verified → Auto redirect to dashboard
                    └─ URL: /organizer-onboarding?category=events
```

---

### 1.2 When "List your play" (footer) is clicked:

```
"List your play" button clicked
    ↓
Check user login status:
    ├─ NOT LOGGED IN (guest)
    │   └─ Show Auth Modal (email login only)
    │       └─ Hide: Phone login option
    │       └─ Show: Email/Password + Email OTP options
    │       └─ Once logged in → Redirect to play verification
    │
    ├─ LOGGED IN AS NORMAL USER (phone)
    │   └─ Show Auth Modal (email login only)
    │       └─ This upgrades them to ORGANIZER role
    │       └─ Hide: Phone login option
    │       └─ Show: Email/Password + Email OTP options
    │       └─ Once logged in as organizer → Redirect to play verification
    │
    └─ LOGGED IN AS ORGANIZER (email)
        └─ Check Play verification status in user profile
            ├─ VERIFIED ✓
            │   └─ Redirect → /organizer-dashboard?category=play
            │       └─ Show: Create Play | Edit Play | View Play
            │       └─ Full CRUD functionality enabled
            │
            └─ NOT VERIFIED ✗
                └─ Redirect → /organizer-onboarding?category=play
                    └─ Show "Start Your Journey - Play"
                    └─ Required: Setup PAN Card & Documents
                    └─ Venue/Sports-specific requirements
                    └─ Once verified → Auto redirect to dashboard
                    └─ URL: /organizer-onboarding?category=play
```

---

### 1.3 When "List your dining" (footer) is clicked:

```
"List your dining" button clicked
    ↓
Check user login status:
    ├─ NOT LOGGED IN (guest)
    │   └─ Show Auth Modal (email login only)
    │       └─ Hide: Phone login option
    │       └─ Show: Email/Password + Email OTP options
    │       └─ Once logged in → Redirect to dining verification
    │
    ├─ LOGGED IN AS NORMAL USER (phone)
    │   └─ Show Auth Modal (email login only)
    │       └─ This upgrades them to ORGANIZER role
    │       └─ Hide: Phone login option
    │       └─ Show: Email/Password + Email OTP options
    │       └─ Once logged in as organizer → Redirect to dining verification
    │
    └─ LOGGED IN AS ORGANIZER (email)
        └─ Check Dining verification status in user profile
            ├─ VERIFIED ✓
            │   └─ Redirect → /organizer-dashboard?category=dining
            │       └─ Show: Create Dining | Edit Dining | View Dining
            │       └─ Full CRUD functionality enabled
            │       └─ Restaurant-specific features
            │
            └─ NOT VERIFIED ✗
                └─ Redirect → /organizer-onboarding?category=dining
                    └─ Show "Start Your Journey - Dining"
                    └─ Required: Setup PAN Card & Documents
                    └─ Restaurant/Menu-specific requirements
                    └─ Once verified → Auto redirect to dashboard
                    └─ URL: /organizer-onboarding?category=dining
```

---

## Phase 2: Key Validation Rules

### 2.1 User Type Routing Rules

#### **NORMAL USER (Phone Login Only)**
```
Characteristics:
├─ Login method: Phone number only (no email)
├─ Token: Issued from phone OTP verification
└─ Role flags: 
    ├─ is_admin: false
    ├─ is_organizer: false
    └─ organizer_category: null

VISIBILITY:
├─ ✓ CAN see: "List your events" (footer)
├─ ✓ CAN see: "List your play" (footer)
├─ ✓ CAN see: "List your dining" (footer)
│   └─ Reason: Can click to become organizer
├─ ✗ CANNOT see: "Sign with Phone" option in auth modal (after clicking footer)
├─ ✓ CAN see: Email/Password option in auth modal
├─ ✓ CAN see: Email OTP option in auth modal
├─ ✓ CAN see: Event listings (for booking)
├─ ✓ CAN see: Play venues (for booking)
├─ ✓ CAN see: Dining restaurants (for booking)
└─ ✓ CAN see: Booking history

FUNCTIONALITY:
└─ Can ONLY BOOK (no create/edit/delete)
└─ Can UPGRADE to organizer by logging in with email

FOOTER LINK BEHAVIOR:
├─ When clicks "List your events"/play/dining
├─ Show email auth modal (hide phone option)
├─ Login with email to become organizer
└─ Then proceed with verification check

AUTO-REDIRECT:
└─ After phone login → /play (home page)
└─ After email login (as organizer) → Dashboard/Onboarding based on category
```

---

#### **ADMIN USER**
```
Characteristics:
├─ Login method: Phone 0000000000 + OTP 123456
├─ Username: admin
└─ Role flags:
    ├─ is_admin: true
    ├─ is_organizer: false
    └─ organizer_category: null

VISIBILITY:
├─ ✓ CAN see: Admin panel
├─ ✓ CAN see: All users/vendors
├─ ✓ CAN see: System settings
└─ ✗ CANNOT see: Footer organizer links

FUNCTIONALITY:
├─ Full system access
├─ User management
├─ Vendor management
└─ Platform analytics

AUTO-REDIRECT:
└─ After login → /admin

VERIFICATION:
└─ No verification needed (already admin)
```

---

#### **ORGANIZER USER (Email Login)**
```
Characteristics:
├─ Login method: Email + Password OR Email OTP
├─ Has: Email + PAN Card combination
└─ Role flags:
    ├─ is_admin: false
    ├─ is_organizer: true
    └─ organizer_category: [play/events/dining]

VISIBILITY:
├─ ✓ CAN see: "List your events" (footer)
├─ ✓ CAN see: "List your play" (footer)
├─ ✓ CAN see: "List your dining" (footer)
├─ ✗ CANNOT see: Phone login option
├─ ✓ CAN see: Email/Password login
└─ ✓ CAN see: Email OTP login

FUNCTIONALITY:
├─ Can be verified in 1+ category
├─ Each category verified independently
└─ Full CRUD for verified categories

AUTO-REDIRECT:
└─ After login → /play (home page)
   OR → /organizer-onboarding?category=X (if footer link clicked and not verified)
   OR → /organizer-dashboard?category=X (if footer link clicked and verified)
```

---

### 2.2 Email & PAN Validation Rules

#### **Same Email - Multiple Categories (ALLOWED)**
```
Example Scenario:
    Email: organizer@test.com
    PAN: ABCDE1234F (ONE AND ONLY PAN for this email)
    
    Possible Status:
    ├─ Play: VERIFIED ✓ (with ABCDE1234F)
    ├─ Events: VERIFIED ✓ (with ABCDE1234F)
    ├─ Dining: VERIFIED ✓ (with ABCDE1234F)
    
    Outcome:
    ├─ Click "List your play" → Dashboard (verified)
    ├─ Click "List your events" → Dashboard (verified)
    └─ Click "List your dining" → Dashboard (verified)

Rule:
└─ Same email + same PAN = Can verify MULTIPLE categories ✓
```

---

#### **Same Email - Different PAN (NOT ALLOWED)**
```
Example Scenario (NOT ALLOWED):
    Account A:
    ├─ Email: organizer@test.com
    ├─ PAN: ABCDE1234F (first PAN)
    └─ Verified for: Events ✓

    Trying to verify same email with DIFFERENT PAN:
    ├─ Same email: organizer@test.com
    ├─ Different PAN: XYZZZ9999F (second PAN)
    └─ For category: Dining

Result: ✗ REJECTED
Reason: Email organizer@test.com is already linked to PAN ABCDE1234F
        Cannot use same email with different PAN
        One Email = One PAN (always)
```

---

#### **Different Email - Same PAN (NOT ALLOWED)**
```
Example Scenario (NOT ALLOWED):
    Account 1:
    ├─ Email: organizer1@test.com
    ├─ PAN: ABCDE1234F
    └─ Verified for: Play ✓

    Account 2 (Trying to use same PAN):
    ├─ Email: organizer2@test.com
    ├─ PAN: ABCDE1234F (SAME PAN)
    └─ For category: Dining

Result: ✗ REJECTED
Reason: PAN ABCDE1234F already linked to email organizer1@test.com
        Cannot use same PAN with different email
        One PAN = One Email (always)
```

---

### 2.3 Verification Status Storage

```
User Profile Structure:
{
  id: "user123",
  email: "organizer@test.com",
  name: "John Organizer",
  phone: "9876543210",
  is_organizer: true,
  is_admin: false,
  pan_card: "ABCDE1234F",
  
  // Verification Status (per category)
  categories_verified: {
    play: {
      verified: true,
      verified_at: "2024-01-15T10:30:00Z",
      pan_used: "ABCDE1234F",
      documents: ["doc1.pdf", "doc2.pdf"]
    },
    events: {
      verified: false,
      verified_at: null,
      pan_used: null,
      documents: []
    },
    dining: {
      verified: true,
      verified_at: "2024-01-20T14:45:00Z",
      pan_used: "ABCDE1234F",
      documents: ["doc3.pdf"]
    }
  },
  
  organizer_category: "play" // Primary category
}
```

---

### 2.4 Footer Visibility Logic

```javascript
// Pseudo-code for footer links visibility

const FooterLinks = ({ user }) => {
  // Show organizer links to EVERYONE because:
  // 1. Guests can click to become organizers
  // 2. Normal users (phone login) can become organizers (email login)
  // 3. Organizers can manage their categories
  // 4. Only HIDE from admin users
  
  if (user.isAdmin) {
    return null; // Admins don't see organizer links
  }
  
  // Show to EVERYONE ELSE (guests + normal users + organizers)
  return (
    <>
      <button onClick={() => handleCategoryClick('events')}>
        List Your Events
      </button>
      <button onClick={() => handleCategoryClick('play')}>
        List Your Play
      </button>
      <button onClick={() => handleCategoryClick('dining')}>
        List Your Dining
      </button>
    </>
  );
};

// When footer link is clicked, trigger the appropriate flow:
const handleCategoryClick = (category) => {
  if (!user.isLoggedIn) {
    // NOT LOGGED IN - Show email auth modal
    showEmailAuthModal();
  } else if (user.isOrganizer) {
    // ALREADY LOGGED IN AS ORGANIZER
    // Check verification status for that category
    checkVerificationAndNavigate(category);
  } else {
    // NORMAL USER (phone login) - needs to login with email to become organizer
    showEmailAuthModal();
  }
};
```

---

### 2.5 Auth Modal Login Options

```
Auth Modal Display Logic:

SCENARIO 1: Default Auth Modal (homepage or login button)
    └─ Show BOTH options:
        ├─ Phone Login (for normal users/booking)
        └─ Email Login (for organizers)

SCENARIO 2: Footer "List your X" clicked by GUEST (not logged in)
    └─ Show ONLY email login:
        ├─ Hide: Phone login option
        ├─ Show: Email/Password login
        └─ Show: Email OTP login

SCENARIO 3: Footer "List your X" clicked by NORMAL USER (phone login)
    └─ Show ONLY email login:
        ├─ This allows them to UPGRADE to organizer
        ├─ Hide: Phone login option
        ├─ Show: Email/Password login
        └─ Show: Email OTP login

SCENARIO 4: Organizer already logged in
    └─ Modal doesn't open
    └─ Proceed with verification checks
    └─ Route to dashboard/onboarding based on category status
```

---

## Implementation Checklist

### Phase 1: Footer Navigation
- [x] Update Footer component — shows all 3 links to everyone except admins
- [x] Footer links trigger email-only auth modal for guests/phone users
- [x] Hide footer links from admin users only
- [x] Add click handlers for each category link with verification check
- [x] Implement category click logic — auth modal for non-organizers, verification check for organizers
- [x] Redirect to `/organizer-onboarding?category=X` if not verified
- [x] Redirect to `/organizer-dashboard?category=X` if verified

### Phase 2: Organizer Dashboard & Onboarding
- [x] Create `/organizer-dashboard?category=X` page with category tabs
- [x] Create `/organizer-onboarding?category=X` page with verification steps
- [x] Dashboard shows quick actions: Create, Manage, View Bookings (per category)
- [x] Dashboard shows verified categories summary
- [x] Onboarding shows PAN status (reusable) + document steps + bank details
- [ ] Implement category-specific CRUD operations (existing pages handle this)
- [ ] Add verification submission logic (existing setup page handles this)
- [x] Implement auto-redirect after verification (onboarding → dashboard)

### Authentication Updates
- [x] Update AuthContext with `organizerCategories` and `pendingOrganizerCategory`
- [x] Add `organizerCategories: string[]` to Zustand store and persist
- [x] Update login redirect logic (`handleRoleRedirection`) based on category verification
- [x] Pass `organizer_categories` from backend responses to frontend auth state
- [x] Update API response types to include `organizer_categories`
- [x] Modify auth modal to show email-only login when triggered from footer

### Navbar Updates
- [x] Organizer link in navbar points to `/organizer-dashboard?category=X`
- [x] Shows "Partner Dashboard" label instead of category-specific text

### API Integration
- [x] Add `partnerApi` to `lib/api.ts` (getMyStatus, getStatusByCategory, getPrefillData, submitVerification, verifyPan)

### Validation & Security
- [x] **ONE EMAIL = ONE PAN** — Enforced in backend `VerifyPAN` controller
- [x] **ONE PAN = ONE EMAIL** — Enforced in backend `VerifyPAN` controller
- [x] Enforce verification check on category access (OrganizerOnly middleware)
- [x] Log all verification attempts
- [x] Add error handling for verification failures

---

## User Flow Diagram

```
LOGIN
  │
  ├─ Phone Login (OTP)
  │   └─ Normal User (can book events, see footer links)
  │       └─ Click footer "List your X"
  │           └─ Show email auth modal (hide phone option)
  │               └─ Login with email → Become Organizer
  │                   └─ Check category verification
  │                       ├─ Verified → /organizer-dashboard?category=X
  │                       └─ Not Verified → /organizer-onboarding?category=X
  │
  ├─ Email Login
  │   ├─ is_admin = true
  │   │   └─ Admin User → /admin
  │   │
  │   └─ is_organizer = true
  │       └─ Organizer (email = first time OR upgrade from phone)
  │           └─ Check if footer click (if any)
  │               ├─ Footer "List your events" clicked
  │               │   ├─ Verified for events? → /organizer-dashboard?category=events  and in this page give option to swtihc to other such as play or dinning if he os verifed for that email using hte same pan

  │               │   └─ Not Verified? → /organizer-onboarding?category=events
  │               │
  │               ├─ Footer "List your play" clicked
  │               │   ├─ Verified for play? → /organizer-dashboard?category=play
  │               │   └─ Not Verified? → /organizer-onboarding?category=play
  │               │
  │               └─ Footer "List your dining" clicked
  │                   ├─ Verified for dining? → /organizer-dashboard?category=dining
  │                   └─ Not Verified? → /organizer-onboarding?category=dining
  │
  └─ NOT LOGGED IN (Guest)
      └─ Can see footer links for all categories
          └─ Click footer "List your X"
              └─ Show email auth modal (email only)
                  └─ Login with email → Redirect to verification check
```

---

## Summary

This documentation covers the complete organizer flow in Ticpin:

1. **Phase 1** - Footer links visible to everyone (except admins). When clicked:
   - Guest/Normal user → Email auth modal → Organizer login
   - Already organizer → Verification check → Dashboard/Onboarding

2. **Phase 2** - Validation rules ensure proper access control and data integrity

Key Features:
- ✓ Normal users (phone) can SEE footer links
- ✓ Normal users can CLICK footer links to become organizers (email login)
- ✓ Each organizer can be verified in multiple categories independently
- ✓ Same person can have two roles: Normal user (phone) AND Organizer (email)
- ✓ **Organizers must verify (PAN + docs) before managing categories**
- ✓ **ONE EMAIL = ONE PAN** (Email cannot have multiple PANs)
- ✓ **ONE PAN = ONE EMAIL** (PAN cannot be shared across different emails)
- ✓ Admins have unrestricted access (don't see organizer footer links)
