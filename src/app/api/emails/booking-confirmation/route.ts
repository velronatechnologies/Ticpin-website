import nodemailer from 'nodemailer';

interface BookingConfirmationPayload {
    email: string;
    name: string;
    bookingType: 'event' | 'play' | 'dining';
    venueName: string;
    bookingDate: string;
    totalAmount: number;
    originalAmount?: number;
    passBenefitApplied?: 'discount' | 'free-booking' | null;
    savingsAmount?: number;
    bookingId: string;
    paymentId?: string;
    paymentGateway?: string;
}

function getBookingIcon(type: string) {
    if (type === 'play') return '🏟️';
    if (type === 'dining') return '🍽️';
    return '🎫';
}

function buildHtml(data: BookingConfirmationPayload): string {
    const icon = getBookingIcon(data.bookingType);
    const savings = data.savingsAmount || 0;
    const original = data.originalAmount || data.totalAmount;
    const gatewayLabel = data.paymentGateway
        ? data.paymentGateway.charAt(0).toUpperCase() + data.paymentGateway.slice(1)
        : 'Online';

    const benefitBadge = data.passBenefitApplied === 'free-booking'
        ? `<div style="background:#4CAF50;color:white;padding:12px 20px;border-radius:8px;text-align:center;font-weight:bold;margin:16px 0;">
               🎁 Free Booking Applied — No Charges!
           </div>`
        : data.passBenefitApplied === 'discount'
        ? `<div style="background:#4CAF50;color:white;padding:12px 20px;border-radius:8px;text-align:center;font-weight:bold;margin:16px 0;">
               💰 15% Ticpin Pass Discount — You Saved ₹${savings}!
           </div>`
        : '';

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#866BFF 0%,#BDB1F3 100%);border-radius:16px;padding:32px;text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;margin-bottom:8px;">${icon}</div>
      <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">✅ Booking Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">${data.bookingType.charAt(0).toUpperCase() + data.bookingType.slice(1)} at ${data.venueName}</p>
    </div>
    <div style="background:white;border-radius:16px;padding:28px;margin-bottom:16px;border:1px solid #e8e8e8;">
      <h2 style="margin:0 0 20px;color:#1a1a1a;">Hi ${data.name}! 🎉</h2>
      <p style="color:#555;margin:0 0 24px;">Your booking is confirmed and your payment has been processed successfully.</p>
      ${benefitBadge}
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 4px;color:#888;font-size:14px;">Booking ID</td><td style="padding:12px 4px;font-weight:700;color:#1a1a1a;font-size:14px;">${data.bookingId}</td></tr>
        <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 4px;color:#888;font-size:14px;">Type</td><td style="padding:12px 4px;text-transform:capitalize;font-size:14px;">${data.bookingType}</td></tr>
        <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 4px;color:#888;font-size:14px;">Venue / Event</td><td style="padding:12px 4px;font-size:14px;">${data.venueName}</td></tr>
        <tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 4px;color:#888;font-size:14px;">Date</td><td style="padding:12px 4px;font-size:14px;">${data.bookingDate}</td></tr>
        ${data.paymentId ? `<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:12px 4px;color:#888;font-size:14px;">Payment ID</td><td style="padding:12px 4px;font-size:13px;font-family:monospace;">${data.paymentId}</td></tr>` : ''}
        <tr><td style="padding:12px 4px;color:#888;font-size:14px;">Payment via</td><td style="padding:12px 4px;font-size:14px;">${gatewayLabel}</td></tr>
      </table>
      <div style="background:#f8f4ff;border-radius:12px;padding:20px;">
        <h3 style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">Payment Summary</h3>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#555;font-size:14px;">Order Amount</span><span style="font-size:14px;">₹${original}</span></div>
        ${savings > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#4CAF50;font-size:14px;font-weight:600;">Pass Savings</span><span style="color:#4CAF50;font-size:14px;font-weight:600;">-₹${savings}</span></div>` : ''}
        <div style="border-top:1px solid #e0d6ff;padding-top:12px;display:flex;justify-content:space-between;"><span style="font-weight:700;font-size:16px;">Total Paid</span><span style="font-weight:700;font-size:18px;color:#866BFF;">₹${data.totalAmount}</span></div>
      </div>
    </div>
    <div style="text-align:center;margin-bottom:20px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ticpin.com'}/profile" style="display:inline-block;background:linear-gradient(135deg,#866BFF,#BDB1F3);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">View My Bookings</a>
    </div>
    <div style="text-align:center;font-size:12px;color:#aaa;padding:16px;">
      <p style="margin:0;">Need help? <a href="mailto:support@ticpin.in" style="color:#866BFF;text-decoration:none;">support@ticpin.in</a></p>
      <p style="margin:8px 0 0;">© 2026 Ticpin. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
    try {
        const data: BookingConfirmationPayload = await request.json();

        if (!data.email || !data.name || !data.bookingId) {
            return Response.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const emailConfig = (data.bookingType === 'play'
            ? { user: process.env.PLAY_EMAIL,   pass: process.env.PLAY_APP_PASSWORD }
            : data.bookingType === 'dining'
            ? { user: process.env.DINING_EMAIL, pass: process.env.DINING_APP_PASSWORD }
            : { user: process.env.EVENTS_EMAIL, pass: process.env.EVENTS_APP_PASSWORD }
        );

        if (!emailConfig.user || !emailConfig.pass) {
            console.warn(`⚠️  No SMTP config for ${data.bookingType} — skipping Next.js email (Go already sent it)`);
            return Response.json({ success: true, message: 'Email skipped (no SMTP config in Next.js env)' });
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: emailConfig.user, pass: emailConfig.pass },
        });

        const subjects: Record<string, string> = {
            play:   `Booking Confirmed — ${data.venueName}`,
            dining: `Table Reserved — ${data.venueName}`,
            event:  `Tickets Confirmed — ${data.venueName}`,
        };

        await transporter.sendMail({
            from: `Ticpin <${emailConfig.user}>`,
            to: data.email,
            subject: subjects[data.bookingType] ?? `Booking Confirmed — ${data.venueName}`,
            html: buildHtml(data),
        });

        console.log(`✅ Booking confirmation email sent to ${data.email}`);
        return Response.json({ success: true, message: 'Confirmation email sent' });
    } catch (error) {
        console.error('❌ booking-confirmation email error:', error);
        // Non-fatal — the Go backend already sent its own SMTP email
        return Response.json({ success: true, message: 'Email failed (non-fatal, Go email sent)' });
    }
}
