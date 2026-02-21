import { sendBookingConfirmationEmail } from '@/lib/emailService';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        const success = await sendBookingConfirmationEmail({
            email: data.email,
            name: data.name,
            bookingType: data.bookingType || 'play',
            venueName: data.venueName,
            bookingDate: data.bookingDate,
            totalAmount: data.totalAmount,
            originalAmount: data.originalAmount || data.totalAmount,
            passBenefitApplied: data.passBenefitApplied || null,
            savingsAmount: data.savingsAmount || 0,
            bookingId: data.bookingId
        });

        if (success) {
            return Response.json({ success: true, message: 'Confirmation email sent' });
        } else {
            return Response.json({ success: false, message: 'Failed to send email' }, { status: 500 });
        }
    } catch (error) {
        console.error('API error:', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
