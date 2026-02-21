import { sendPassPurchaseEmail } from '@/lib/emailService';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        const success = await sendPassPurchaseEmail({
            email: data.email,
            name: data.name,
            purchaseDate: data.purchaseDate,
            expiryDate: data.expiryDate,
            passId: data.passId,
            amount: data.amount
        });

        if (success) {
            return Response.json({ success: true, message: 'Email sent successfully' });
        } else {
            return Response.json({ success: false, message: 'Failed to send email' }, { status: 500 });
        }
    } catch (error) {
        console.error('API error:', error);
        return Response.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
