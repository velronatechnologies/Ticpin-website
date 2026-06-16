'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, 
    Settings,
    LogOut, 
    X,
    Camera
} from 'lucide-react';
import { clearOrganizerSession, getOrganizerSession } from '@/lib/auth/organizer';
import Link from 'next/link';
import { organizerApi } from '@/lib/api/organizer';

interface UserSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
    const router = useRouter();
    const session = getOrganizerSession();
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    useEffect(() => {
        // Load profile photo on mount
        const loadProfilePhoto = async () => {
            try {
                const profile = await organizerApi.getProfile(session?.id || '');
                if (profile?.profilePhoto) {
                    setProfilePhoto(profile.profilePhoto);
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
            setProfilePhoto(customEvent.detail);
            // Also refetch from backend to ensure consistency
            if (session?.id) {
                organizerApi.getProfile(session.id).then(profile => {
                    if (profile?.profilePhoto) {
                        setProfilePhoto(profile.profilePhoto);
                    }
                }).catch(() => {});
            }
        };

        window.addEventListener('profilePhotoUpdated', handlePhotoUpdate as EventListener);

        return () => {
            window.removeEventListener('profilePhotoUpdated', handlePhotoUpdate as EventListener);
        };
    }, [session?.id]);

    const handleLogout = () => {
        clearOrganizerSession();
        router.push('/');
    };

    const userItems = [
        { 
            label: 'Profile', 
            icon: User, 
            path: '/organizer/profile',
            onClick: () => {
                router.push('/organizer/profile');
                onClose();
            }
        }
    ];

    return (
        <>

            {/* Sidebar */}
            <div 
                className={`fixed top-[114px] w-[280px] h-[calc(100vh-114px)] bg-white shadow-[-4px_0_15px_rgba(0,0,0,0.1)] z-[112] transition-all duration-300 ${
                    isOpen ? 'right-0' : 'right-[-280px]'
                }`}
            >
                <div className="flex flex-col h-full border-l border-zinc-200">
                    {/* Profile Section */}
                    <div className="p-6 border-b border-zinc-100">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center">
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} className="text-zinc-400" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-zinc-500 truncate">
                                    {session?.email || 'Organizer Account'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 pt-4">
                        {userItems.map((item, index) => (
                            <React.Fragment key={item.label}>
                                <button
                                    onClick={item.onClick}
                                    className="w-full flex items-center justify-between px-8 py-6 group hover:bg-zinc-50 transition-all text-left"
                                >
                                    <span className="text-[20px] font-medium text-zinc-900 group-hover:translate-x-1 transition-transform" style={{ fontFamily: 'Anek Latin' }}>
                                        {item.label}
                                    </span>
                                    <item.icon size={20} className="text-zinc-500" />
                                </button>
                                {index < userItems.length - 1 && (
                                    <div className="mx-8 border-b border-zinc-100" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Footer with Logout and Session Info */}
                    <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 space-y-4">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between text-zinc-900 font-bold hover:text-red-500 transition-colors"
                        >
                            <span className="text-[18px]">Log Out</span>
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
