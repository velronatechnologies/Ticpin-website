import { sendPassRenewalEmail } from '@/lib/emailService';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        const success = await sendPassRenewalEmail({
            email: data.email,
            name: data.name,
            renewalDate: data.renewalDate,
            newExpiryDate: data.newExpiryDate,
            passId: data.passId
        });

        if (success) {
            return Response.json({ success: true, message: 'Renewal email sent successfully' });
        } else {
            return Response.json({ success: false, message: 'Failed to send email' }, { status: 500 });
        }
    } catch (error) {
        console.error('API error:', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
