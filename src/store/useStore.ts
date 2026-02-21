import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Booking {
    id: string;
    venue_name?: string;
    restaurant_name?: string;
    event_title?: string;
    sport?: string;
    date: string;
    time_slot: string;
    price?: number;
    guest_count?: number;
    ticket_type?: string;
    quantity?: number;
    unit_price?: number;
    total_price?: number;
    status: string;
    type: 'play' | 'dining' | 'event';
    created_at: string;
    updated_at: string;
}

// Ticket used for checkout (generic across play/dining/event)
interface Ticket {
    id: string;
    // display name — maps to ticket_type for events, sport for play, etc.
    name: string;
    // seat_type label if applicable
    seat_type?: string;
    price: number;
    // extra info lines
    description: string[];
    // how many the user selected
    quantity: number;
    // available stock from API (available_quantity)
    available?: number;
}

interface CheckoutData {
    id: string; // ID of the venue/event/restaurant
    name: string; // Name of the venue/event/restaurant
    sport?: string; // Optional sport or category
    date?: string; // Selected booking date (YYYY-MM-DD) for play/dining
    timeSlot?: string; // Selected time slot for play/dining
    tickets: Ticket[];
    bookingType: string;
}

interface SetupData {
    category: string;
    pan: string;
    pan_name: string;
    pan_image: string;
    pan_verification: any;
    gstin_mapping: any;
    has_gst: boolean;
    gstin: string;
    gst_details?: {
        has_gst: boolean;
        gstin: string;
    };
    bank_details: {
        account_holder_name: string;
        account_number: string;
        ifsc_code: string;
        bank_name: string;
        branch_name: string;
        city: string;
    };
    backup_contact: {
        name: string;
        email: string;
        phone: string;
    };
}

interface UserState {
    isLoggedIn: boolean;
    phone: string;
    email: string;
    isEmailVerified: boolean;
    isOrganizer: boolean;
    token: string | null;
    bookings: Booking[];
    checkoutData: CheckoutData | null;
    searchQuery: string;
    setupData: Partial<SetupData>;
    organizerCategory: string | null;
    organizerCategories: string[];
    isAdmin: boolean;
    userId: string;
    location: string;
    hasSetLocation: boolean;
    pendingOrganizerCategory: string | null;
    authModalState: {
        view: string | null;
        email: string;
        pendingCategory: string | null;
        emailOtpTimer: number;
        resendTimer: number;
    };
    setAuth: (phoneOrEmail: string, token: string, extra?: { email?: string; isEmailVerified?: boolean; isOrganizer?: boolean; organizerCategory?: string | null; organizerCategories?: string[]; isAdmin?: boolean; userId?: string }) => void;
    setOrganizerCategory: (category: string | null) => void;
    setOrganizerCategories: (categories: string[]) => void;
    setPendingOrganizerCategory: (category: string | null) => void;
    setAuthModalState: (state: Partial<UserState['authModalState']>) => void;
    clearAuth: () => void;
    setBookings: (bookings: Booking[]) => void;
    addBooking: (booking: Booking) => void;
    setCheckoutData: (data: CheckoutData | null) => void;
    clearCheckoutData: () => void;
    setSearchQuery: (query: string) => void;
    updateSetupData: (data: Partial<SetupData>) => void;
    clearSetupData: () => void;
    setLocation: (location: string) => void;
}

export const useStore = create<UserState>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            phone: '',
            email: '',
            isEmailVerified: false,
            isOrganizer: false,
            isAdmin: false,
            token: null,
            bookings: [],
            checkoutData: null,
            searchQuery: '',
            setupData: {},
            organizerCategory: null,
            organizerCategories: [],
            userId: '',
            location: '',
            hasSetLocation: false,
            pendingOrganizerCategory: null,
            authModalState: {
                view: null,
                email: '',
                pendingCategory: null,
                emailOtpTimer: 300,
                resendTimer: 120,
            },
            setAuth: (phoneOrEmail, token, extra) => set((state) => ({
                isLoggedIn: true,
                phone: phoneOrEmail.includes('@') ? '' : phoneOrEmail,
                email: extra?.email || (phoneOrEmail.includes('@') ? phoneOrEmail : ''),
                token,
                isEmailVerified: extra?.isEmailVerified ?? false,
                isOrganizer: extra?.isOrganizer ?? false,
                isAdmin: extra?.isAdmin ?? false,
                organizerCategory: extra?.organizerCategory !== undefined ? extra.organizerCategory : state.organizerCategory,
                organizerCategories: extra?.organizerCategories ?? state.organizerCategories,
                userId: extra?.userId ?? state.userId,
                authModalState: { view: null, email: '', pendingCategory: null, emailOtpTimer: 300, resendTimer: 120 }
            })),
            setOrganizerCategory: (category) => set({ organizerCategory: category }),
            setOrganizerCategories: (categories) => set({ organizerCategories: categories }),
            setPendingOrganizerCategory: (category) => set({ pendingOrganizerCategory: category }),
            setAuthModalState: (state) => set((prev) => ({
                authModalState: { ...prev.authModalState, ...state }
            })),
            clearAuth: () => set({
                isLoggedIn: false,
                phone: '',
                email: '',
                isEmailVerified: false,
                isOrganizer: false,
                isAdmin: false,
                token: null,
                bookings: [],
                checkoutData: null,
                organizerCategory: null,
                organizerCategories: [],
                pendingOrganizerCategory: null,
                userId: '',
                setupData: {},
                searchQuery: '',
                authModalState: { view: null, email: '', pendingCategory: null, emailOtpTimer: 300, resendTimer: 120 }
            }),
            setBookings: (bookings) => set({ bookings }),
            addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),
            setCheckoutData: (data) => set({ checkoutData: data }),
            clearCheckoutData: () => set({ checkoutData: null }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            updateSetupData: (data) => set((state) => ({ setupData: { ...state.setupData, ...data } })),
            clearSetupData: () => set({ setupData: {} }),
            setLocation: (location) => set({ location, hasSetLocation: true }),
        }),
        {
            name: 'ticpin-auth-store',
            // Only persist auth-related fields, not transient UI state
            partialize: (state) => ({
                isLoggedIn: state.isLoggedIn,
                phone: state.phone,
                email: state.email,
                isEmailVerified: state.isEmailVerified,
                isOrganizer: state.isOrganizer,
                isAdmin: state.isAdmin,
                token: state.token,
                organizerCategory: state.organizerCategory,
                organizerCategories: state.organizerCategories,
                userId: state.userId,
                location: state.location,
                hasSetLocation: state.hasSetLocation,
                setupData: state.setupData,
            }),
        }
    )
);
