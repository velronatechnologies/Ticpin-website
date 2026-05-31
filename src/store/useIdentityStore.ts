import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSession, getUserSession, saveUserSession, clearUserSession } from '@/lib/auth/user';
import { OrganizerSession, getOrganizerSession, saveOrganizerSession, clearOrganizerSession } from '@/lib/auth/organizer';

export interface BillingDetails {
    name: string;
    phone: string;
    nationality: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

interface IdentityState {
    userSession: UserSession | null;
    organizerSession: OrganizerSession | null;
    activeRole: string | null;
    isLoading: boolean;
    rememberedEmail: string;
    rememberedBilling: BillingDetails | null;

    // Actions
    sync: () => void;
    setRememberedEmail: (email: string) => void;
    setRememberedBilling: (billing: BillingDetails) => void;
    loginUser: (session: UserSession) => void;
    loginOrganizer: (session: OrganizerSession) => void;
    logoutUser: () => void;
    logoutOrganizer: () => void;
    switchRole: (role: 'user' | 'organizer') => Promise<void>;
}

function getCookie(name: string): string {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : '';
}

export const useIdentityStore = create<IdentityState>()(
    persist(
        (set) => ({
            rememberedEmail: '',
            rememberedBilling: null,
            setRememberedEmail: (email) => set({ rememberedEmail: email }),
            setRememberedBilling: (billing) => set({ rememberedBilling: billing }),
    userSession: null,
    organizerSession: null,
    activeRole: null,
    isLoading: true,

    sync: () => {
        const user = getUserSession();
        const organizer = getOrganizerSession();
        let role = getCookie('active_role');
        if (!role) {
            if (user) role = 'user';
            else if (organizer) role = 'organizer';
            else role = 'guest';
        }
        set({
            userSession: user,
            organizerSession: organizer,
            activeRole: role,
            isLoading: false
        });
    },

    loginUser: (session) => {
        saveUserSession(session);
        set({ userSession: session, activeRole: 'user' });
    },

    loginOrganizer: (session) => {
        saveOrganizerSession(session);
        set({ organizerSession: session, activeRole: 'organizer' });
    },

    logoutUser: () => {
        clearUserSession();
        set({ userSession: null });
    },

    logoutOrganizer: () => {
        clearOrganizerSession();
        set({ organizerSession: null });
    },

    switchRole: async (role) => {
        try {
            const res = await fetch(`/backend/api/auth/switch/${role}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.ok) {
                if (typeof document !== 'undefined') {
                    document.cookie = `active_role=${role}; path=/; SameSite=Lax`;
                }
                set({ activeRole: role });
                window.location.reload();
            }
        } catch (err) {
            console.error('[Auth] Failed to switch role:', err);
        }
    }
        }),
        {
            name: 'identity-storage',
            partialize: (state) => ({ rememberedEmail: state.rememberedEmail, rememberedBilling: state.rememberedBilling }),
        }
    )
);
