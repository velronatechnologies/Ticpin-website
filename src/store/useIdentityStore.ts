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
    startSessionMonitor: () => void; // BUG FIX #3: Monitor session expiration
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
                // BUG FIX #1 & #2: Comprehensive cleanup before role switch
                if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
                    // Clear all booking-related sessionStorage keys
                    const bookingKeys = [
                        'event_cart',
                        'dining_cart',
                        'play_cart',
                        'payment_attempt',
                        'reservation_timer',
                        'event_booking_pending',
                        'dining_booking_pending',
                        'play_booking_pending',
                    ];
                    bookingKeys.forEach(key => sessionStorage.removeItem(key));
                    
                    // Clear lock key to force regeneration for new role
                    localStorage.removeItem('ticpin_lock_key');
                    
                    console.debug('[Auth] Cleaned up state before role switch to:', role);
                }
                
                if (typeof document !== 'undefined') {
                    document.cookie = `active_role=${role}; path=/; SameSite=Lax`;
                }
                set({ activeRole: role });
                window.location.reload();
            }
        } catch (err) {
            console.error('[Auth] Failed to switch role:', err);
        }
    },

    // BUG FIX #3: Monitor session expiration and sync cookie state with Zustand
    startSessionMonitor: () => {
        if (typeof window === 'undefined') return;
        
        const checkSessionValidity = () => {
            const state = useIdentityStore.getState();
            
            // Check if user session still valid
            if (state.userSession) {
                const hasCookie = document.cookie.includes('ticpin_user_token');
                if (!hasCookie) {
                    console.warn('[Auth] User session expired (cookie missing)');
                    clearUserSession();
                    set({ userSession: null, activeRole: 'guest' });
                    return;
                }
            }
            
            // Check if organizer session still valid
            if (state.organizerSession) {
                const hasCookie = document.cookie.includes('ticpin_token');
                if (!hasCookie) {
                    console.warn('[Auth] Organizer session expired (cookie missing)');
                    clearOrganizerSession();
                    set({ organizerSession: null, activeRole: 'guest' });
                    return;
                }
            }
        };
        
        // Run check immediately
        checkSessionValidity();
        
        // Check every 30 seconds
        const intervalId = setInterval(checkSessionValidity, 30000);
        
        // Cleanup interval on store unmount (if needed)
        return () => clearInterval(intervalId);
    },
        }),
        {
            name: 'identity-storage',
            partialize: (state) => ({ rememberedEmail: state.rememberedEmail, rememberedBilling: state.rememberedBilling }),
        }
    )
);
