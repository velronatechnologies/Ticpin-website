// Email transporter configuration - all emails are sent via backend API
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Send email via backend API
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        // This is a helper function for the other email functions
        // It raises an error since individual emails should use their specific endpoints
        console.error('❌ Use specific email functions instead of sendEmail()');
        return false;
    } catch (error) {
        console.error('❌ Email send failed:', error);
        return false;
    }
};

/**
 * Pass Purchase Confirmation Email
 */
export const sendPassPurchaseEmail = async (userData: {
    email: string;
    name: string;
    purchaseDate: string;
    expiryDate: string;
    passId: string;
    amount: number;
}): Promise<boolean> => {
    try {
        const response = await fetch(`${BACKEND_API_URL}/emails/pass-purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                name: userData.name,
                passId: userData.passId,
                amount: userData.amount,
                purchaseDate: userData.purchaseDate,
                expiryDate: userData.expiryDate,
            }),
        });

        if (!response.ok) {
            console.error('❌ Email send failed:', await response.text());
            return false;
        }

        console.log('✅ Email sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Email send failed:', error);
        return false;
    }
};

/**
 * Pass Renewal Confirmation Email
 */
export const sendPassRenewalEmail = async (userData: {
    email: string;
    name: string;
    renewalDate: string;
    newExpiryDate: string;
    passId: string;
}): Promise<boolean> => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
                .content { padding: 20px; background: #f1f8f4; border-radius: 10px; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Pass Renewed Successfully!</h1>
                    <p>Your Benefits Are Refreshed</p>
                </div>

                <div class="content">
                    <h2>Great news, ${userData.name}! 🌟</h2>
                    <p>Your Ticpin Pass has been successfully renewed. Your free bookings counter has been reset, and you're all set to enjoy more benefits!</p>

                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Renewal Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Pass ID</td>
                                <td style="padding: 10px; font-weight: bold;">${userData.passId}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Renewal Date</td>
                                <td style="padding: 10px;">${new Date(userData.renewalDate).toLocaleDateString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px;">New Expiry Date</td>
                                <td style="padding: 10px; color: #4CAF50; font-weight: bold;">${new Date(userData.newExpiryDate).toLocaleDateString('en-IN')}</td>
                            </tr>
                        </table>
                    </div>

                    <h3>✨ Fresh Benefits!</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li style="padding: 8px 0;"><strong>🎾 2 Free Turf Bookings</strong> - Fully reset and ready to use</li>
                        <li style="padding: 8px 0;"><strong>⚡ 15% Discount</strong> - Active on all bookings</li>
                        <li style="padding: 8px 0;"><strong>🎯 Priority Support</strong> - Dedicated help available</li>
                    </ul>

                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ticpin.com'}/pass-dashboard" class="button">Back to Your Dashboard</a>
                </div>

                <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>Thank you for being a valued Ticpin member!</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const response = await fetch(`${BACKEND_API_URL}/emails/pass-renewal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                name: userData.name,
                passId: userData.passId,
                renewalDate: userData.renewalDate,
                newExpiryDate: userData.newExpiryDate,
                html,
            }),
        });

        if (!response.ok) {
            console.error('❌ Email send failed:', await response.text());
            return false;
        }

        console.log('✅ Email sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Email send failed:', error);
        return false;
    }
};

/**
 * Pass Expiry Reminder Email (7 days before expiry)
 */
export const sendPassExpiryReminderEmail = async (userData: {
    email: string;
    name: string;
    expiryDate: string;
    passId: string;
    daysRemaining: number;
}): Promise<boolean> => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
                .content { padding: 20px; background: #fff8f0; border-radius: 10px; margin: 20px 0; }
                .countdown { font-size: 48px; font-weight: bold; color: #F57C00; text-align: center; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⏰ Your Pass Expires Soon!</h1>
                    <p>Don't Lose Your Benefits</p>
                </div>

                <div class="content">
                    <h2>Hi ${userData.name},</h2>
                    <p>Your Ticpin Pass will expire on <strong>${new Date(userData.expiryDate).toLocaleDateString('en-IN')}</strong>.</p>

                    <div class="countdown">${userData.daysRemaining} DAYS LEFT</div>

                    <p style="text-align: center; color: #999;">Renew now to continue enjoying:</p>
                    <ul style="text-align: center; list-style: none; padding: 0;">
                        <li>🎾 2 Free Turf Bookings</li>
                        <li>⚡ 15% Discount on All Bookings</li>
                        <li>🎯 Priority Support</li>
                    </ul>

                    <center>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ticpin.com'}/pass-dashboard" class="button">Renew Your Pass Now</a>
                    </center>

                    <p style="background: #fff3cd; padding: 15px; border-radius: 5px; color: #856404; margin-top: 20px;">
                        Once your pass expires, you'll lose access to free bookings and the discount. Renew before it's too late!
                    </p>
                </div>

                <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>Don't miss out! Renew before ${new Date(userData.expiryDate).toLocaleDateString('en-IN')}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const response = await fetch(`${BACKEND_API_URL}/emails/pass-expiry-reminder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                name: userData.name,
                passId: userData.passId,
                expiryDate: userData.expiryDate,
                daysRemaining: userData.daysRemaining,
                html,
            }),
        });

        if (!response.ok) {
            console.error('❌ Email send failed:', await response.text());
            return false;
        }

        console.log('✅ Email sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Email send failed:', error);
        return false;
    }
};

/**
 * Booking Confirmation Email with Pass Benefits
 */
export const sendBookingConfirmationEmail = async (bookingData: {
    email: string;
    name: string;
    bookingType: 'event' | 'play' | 'dining';
    venueName: string;
    bookingDate: string;
    totalAmount: number;
    originalAmount: number;
    passBenefitApplied?: 'discount' | 'free-booking' | null;
    savingsAmount: number;
    bookingId: string;
}): Promise<boolean> => {
    const benefitText = bookingData.passBenefitApplied === 'free-booking' 
        ? '🎁 Free Booking Applied - No Charges!'
        : bookingData.passBenefitApplied === 'discount'
        ? `💰 15% Ticpin Pass Discount Applied - You Saved ₹${bookingData.savingsAmount}`
        : 'Standard Booking';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #5331EA 0%, #E91E63 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
                .content { padding: 20px; background: #f8f4ff; border-radius: 10px; margin: 20px 0; }
                .benefit-badge { background: #4CAF50; color: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; font-weight: bold; }
                .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #5331EA 0%, #E91E63 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Booking Confirmed!</h1>
                    <p>Your ${bookingData.bookingType.charAt(0).toUpperCase() + bookingData.bookingType.slice(1)} is Booked</p>
                </div>

                <div class="content">
                    <h2>Thank you, ${bookingData.name}! 🎉</h2>
                    <p>Your booking has been confirmed. Here are your details:</p>

                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Booking ID</td>
                                <td style="padding: 10px; font-weight: bold;">${bookingData.bookingId}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Type</td>
                                <td style="padding: 10px; text-transform: capitalize;">${bookingData.bookingType}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Venue</td>
                                <td style="padding: 10px;">${bookingData.venueName}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Date</td>
                                <td style="padding: 10px;">${new Date(bookingData.bookingDate).toLocaleDateString('en-IN')}</td>
                            </tr>
                        </table>
                    </div>

                    ${bookingData.passBenefitApplied ? `
                        <div class="benefit-badge">
                            ${benefitText}
                        </div>
                    ` : ''}

                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Payment Summary</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 10px;">Original Amount</td>
                                <td style="padding: 10px; text-align: right;">₹${bookingData.originalAmount}</td>
                            </tr>
                            ${bookingData.passBenefitApplied && bookingData.savingsAmount > 0 ? `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 10px; color: #4CAF50;"><strong>Savings</strong></td>
                                    <td style="padding: 10px; text-align: right; color: #4CAF50;"><strong>-₹${bookingData.savingsAmount}</strong></td>
                                </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 10px;"><strong>Total Paid</strong></td>
                                <td style="padding: 10px; text-align: right; color: #5331EA; font-weight: bold;">₹${bookingData.totalAmount}</td>
                            </tr>
                        </table>
                    </div>

                    <p style="background: #e8f5e9; padding: 15px; border-radius: 5px; color: #2e7d32;">
                        💡 <strong>Tip:</strong> Download the Ticpin app for easy check-ins and instant support!
                    </p>

                    <center>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ticpin.com'}/profile" class="button">View All Bookings</a>
                    </center>
                </div>

                <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>Need help? <a href="mailto:support@ticpin.com" style="color: #5331EA; text-decoration: none;">Contact our support team</a></p>
                    <p>© 2026 Ticpin. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const response = await fetch(`${BACKEND_API_URL}/emails/booking-confirmation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: bookingData.email,
                name: bookingData.name,
                bookingType: bookingData.bookingType,
                venueName: bookingData.venueName,
                bookingDate: bookingData.bookingDate,
                totalAmount: bookingData.totalAmount,
                originalAmount: bookingData.originalAmount,
                passBenefitApplied: bookingData.passBenefitApplied,
                savingsAmount: bookingData.savingsAmount,
                bookingId: bookingData.bookingId,
                html,
            }),
        });

        if (!response.ok) {
            console.error('❌ Email send failed:', await response.text());
            return false;
        }

        console.log('✅ Email sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Email send failed:', error);
        return false;
    }
};

/**
 * Send Batch Renewal Reminders (for backend cron job)
 */
export const sendBatchRenewalReminders = async (users: Array<{
    email: string;
    name: string;
    expiryDate: string;
    passId: string;
}>): Promise<{ sent: number; failed: number }> => {
    let sent = 0;
    let failed = 0;

    for (const user of users) {
        const daysRemaining = Math.ceil((new Date(user.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 7 && daysRemaining > 0) {
            const success = await sendPassExpiryReminderEmail({
                email: user.email,
                name: user.name,
                expiryDate: user.expiryDate,
                passId: user.passId,
                daysRemaining
            });

            if (success) sent++;
            else failed++;
        }
    }

    console.log(`📧 Renewal reminders sent: ${sent}, Failed: ${failed}`);
    return { sent, failed };
};
