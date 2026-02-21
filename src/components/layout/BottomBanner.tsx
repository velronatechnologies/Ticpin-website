'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserPass } from '@/lib/passUtils';

export default function BottomBanner() {
    const [userHasActivePass, setUserHasActivePass] = useState(false);

    useEffect(() => {
        // Check if user has active pass
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userPass = await getUserPass(user.email || undefined, user.phoneNumber || undefined);
                setUserHasActivePass(userPass?.status === 'active' || false);
            } else {
                setUserHasActivePass(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Don't render if user already has active pass
    if (userHasActivePass) {
        return null;
    }

    return (
        <div className="px-4 py-8">
            <Link
                href="/ticpin-pass"
                className="block max-w-[1100px] mx-auto hover:scale-[1.02] transition-transform duration-300"
            >
                <Image
                    src="/ticpin banner.jpg"
                    alt="Ticpin Pass Banner"
                    width={1366}
                    height={455}
                    className="w-full h-auto rounded-[30px] shadow-lg"
                />
            </Link>
        </div>
    );
}
