# Email Notifications Setup Guide

## Overview
Ticpin Pass now includes comprehensive email notifications for:
- ✅ Pass purchase confirmations
- ✅ Pass renewal confirmations  
- ✅ Expiry reminders (7 days before)
- ✅ Booking confirmations (with pass benefits)

## Environment Setup

### 1. Gmail Configuration

#### Get Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication (2FA) if not already enabled
3. Go to "App passwords" (search in security settings)
4. Create an app password for "Mail" on "Windows PC" (works for all)
5. Copy the 16-character password

#### Update `.env.local`:
```env
# Email Service (Gmail)
NEXT_PUBLIC_EMAIL_USER=your-email@gmail.com
NEXT_PUBLIC_EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
NEXT_PUBLIC_EMAIL_FROM=noreply@ticpin.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Job Secret (for expiry reminder emails)
CRON_SECRET=your-secure-cron-secret-key-here
```

### 2. Environment Variables Explanation

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_EMAIL_USER` | Gmail address | `team@ticpin.com` |
| `NEXT_PUBLIC_EMAIL_PASSWORD` | Gmail app password | `xxxx xxxx xxxx xxxx` |
| `NEXT_PUBLIC_EMAIL_FROM` | Sender display name | `noreply@ticpin.com` |
| `NEXT_PUBLIC_APP_URL` | Base URL for email links | `https://ticpin.com` |
| `CRON_SECRET` | Security key for cron jobs | Any strong key |

### 3. Alternative Email Providers

You can replace the Gmail configuration with other providers by modifying `src/lib/emailService.ts`:

#### SendGrid:
```typescript
const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
});
```

#### AWS SES:
```typescript
const transporter = nodemailer.createTransport({
    host: 'email-smtp.{region}.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.AWS_SES_USER,
        pass: process.env.AWS_SES_PASSWORD
    }
});
```

## Email Templates

### 1. Pass Purchase Confirmation
- **Trigger**: After successful pass purchase
- **Contents**:
  - Pass ID
  - Purchase amount & discount applied
  - Purchase date & expiry date
  - All 3 benefits listed
  - Link to pass dashboard
  - Renewal reminder note

- **API Endpoint**: `/api/emails/pass-purchase`
- **Called From**: `/app/ticpin-pass/page.tsx` (handleBuyPass)

### 2. Pass Renewal Confirmation
- **Trigger**: After successful pass renewal
- **Contents**:
  - New pass ID
  - Old & new expiry dates
  - Refreshed benefits (free bookings reset)
  - Link to dashboard
  - Thank you message

- **API Endpoint**: `/api/emails/pass-renewal`
- **Called From**: `/app/pass-dashboard/page.tsx` (handleRenewPass)

### 3. Booking Confirmation
- **Trigger**: After successful booking (with pass benefits if applied)
- **Contents**:
  - Booking ID & details
  - Venue & booking date
  - Original vs final amount
  - Benefit applied (free booking or discount)
  - Savings amount
  - Payment summary
  - Link to view bookings

- **API Endpoint**: `/api/emails/booking-confirmation`
- **Called From**: `/app/checkout/[type]/billing/page.tsx` (handleSubmit)

### 4. Pass Expiry Reminder
- **Trigger**: Cron job daily (7 days before expiry)
- **Contents**:
  - Days remaining countdown (big display)
  - Pass expiration date
  - Benefits being lost
  - Renewal link
  - Warning message

- **API Endpoint**: `/api/emails/send-expiry-reminders` (GET)
- **Called From**: Scheduled cron job (external)

## Integration Points

### Pass Purchase Flow
```typescript
// After Firebase document created (src/app/ticpin-pass/page.tsx)
await fetch('/api/emails/pass-purchase', {
    method: 'POST',
    body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        purchaseDate: passData.purchaseDate,
        expiryDate: passData.expiryDate,
        passId: docRef.id,
        amount: 849
    })
});
```

### Pass Renewal Flow
```typescript
// After renewPass() succeeds (src/app/pass-dashboard/page.tsx)
await fetch('/api/emails/pass-renewal', {
    method: 'POST',
    body: JSON.stringify({
        email: email,
        name: userPass.name,
        renewalDate: new Date().toISOString(),
        newExpiryDate: newPass.expiryDate,
        passId: newPass.id
    })
});
```

### Booking Confirmation Flow
```typescript
// After bookingApi.createPlayBooking() succeeds (src/app/checkout/[type]/billing/page.tsx)
await fetch('/api/emails/booking-confirmation', {
    method: 'POST',
    body: JSON.stringify({
        email: billingData.email,
        name: billingData.name,
        bookingType: bookingType,
        venueName: venueName,
        bookingDate: date,
        totalAmount: finalAmount,
        originalAmount: totalAmount,
        passBenefitApplied: appliedBenefit,
        savingsAmount: totalAmount - finalAmount,
        bookingId: bookingId
    })
});
```

## Cron Job Setup

### 1. Using Vercel Cron (Recommended)
Create `vercel.json`:
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

### 2. Using External Cron Service (EasyCron, Uptime Robot)
Call daily via GET request:
```
https://your-domain.com/api/emails/send-expiry-reminders
Authorization: Bearer your-cron-secret-key
```

### 3. Manual Testing
```bash
curl -X GET http://localhost:3000/api/emails/send-expiry-reminders \
  -H "Authorization: Bearer test-secret"
```

## API Endpoints

### POST `/api/emails/pass-purchase`
Sends pass purchase confirmation.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "purchaseDate": "2026-02-19T10:00:00Z",
  "expiryDate": "2026-05-19T10:00:00Z",
  "passId": "pass-123",
  "amount": 849
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### POST `/api/emails/pass-renewal`
Sends pass renewal confirmation.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "renewalDate": "2026-02-19T10:00:00Z",
  "newExpiryDate": "2026-05-19T10:00:00Z",
  "passId": "pass-456"
}
```

### POST `/api/emails/booking-confirmation`
Sends booking confirmation with optional pass benefits.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "bookingType": "play",
  "venueName": "Sports Center",
  "bookingDate": "2026-02-20",
  "totalAmount": 700,
  "originalAmount": 1000,
  "passBenefitApplied": "discount",
  "savingsAmount": 300,
  "bookingId": "book-789"
}
```

### GET `/api/emails/send-expiry-reminders`
Sends expiry reminder emails to users with <7 days remaining.

**Headers Required:**
```
Authorization: Bearer your-cron-secret-key
```

**Response:**
```json
{
  "success": true,
  "remindersSent": 15,
  "errors": 1,
  "totalProcessed": 250
}
```

## Testing Guide

### 1. Test Email Sending Locally
```bash
# Add this to a test file to verify email setup
import { sendPassPurchaseEmail } from '@/lib/emailService';

const result = await sendPassPurchaseEmail({
    email: 'test@example.com',
    name: 'Test User',
    purchaseDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    passId: 'TEST-123',
    amount: 849
});

console.log('Email sent:', result);
```

### 2. Test via Curl
```bash
# Test pass purchase email
curl -X POST http://localhost:3000/api/emails/pass-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Your Name",
    "purchaseDate": "2026-02-19T10:00:00Z",
    "expiryDate": "2026-05-19T10:00:00Z",
    "passId": "TICPIN-TEST1",
    "amount": 849
  }'
```

### 3. Check Logs
All email operations log to console:
- ✅ `Email sent: {messageId}` - Success
- ❌ `Email send failed: {error}` - Failure

## Troubleshooting

### "Authentication failed" Error
- **Cause**: Wrong Gmail password or app password not generated
- **Solution**: Regenerate Gmail app password, make sure 2FA is enabled

### "Email not sent but no error"
- **Cause**: Environment variables not loaded
- **Solution**: Restart dev server after updating `.env.local`

### "Emails sent to spam"
- **Cause**: Gmail sender reputation
- **Solution**: Use dedicated SendGrid/AWS SES account for better deliverability

### "Cron job not running"
- **Cause**: CRON_SECRET not matching or endpoint not accessible
- **Solution**: Test endpoint directly with curl, verify secret in request

## Email Delivery Rates

| Provider | Delivery Rate | Setup Difficulty | Cost |
|----------|--------------|-----------------|------|
| Gmail | 95-97% (high spam risk) | Easy | Free |
| SendGrid | 98%+ | Medium | Free tier available |
| AWS SES | 99%+ | Hard | Pay per email |
| Mailgun | 99%+ | Medium | Free tier available |

**Recommendation**: Use SendGrid or Mailgun for production (better deliverability, analytics).

## Email Customization

### Change Email Sender
Edit `src/lib/emailService.ts`:
```typescript
const mailOptions = {
    from: 'Your Company <noreply@yourcompany.com>',
    ...options
};
```

### Customize Email Templates
Edit template HTML in email functions:
```typescript
export const sendPassPurchaseEmail = async (userData) => {
    const html = `
        <!-- Customize HTML here -->
    `;
    // ...
}
```

### Add Company Logo
Add image to email HTML:
```html
<img src="https://ticpin.com/logo.png" alt="Ticpin" style="height: 40px;">
```

## Production Checklist

- [ ] Update `.env.production` with production email credentials
- [ ] Set up SendGrid/AWS SES account for better deliverability
- [ ] Configure Vercel cron jobs (if using Vercel)
- [ ] Set up external cron service for expiry reminders
- [ ] Test all email flows end-to-end
- [ ] Monitor email sent/failed metrics
- [ ] Set up email bounce handling
- [ ] Add unsubscribe links to emails (GDPR compliance)
- [ ] Test on multiple email clients (Gmail, Outlook, etc.)

## Next Steps

1. ✅ Set up Gmail app password
2. ✅ Update `.env.local` with credentials
3. ✅ Test email sending locally
4. ✅ Configure production email service
5. ✅ Set up cron jobs for expiry reminders
6. ✅ Monitor email delivery rates
7. ✅ Add email preferences/unsubscribe

