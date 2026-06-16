'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizerSession } from '@/lib/auth/organizer';
import { toast } from '@/components/ui/Toast';
import dynamic from 'next/dynamic';

const LayoutBuilder = dynamic(
    () => import('@/layout-editor/features/layout-builder/components/LayoutBuilder').then((mod) => mod.LayoutBuilder),
    { 
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center bg-[#D3CBF5]/10">
                <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-[#AC9BF7] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[16px] text-zinc-500">Loading Canvas Editor...</p>
                </div>
            </div>
        )
    }
);

export default function TicketLayoutEditorPage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);
    const [initialLayout, setInitialLayout] = useState<any>(undefined);

    useEffect(() => {
        const session = getOrganizerSession();
        if (!session) {
            toast.error('Authentication required');
            router.push('/list-your-events/Login');
            return;
        }

        if (!session.isAdmin && session.categoryStatus?.events !== 'approved') {
            toast.error('Events category approval required');
            router.push('/list-your-events/Login');
            return;
        }

        // Load existing layout JSON if it exists in sessionStorage
        const existingLayoutStr = sessionStorage.getItem('ticket-layout-json');
        if (existingLayoutStr) {
            try {
                setInitialLayout(JSON.parse(existingLayoutStr));
            } catch (e) {
                console.error('Error parsing existing layout JSON:', e);
            }
        }

        setAuthChecked(true);
    }, [router]);

    const handleSave = (layout: any) => {
        if (!window.confirm('Are you sure you want to save this layout and map its ticket categories?')) {
            return;
        }

        try {
            const layoutJsonStr = JSON.stringify(layout);
            
            // Extract sections of type "class" to map as ticket categories
            const classSections = (layout.elements || [])
                .filter((el: any) => el.type === 'section' && el.sectionType === 'class')
                .map((el: any) => ({
                    name: el.name || 'Unnamed Class',
                    price: String(el.price || '0'),
                    capacity: String(el.capacity || '0'),
                    image_url: '',
                    has_image: false,
                }));

            // Store in sessionStorage
            sessionStorage.setItem('ticket-layout-json', layoutJsonStr);
            sessionStorage.setItem('ticket-layout-categories', JSON.stringify(classSections));
            sessionStorage.setItem('is-layout-based', 'true');

            toast.success('Layout saved and ticket categories mapped!');

            // Return to event creation/editing
            const returnUrl = sessionStorage.getItem('ticket-editor-return-url') || '/events/create';
            router.push(returnUrl);
        } catch (error) {
            console.error('Failed to map and save layout:', error);
            toast.error('Failed to save layout configuration');
        }
    };

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#D3CBF5]/10">
                <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-[#AC9BF7] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[16px] text-zinc-500">Verifying authorization...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden">
            <LayoutBuilder 
                initialLayout={initialLayout} 
                onSave={handleSave} 
            />
        </div>
    );
}
