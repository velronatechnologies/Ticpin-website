import { sendPassExpiryReminderEmail } from '@/lib/emailService';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'test-secret'}`) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all active passes
        const q = query(collection(db, 'ticpin_pass_users'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);

        let remindersSent = 0;
        let errors = 0;

        for (const doc of snapshot.docs) {
            const passData = doc.data();
            const expiryDate = new Date(passData.expiryDate);
            const now = new Date();
            const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Send reminder if 7 days or less remaining and hasn't sent reminder before (could add a flag for this)
            if (daysRemaining <= 7 && daysRemaining > 0) {
                const success = await sendPassExpiryReminderEmail({
                    email: passData.email,
                    name: passData.name,
                    expiryDate: passData.expiryDate,
                    passId: doc.id,
                    daysRemaining
                });

                if (success) {
                    remindersSent++;
                } else {
                    errors++;
                }
            }
        }

        return Response.json({
            success: true,
            remindersSent,
            errors,
            totalProcessed: snapshot.size
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return Response.json(
            { error: 'Failed to send reminders', details: error },
            { status: 500 }
        );
    }
}
