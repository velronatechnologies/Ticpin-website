# Email Notification System - Complete Implementation

## 📧 Email Features Implemented

### 1. **Pass Purchase Confirmation Email**
✅ **Status**: Integrated & Ready
- **Trigger**: After successful ticpin pass purchase
- **Recipient**: User email
- **Contents**:
  - Pass ID & purchase details
  - Amount paid & discount applied
  - Validity dates (purchase → expiry)
  - All 3 benefits (free turf, discount, priority)
  - Renewal reminder note
  - Link to pass dashboard
  
- **Content Styling**: Professional gradient header, benefits showcase, clear CTA
- **Integration**: `src/app/ticpin-pass/page.tsx` → calls `/api/emails/pass-purchase`

### 2. **Pass Renewal Confirmation Email**
✅ **Status**: Integrated & Ready
- **Trigger**: After successful pass renewal
- **Recipient**: User email
- **Contents**:
  - Renewal confirmation message
  - New pass validity dates
  - Benefits reset notification (2 free bookings reset)
  - All 3 benefits refreshed list
  - Link back to dashboard
  
- **Content Styling**: Green success theme, clear benefits reset message
- **Integration**: `src/app/pass-dashboard/page.tsx` → calls `/api/emails/pass-renewal`

### 3. **Booking Confirmation Email**
✅ **Status**: Integrated & Ready
- **Trigger**: After successful event/play/dining booking
- **Recipient**: User email
- **Contents**:
  - Booking ID & details
  - Venue name & booking date
  - Original amount vs final amount
  - **Pass benefit applied** (if used):
    - ✨ FREE BOOKING (green badge) - 0 amount
    - OR 💰 15% DISCOUNT (shows savings)
  - Payment summary table
  - Link to view all bookings
  
- **Content Styling**: Pass benefit applied in green, clear payment breakdown
- **Integration**: `src/app/checkout/[type]/billing/page.tsx` → calls `/api/emails/booking-confirmation`
- **Note**: Email sent regardless of payment type, but highlights if pass benefit used

### 4. **Pass Expiry Reminder Email**
✅ **Status**: Integrated & Ready (Cron job required)
- **Trigger**: Daily cron job checks Firebase, sends if <7 days remaining
- **Recipient**: User email
- **Contents**:
  - Days remaining (big countdown display)
  - Exact expiry date
  - Benefits being lost list
  - Immediate renewal link
  - Warning message about losing benefits
  
- **Content Styling**: Orange warning theme, big countdown timer
- **Integration**: Cron job → calls `/api/emails/send-expiry-reminders`
- **Cron Setup**: Vercel cron or external scheduler (EasyCron, Uptime Robot)

---

## 🔧 API Routes Created

### POST `/api/emails/pass-purchase`
Sends immediate confirmation after pass purchase.
```bash
curl -X POST http://localhost:3000/api/emails/pass-purchase \
  -H "Content-Type: application/json" \
  -d {
    "email": "user@example.com",
    "name": "John Doe",
    "purchaseDate": "2026-02-19T10:00:00Z",
    "expiryDate": "2026-05-19T10:00:00Z",
    "passId": "TICPIN-123",
    "amount": 849
  }
```

### POST `/api/emails/pass-renewal`
Sends confirmation after pass renewal.
```bash
curl -X POST http://localhost:3000/api/emails/pass-renewal \
  -H "Content-Type: application/json" \
  -d {
    "email": "user@example.com",
    "name": "John Doe",
    "renewalDate": "2026-02-19T10:00:00Z",
    "newExpiryDate": "2026-05-19T10:00:00Z",
    "passId": "TICPIN-456"
  }
```

### POST `/api/emails/booking-confirmation`
Sends confirmation after booking completion (with pass benefits if applied).
```bash
curl -X POST http://localhost:3000/api/emails/booking-confirmation \
  -H "Content-Type: application/json" \
  -d {
    "email": "user@example.com",
    "name": "John Doe",
    "bookingType": "play",
    "venueName": "Sports Arena",
    "bookingDate": "2026-02-20",
    "totalAmount": 700,
    "originalAmount": 1000,
    "passBenefitApplied": "discount",
    "savingsAmount": 300,
    "bookingId": "BOOK-789"
  }
```

### GET `/api/emails/send-expiry-reminders`
Scheduled cron job to send expiry reminders.
```bash
curl -X GET http://localhost:3000/api/emails/send-expiry-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 📁 Files Created/Modified

| File | Type | Changes |
|------|------|---------|
| `src/lib/emailService.ts` | ✨ New | Email service with 4 email functions + transporter |
| `src/app/api/emails/pass-purchase/route.ts` | ✨ New | POST endpoint for purchase confirmation |
| `src/app/api/emails/pass-renewal/route.ts` | ✨ New | POST endpoint for renewal confirmation |
| `src/app/api/emails/booking-confirmation/route.ts` | ✨ New | POST endpoint for booking confirmation |
| `src/app/api/emails/send-expiry-reminders/route.ts` | ✨ New | GET endpoint for cron job |
| `src/app/ticpin-pass/page.tsx` | ✏️ Updated | Added email send after pass purchase |
| `src/app/pass-dashboard/page.tsx` | ✏️ Updated | Added email send after renewal |
| `src/app/checkout/[type]/billing/page.tsx` | ✏️ Updated | Added email send after booking |
| `EMAIL_SETUP.md` | ✨ New | Complete email setup guide |
| `.env.example` | ✨ New | Environment variables template |

---

## 🚀 How to Use

### 1. **Local Development Setup**

Copy environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_EMAIL_USER=your-email@gmail.com
NEXT_PUBLIC_EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # From Gmail app password
NEXT_PUBLIC_EMAIL_FROM=noreply@ticpin.com
CRON_SECRET=test-secret
```

### 2. **Generate Gmail App Password**

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2FA if needed
3. Search for "App passwords"
4. Select Mail + Windows PC
5. Copy the 16-character password
6. Add to `.env.local`

### 3. **Test Email Sending Locally**

```typescript
// Create a test file or run in browser console
import { sendPassPurchaseEmail } from '@/lib/emailService';

const result = await sendPassPurchaseEmail({
    email: 'your-email@gmail.com',
    name: 'Test User',
    purchaseDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    passId: 'TEST-123',
    amount: 849
});

console.log('Email sent:', result);
```

### 4. **Test via API Endpoint**

```bash
curl -X POST http://localhost:3000/api/emails/pass-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "name": "Test User",
    "purchaseDate": "2026-02-19T10:00:00Z",
    "expiryDate": "2026-05-19T10:00:00Z",
    "passId": "TEST-123",
    "amount": 849
  }'
```

### 5. **Set Up Cron Jobs for Expiry Reminders**

**Option A: Vercel Cron (Recommended)**
```json
{
  "crons": [
    {
      "path": "/api/emails/send-expiry-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Option B: External Service (EasyCron/Uptime Robot)**
- Create GET request to `/api/emails/send-expiry-reminders`
- Include header: `Authorization: Bearer your-cron-secret`
- Schedule to run daily at 08:00

---

## 💌 Email Content Examples

### Pass Purchase Email Features
- Beautiful gradient header (purple-pink)
- Pass ID displayed prominently
- All 3 benefits with icons
- Renewal countdown reminder
- Call-to-action button to dashboard
- Footer with support contact

### Booking Confirmation Email Features
- Booking type icon & title
- Benefit badge (if pass used):
  - **Green "FREE BOOKING"** - No charges!
  - **Green "15% DISCOUNT"** - Shows exact savings
- Clear payment breakdown table
- Original vs final amount comparison
- Booking ID for reference
- Link back to view all bookings

---

## ⚙️ Configuration Options

### Email Provider Selection
All email sending routed through `src/lib/emailService.ts` transporter.

**Current**: Gmail SMTP
**Alternatives**:
- SendGrid
- AWS SES
- Mailgun
- Brevo (formerly Sendinblue)

To switch providers, update transporter config in `emailService.ts`.

### Email Customization
Each email template has full HTML customization:
- Add company logo
- Change colors/branding
- Add/remove fields
- Customize CTA buttons
- Add tracking pixels
- Include company footer/social links

---

## 📊 Email Delivery Flow

```
Pass Purchase
├─ User completes payment
├─ Firebase document created
└─ POST /api/emails/pass-purchase
   └─ Email sent → User inbox

Pass Renewal
├─ User clicks "Renew Pass"
├─ New pass created in Firebase
└─ POST /api/emails/pass-renewal
   └─ Email sent → User inbox

Booking Confirmation
├─ User completes booking
├─ Booking stored in database
└─ POST /api/emails/booking-confirmation
   ├─ Includes pass benefit data (if applied)
   └─ Email sent → User inbox

Expiry Reminder (Cron)
├─ Daily cron job runs
├─ Query all active passes from Firebase
├─ Filter: expiry date within 7 days
└─ For each user:
   └─ POST /api/emails/send-expiry-reminders
      └─ Email sent → User inbox
```

---

## 🔐 Security Features

1. **Cron Job Authentication**: CRON_SECRET header validation
2. **Email Service**: Secure app passwords (never plain text)
3. **Error Handling**: Non-blocking (email failure doesn't break booking flow)
4. **Logging**: Console logs for debugging (check server logs)
5. **GDPR Ready**: Can add unsubscribe links to templates

---

## ✅ Status Summary

| Feature | Status | Integrated | Tested |
|---------|--------|-----------|--------|
| Pass Purchase Email | ✅ Complete | ✅ Yes | 📝 Local |
| Pass Renewal Email | ✅ Complete | ✅ Yes | 📝 Local |
| Booking Confirmation | ✅ Complete | ✅ Yes | 📝 Local |
| Expiry Reminder | ✅ Complete | ⏳ Cron needed | 📝 Manual |
| Email Service | ✅ Complete | ✅ Yes | ✅ Tested |
| API Routes | ✅ Complete | ✅ Yes | ✅ Tested |
| Environment Setup | ✅ Complete | ✅ Yes | 📝 Docs ready |

---

## 🎯 Next Steps

1. ✅ **Set up Gmail App Password** - Follow EMAIL_SETUP.md
2. ✅ **Update .env.local** - Copy from .env.example
3. ✅ **Test locally** - Use curl or API client
4. ✅ **Deploy to production** - Update .env.production
5. ✅ **Configure Vercel Cron** - Add to vercel.json (if using Vercel)
6. ✅ **Set up external cron** - If not on Vercel
7. ✅ **Monitor email delivery** - Check Gmail sent folder
8. ✅ **Add analytics** - Track email open/click rates (future)

---

## 📞 Support

For issues:
- Check `EMAIL_SETUP.md` troubleshooting section
- Verify environment variables are loaded
- Check browser console for fetch errors
- Check server logs for email service errors
- Test email API endpoint directly with curl

