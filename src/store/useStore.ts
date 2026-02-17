import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Booking {
    id: string;
    venue_name?: string;
    restaurant_name?: string;
    sport?: string;
    date: string;
    time_slot: string;
    price?: number;
    guest_count?: number;
    status: string;
    type: 'play' | 'dining';
    created_at?: string;
}

interface Ticket {
    id: string;
    name: string;
    price: number;
    description: string[];
    quantity: number;
}

interface CheckoutData {
    tickets: Ticket[];
    bookingType: string;
}

interface SetupData {
    category: string;
    pan: string;
    pan_name: string;
    pan_image: string;
    has_gst: boolean;
    gstin: string;
    bank_details: {
        account_holder_name: string;
        account_number: string;
        ifsc_code: string;
        bank_name: string;
        branch_name: string;
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
    isAdmin: boolean;
    userId: string;
    location: string;
    hasSetLocation: boolean;
    setAuth: (phoneOrEmail: string, token: string, extra?: { email?: string; isEmailVerified?: boolean; organizerCategory?: string | null; isAdmin?: boolean; userId?: string }) => void;
    setOrganizerCategory: (category: string | null) => void;
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
            userId: '',
            location: '',
            hasSetLocation: false,
            setAuth: (phoneOrEmail, token, extra) => set({
                isLoggedIn: true,
                phone: phoneOrEmail.includes('@') ? '' : phoneOrEmail,
                email: extra?.email || (phoneOrEmail.includes('@') ? phoneOrEmail : ''),
                token,
                isEmailVerified: extra?.isEmailVerified ?? false,
                isOrganizer: phoneOrEmail.includes('@'),
                isAdmin: extra?.isAdmin ?? (phoneOrEmail === '6383667872' || phoneOrEmail === '+916383667872'),
                organizerCategory: extra?.organizerCategory ?? null,
                userId: extra?.userId ?? ''
            }),
            setOrganizerCategory: (category) => set({ organizerCategory: category }),
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
                userId: ''
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
            name: 'ticpin-storage',
            partialize: (state) => ({
                isLoggedIn: state.isLoggedIn,
                phone: state.phone,
                email: state.email,
                isEmailVerified: state.isEmailVerified,
                isOrganizer: state.isOrganizer,
                token: state.token,
                bookings: state.bookings,
                setupData: state.setupData,
                organizerCategory: state.organizerCategory,
                userId: state.userId,
                location: state.location,
                hasSetLocation: state.hasSetLocation
            }),
        }
    )
);
