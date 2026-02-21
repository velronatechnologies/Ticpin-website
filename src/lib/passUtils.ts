import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, Timestamp, addDoc, deleteDoc } from 'firebase/firestore';

export interface UserPass {
    id: string;
    email: string;
    phone?: string;
    userId: string;
    name?: string;
    purchaseDate: string;
    expiryDate: string;
    freeTurfBookings: number;
    usedTurfBookings: number;
    totalDiningVouchers?: number;
    usedDiningVouchers?: number;
    discountPercentage: number;
    status: 'active' | 'expired' | 'cancelled';
    renewalCount?: number;
}

/**
 * Check if user has an active Ticpin Pass
 */
export const getUserPass = async (email?: string, phone?: string): Promise<UserPass | null> => {
    try {
        if (!email && !phone) return null;

        const results: any[] = [];

        // Check email if provided
        if (email) {
            const qEmail = query(collection(db, 'ticpin_pass_users'), where('email', '==', email));
            const snapEmail = await getDocs(qEmail);
            results.push(...snapEmail.docs);
        }

        // Check phone if provided
        if (phone) {
            const qPhone = query(collection(db, 'ticpin_pass_users'), where('phone', '==', phone));
            const snapPhone = await getDocs(qPhone);
            results.push(...snapPhone.docs);
        }

        if (results.length === 0) return null;

        // Find the most recent active pass, or if none, return the most recent pass
        let activePass = null;
        let mostRecentPass = null;
        let latestDate = new Date(0);

        for (const docSnap of results) {
            const passData = docSnap.data();
            const expiryDate = new Date(passData.expiryDate);
            const purchaseDate = new Date(passData.purchaseDate);
            const now = new Date();

            // Check if pass is active (not expired)
            if (expiryDate >= now && !activePass) {
                activePass = {
                    ...passData,
                    id: docSnap.id,
                    status: 'active'
                } as UserPass;
                break; // Return first active pass found
            }

            // Track most recent pass for fallback
            if (purchaseDate > latestDate) {
                latestDate = purchaseDate;
                mostRecentPass = {
                    ...passData,
                    id: docSnap.id,
                    status: expiryDate < now ? 'expired' : 'active'
                } as UserPass;
            }
        }

        return activePass || mostRecentPass;
    } catch (error) {
        console.error('Error getting user pass:', error);
        return null;
    }
};

/**
 * Get all pass records for a user (for management/admin purposes)
 */
export const getAllUserPasses = async (email: string): Promise<UserPass[]> => {
    try {
        const q = query(collection(db, 'ticpin_pass_users'), where('email', '==', email));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(docSnap => {
            const passData = docSnap.data();
            const expiryDate = new Date(passData.expiryDate);
            const now = new Date();

            return {
                ...passData,
                id: docSnap.id,
                status: expiryDate < now ? 'expired' : 'active'
            } as UserPass;
        });
    } catch (error) {
        console.error('Error getting all user passes:', error);
        return [];
    }
};

/**
 * Prevent duplicate pass purchases - called before creating new pass
 */
export const checkDuplicatePass = async (email: string, phone: string): Promise<{ hasDuplicate: boolean; existingPassId?: string; message?: string }> => {
    try {
        if (!email && !phone) return { hasDuplicate: false };

        const results: any[] = [];

        // Check email if provided
        if (email) {
            const qEmail = query(collection(db, 'ticpin_pass_users'), where('email', '==', email));
            const snapEmail = await getDocs(qEmail);
            results.push(...snapEmail.docs);
        }

        // Check phone if provided
        if (phone) {
            const qPhone = query(collection(db, 'ticpin_pass_users'), where('phone', '==', phone));
            const snapPhone = await getDocs(qPhone);
            results.push(...snapPhone.docs);
        }

        if (results.length === 0) {
            return { hasDuplicate: false };
        }

        // Check for active pass
        const now = new Date();
        for (const docSnap of results) {
            const passData = docSnap.data();
            const expiryDate = new Date(passData.expiryDate);

            if (expiryDate >= now) {
                return {
                    hasDuplicate: true,
                    existingPassId: docSnap.id,
                    message: `You already have an active Ticpin Pass valid until ${expiryDate.toLocaleDateString('en-IN')}. You can renew it after expiry.`
                };
            }
        }

        return { hasDuplicate: false };
    } catch (error) {
        console.error('Error checking duplicate pass:', error);
        return { hasDuplicate: false };
    }
};

/**
 * Clean up duplicate/old passes for a user (keep only 1 active + 1 most recent expired)
 */
export const cleanupDuplicatePasses = async (email?: string, phone?: string): Promise<number> => {
    try {
        if (!email && !phone) return 0;

        const results: any[] = [];

        // Check email if provided
        if (email) {
            const qEmail = query(collection(db, 'ticpin_pass_users'), where('email', '==', email));
            const snapEmail = await getDocs(qEmail);
            results.push(...snapEmail.docs);
        }

        // Check phone if provided
        if (phone) {
            const qPhone = query(collection(db, 'ticpin_pass_users'), where('phone', '==', phone));
            const snapPhone = await getDocs(qPhone);
            results.push(...snapPhone.docs);
        }

        if (results.length <= 1) return 0;

        // Use a Set to track processed doc IDs (to handle overlaps where a pass has both same email and phone)
        const docIds = new Set<string>();
        const allPassesExtended: UserPass[] = [];

        for (const docSnap of results) {
            if (docIds.has(docSnap.id)) continue;
            docIds.add(docSnap.id);

            const passData = docSnap.data();
            const expiryDate = new Date(passData.expiryDate);
            const now = new Date();

            allPassesExtended.push({
                ...passData,
                id: docSnap.id,
                status: expiryDate < now ? 'expired' : 'active'
            } as UserPass);
        }

        if (allPassesExtended.length <= 1) return 0;

        const activePasses = allPassesExtended.filter(p => p.status === 'active');
        const expiredPasses = allPassesExtended.filter(p => p.status === 'expired');
        let deletedCount = 0;

        // Keep only the first active pass, delete rest
        if (activePasses.length > 1) {
            for (let i = 1; i < activePasses.length; i++) {
                await deleteDoc(doc(db, 'ticpin_pass_users', activePasses[i].id));
                deletedCount++;
            }
        }

        // Keep only 1 most recent expired pass, delete rest
        if (expiredPasses.length > 1) {
            const sorted = expiredPasses.sort((a, b) =>
                new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
            );

            // If we have an active pass, delete ALL expired ones. 
            // If no active pass, keep the most recent expired one.
            const startIndex = activePasses.length > 0 ? 0 : 1;

            for (let i = startIndex; i < sorted.length; i++) {
                await deleteDoc(doc(db, 'ticpin_pass_users', sorted[i].id));
                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} duplicate pass records`);
        }

        return deletedCount;
    } catch (error) {
        console.error('Error cleaning up duplicate passes:', error);
        return 0;
    }
};

export const canUseFreeBooking = async (email: string): Promise<boolean> => {
    const pass = await getUserPass(email);

    if (!pass || pass.status !== 'active') return false;

    const remainingBookings = pass.freeTurfBookings - pass.usedTurfBookings;
    return remainingBookings > 0;
};


/**
 * Use one free turf booking
 */
export const useFreeBooking = async (passId: string): Promise<boolean> => {
    try {
        const passRef = doc(db, 'ticpin_pass_users', passId);
        await updateDoc(passRef, {
            usedTurfBookings: Timestamp.now() // This will be incremented  on backend
        });
        return true;
    } catch (error) {
        console.error('Error using free booking:', error);
        return false;
    }
};

/**
 * Check if user has an active pass (boolean only)
 */
export const hasActivePass = async (email: string): Promise<boolean> => {
    const pass = await getUserPass(email);
    return pass !== null && pass.status === 'active';
};

/**
 * Get discount percentage for user
 */
export const getUserDiscount = async (email: string): Promise<number> => {
    const pass = await getUserPass(email);

    if (!pass || pass.status !== 'active') return 0;

    return pass.discountPercentage;
};

/**
 * Calculate discounted price
 */
export const calculateDiscountedPrice = (originalPrice: number, discountPercentage: number): number => {
    return Math.round(originalPrice * (1 - discountPercentage / 100));
};

/**
 * Get pass remaining days
 */
export const getPassRemainingDays = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

/**
 * Check if pass needs renewal (less than 7 days remaining)
 */
export const shouldShowRenewalReminder = (expiryDate: string): boolean => {
    return getPassRemainingDays(expiryDate) <= 7;
};

/**
 * Check if user has an active pass (boolean only)
 */
// export const hasActivePass = async (email: string): Promise<boolean> => {
//     const pass = await getUserPass(email);
//     return pass !== null && pass.status === 'active';
// };

/**
 * Get remaining free turf bookings count
 */
export const getRemainingFreeTurfBookings = async (email?: string, phone?: string): Promise<number> => {
    const pass = await getUserPass(email, phone);

    if (!pass || pass.status !== 'active') return 0;

    return Math.max(0, pass.freeTurfBookings - pass.usedTurfBookings);
};

/**
 * Apply pass discount to price
 */
export const applyPassDiscount = async (email: string, originalPrice: number): Promise<number> => {
    const discount = await getUserDiscount(email);
    return calculateDiscountedPrice(originalPrice, discount);
};

/**
 * Renew user's expired pass
 */
export const renewPass = async (email: string, userId: string): Promise<UserPass | null> => {
    try {
        const existingPass = await getUserPass(email);

        if (!existingPass) return null;

        const newExpiryDate = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000).toISOString();
        const renewalCount = (existingPass.renewalCount || 0) + 1;

        // Create new pass record
        const newPassData = {
            email,
            userId,
            name: existingPass.name || existingPass.email?.split('@')[0] || 'User',
            purchaseDate: new Date().toISOString(),
            expiryDate: newExpiryDate,
            freeTurfBookings: 2,
            usedTurfBookings: 0,
            totalDiningVouchers: 2,
            usedDiningVouchers: 0,
            discountPercentage: 15,
            status: 'active',
            renewalCount,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, 'ticpin_pass_users'), newPassData);

        return {
            id: docRef.id,
            ...newPassData,
            createdAt: newPassData.createdAt.toDate().toISOString(),
            updatedAt: newPassData.updatedAt.toDate().toISOString()
        } as UserPass;
    } catch (error) {
        console.error('Error renewing pass:', error);
        return null;
    }
};

/**
 * Get discount with renewal history
 */
export const applyPassBenefit = async (email: string, item: { type: 'event' | 'play' | 'dining'; originalPrice: number; }) => {
    const pass = await getUserPass(email);

    if (!pass || pass.status !== 'active') {
        return {
            discountApplied: false,
            originalPrice: item.originalPrice,
            finalPrice: item.originalPrice,
            savings: 0
        };
    }

    const finalPrice = calculateDiscountedPrice(item.originalPrice, pass.discountPercentage);
    const savings = item.originalPrice - finalPrice;

    return {
        discountApplied: true,
        originalPrice: item.originalPrice,
        finalPrice,
        savings,
        discountPercentage: pass.discountPercentage,
        type: item.type
    };
};
