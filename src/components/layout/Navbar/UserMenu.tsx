'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Ticket, Utensils, Gamepad2, User } from 'lucide-react';
import type { OrganizerSession } from '@/lib/auth/organizer';
import type { UserSession } from '@/lib/auth/user';
import { organizerApi } from '@/lib/api/organizer';

interface UserMenuProps {
    session: OrganizerSession | null;
    userSession: UserSession | null;
    isMenuOpen: boolean;
    onToggleMenu: () => void;
    onUserLogout: () => void;
    onOrganizerLogout: () => void;
    onOpenProfile: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({
    session,
    userSession,
    isMenuOpen,
    onToggleMenu,
    onUserLogout,
    onOrganizerLogout,
    onOpenProfile,
}) => {
    const router = useRouter();
    const [organizerProfilePhoto, setOrganizerProfilePhoto] = useState<string | null>(null);

    useEffect(() => {
        // Load organizer profile photo on mount
        const loadProfilePhoto = async () => {
            try {
                const profile = await organizerApi.getProfile(session?.id || '');
                if (profile?.profilePhoto) {
                    setOrganizerProfilePhoto(profile.profilePhoto);
                }
            } catch (err) {
                // Ignore error if profile doesn't exist
            }
        };

        if (session?.id) {
            loadProfilePhoto();
        }

        // Listen for profile photo updates
        const handlePhotoUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            setOrganizerProfilePhoto(customEvent.detail);
            // Also refetch from backend to ensure consistency
            if (session?.id) {
                organizerApi.getProfile(session.id).then(profile => {
                    if (profile?.profilePhoto) {
                        setOrganizerProfilePhoto(profile.profilePhoto);
                    }
                }).catch(() => {});
            }
        };

        window.addEventListener('profilePhotoUpdated', handlePhotoUpdate as EventListener);

        return () => {
            window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate as EventListener);
        };
    }, [session?.id]);

    const dashboardHref = session
        ? `/organizer/dashboard?category=${session.vertical}`
        : '/organizer/dashboard';

    return (
        <div className="relative">
            <div
                onClick={onToggleMenu}
                className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:ring-2 hover:ring-offset-2 ring-[#5331EA]/50 overflow-hidden aspect-square shrink-0 bg-zinc-100"
            >
                {session ? (
                    organizerProfilePhoto ? (
                        <Image
                            src={organizerProfilePhoto}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-zinc-900 text-[14px] font-bold uppercase">
                            {session.email.charAt(0)}
                        </span>
                    )
                ) : userSession ? (
                    userSession.profilePhoto ? (
                        <Image
                            src={userSession.profilePhoto}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-white text-[14px] font-bold uppercase bg-[#866BFF] w-full h-full rounded-full flex items-center justify-center">
                            {userSession.name?.charAt(0) || 'U'}
                        </span>
                    )
                ) : (
                    <User size={20} className="text-zinc-500" />
                )}
            </div>
        </div>
    );
};

export default UserMenu;
