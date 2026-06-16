'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Utensils, Ticket, Gamepad2, X } from 'lucide-react';
import ProfileSidebar from './ProfileSidebar';
import UserSidebar from './UserSidebar';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { organizerApi } from '@/lib/api/organizer';

interface OrganizerHeaderProps {
    activeTab?: 'events' | 'play' | 'dining';
    firstItemLabel?: string;
}

export default function OrganizerHeader({ activeTab, firstItemLabel }: OrganizerHeaderProps) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialPhoto = async () => {
            const session = getOrganizerSession();
            if (session?.id) {
                try {
                    const profile = await organizerApi.getProfile(session.id);
                    if (profile?.profilePhoto) {
                        setProfilePhoto(profile.profilePhoto);
                    }
                } catch (err) {}
            }
        };
        fetchInitialPhoto();

        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent;
            setProfilePhoto(customEvent.detail);
            // Also refetch from backend to ensure consistency
            const session = getOrganizerSession();
            if (session?.id) {
                organizerApi.getProfile(session.id).then(profile => {
                    if (profile?.profilePhoto) {
                        setProfilePhoto(profile.profilePhoto);
                    }
                }).catch(() => {});
            }
        };
        window.addEventListener('profilePhotoUpdated', handleUpdate as EventListener);
        return () => window.removeEventListener('profilePhotoUpdated', handleUpdate as EventListener);
    }, []);

    const switcherItems = [
        { id: 'dining', label: 'Dining' },
        { id: 'events', label: 'Events' },
        { id: 'play', label: 'Play' },
    ];

    return (
        <>
            <header className="w-full h-[70px] bg-white flex items-center justify-between px-4 md:px-10 z-[10] relative border-b border-zinc-200">
                <div className="flex items-center gap-8">
                    <button onClick={() => router.push('/')} className="">
                        <img
                            src="/ticpin-logo-black.png"
                            alt="TICPIN"
                            className="h-5 md:h-7 w-auto object-contain"
                        />
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {/* Profile Avatar/Cross button -> Opens User Settings Sidebar */}
                    <button
                        onClick={() => {
                            if (isUserOpen) setIsUserOpen(false);
                            else {
                                setIsUserOpen(true);
                                setIsMenuOpen(false);
                            }
                        }}
                        className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-all ${isUserOpen ? 'bg-zinc-100' : 'bg-zinc-200 border-2 border-white'}`}
                    >
                        {isUserOpen ? (
                            <X className="text-black" size={24} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nala"
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        )}
                    </button>

                    {/* Hamburger/Cross Menu -> Opens Main Navigation Sidebar */}
                    <button
                        onClick={() => {
                            if (isMenuOpen) setIsMenuOpen(false);
                            else {
                                setIsMenuOpen(true);
                                setIsUserOpen(false);
                            }
                        }}
                        className="p-2 text-black rounded-lg transition-colors flex items-center justify-center"
                    >
                        {isMenuOpen ? (
                            <X size={28} />
                        ) : (
                            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="8" y="14" width="24" height="3" rx="1.5" fill="black" />
                                <rect x="8" y="23" width="24" height="3" rx="1.5" fill="black" />
                            </svg>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Navigation Sidebar (All Events, Payouts, etc.) */}
            <ProfileSidebar 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                firstItemLabel={firstItemLabel}
                activeTab={activeTab}
            />

            {/* User Account Sidebar (Profile, Settings) */}
            <UserSidebar 
                isOpen={isUserOpen}
                onClose={() => setIsUserOpen(false)}
            />
        </>
    );
}
