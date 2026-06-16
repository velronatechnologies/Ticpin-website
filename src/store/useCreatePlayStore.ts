import { create } from 'zustand';

interface Court {
    name: string;
    type: string;
    price: string;
    imageUrl: string;
}

interface Guide {
    facilities: string[];
    is_pet_friendly: boolean;
    is_alcohol_allowed: boolean;
    is_non_veg_allowed: boolean;
    has_dance_floor: boolean;
    allow_cancellations: boolean;
    has_changing_rooms: boolean;
    has_equipment_rentals: boolean;
    is_parking_available: boolean | null;
    early_arrival_time: string;
    interested_in_tournament: boolean | null;
}

interface Payment {
    organizerName: string;
    gstin: string;
    accountNumber: string;
    ifsc: string;
    accountType: string;
}

interface Schedule {
    openTime: string;
    closeTime: string;
    day?: string;
}

interface SlotConfig {
    duration: string;
    price: string;
    minDuration: string;
    pricePerSlot: string; // fallback or primary
}

interface CreatePlayState {
    venueName: string;
    venueAddress: string;
    instagramLink: string;
    googleMapLink: string;
    description: string;
    portraitUrl: string;
    landscapeUrl: string;
    secondaryBannerUrl: string;
    videoUrl: string;
    galleryUrls: string[];
    editingId?: string; // For edit flow
    selections: {
        category: string;
        subCategory: string;
        city: string;
    };
    guide: Guide;
    payment: Payment;
    pocs: { name: string; email: string; mobile: string }[];
    salesNotifs: { email: string; mobile: string }[];
    courts: Court[];

    // Additional Fields
    playInstructions: string;
    youtubeVideoUrl: string;
    prohibitedItems: string[];
    faqs: { question: string; answer: string }[];
    cancellationPolicy: string;
    dimensions: string[];

    // Management Step Fields
    venueFormat: 'fixed' | 'custom' | '';
    slotConfig: SlotConfig;
    weekdaySchedules: Schedule[];
    weekendSchedules: Schedule[];
    isWeekendPricingDifferent: boolean;
    weekendPrice: string;

    // Actions
    updateField: (field: string, value: any) => void;
    updateGuide: (updates: Partial<Guide>) => void;
    updatePayment: (updates: Partial<Payment>) => void;
    updateSelections: (updates: Partial<{ category: string; subCategory: string; city: string }>) => void;
    updateSlotConfig: (updates: Partial<SlotConfig>) => void;
    updateSchedule: (type: 'weekday' | 'weekend', index: number, updates: Partial<Schedule>) => void;
    addSchedule: (type: 'weekday' | 'weekend') => void;
    removeSchedule: (type: 'weekday' | 'weekend', index: number) => void;
    setGalleryUrls: (urls: string[]) => void;
    setCourts: (courts: Court[]) => void;
    setWeekdaySchedules: (schedules: Schedule[]) => void;
    setWeekendSchedules: (schedules: Schedule[]) => void;
    setPocs: (pocs: { name: string; email: string; mobile: string }[]) => void;
    setSalesNotifs: (notifs: { email: string; mobile: string }[]) => void;
    setProhibitedItems: (items: string[]) => void;
    setFaqs: (faqs: { question: string; answer: string }[]) => void;
    setDimensions: (dims: string[]) => void;
    setEditingId: (id: string | undefined) => void;
    reset: () => void;
}

const initialState: Omit<CreatePlayState, 'updateField' | 'updateGuide' | 'updatePayment' | 'updateSelections' | 'updateSlotConfig' | 'updateSchedule' | 'addSchedule' | 'removeSchedule' | 'setGalleryUrls' | 'setCourts' | 'setWeekdaySchedules' | 'setWeekendSchedules' | 'setPocs' | 'setSalesNotifs' | 'setProhibitedItems' | 'setFaqs' | 'setDimensions' | 'setEditingId' | 'reset'> = {
    venueName: '',
    venueAddress: '',
    instagramLink: '',
    googleMapLink: '',
    description: '',
    portraitUrl: '',
    landscapeUrl: '',
    secondaryBannerUrl: '',
    videoUrl: '',
    galleryUrls: [],
    editingId: undefined,
    selections: {
        category: 'Select Sport',
        subCategory: 'Select Court Type',
        city: 'Select City'
    },
    guide: {
        facilities: [],
        is_pet_friendly: false,
        is_alcohol_allowed: false,
        is_non_veg_allowed: false,
        has_dance_floor: false,
        allow_cancellations: false,
        has_changing_rooms: false,
        has_equipment_rentals: false,
        is_parking_available: null,
        early_arrival_time: '',
        interested_in_tournament: null,
    },
    payment: {
        organizerName: '',
        gstin: '',
        accountNumber: '',
        ifsc: '',
        accountType: ''
    },
    pocs: [],
    salesNotifs: [],
    courts: [],
    playInstructions: '',
    youtubeVideoUrl: '',
    prohibitedItems: [],
    faqs: [],
    cancellationPolicy: '',
    dimensions: [],
    venueFormat: '',
    slotConfig: {
        duration: '60',
        price: '',
        minDuration: '60',
        pricePerSlot: ''
    },
    weekdaySchedules: [{ openTime: '09:00 AM', closeTime: '10:00 PM' }],
    weekendSchedules: [{ openTime: '09:00 AM', closeTime: '10:00 PM' }],
    isWeekendPricingDifferent: false,
    weekendPrice: ''
};

export const useCreatePlayStore = create<CreatePlayState>((set) => ({
    ...initialState,

    updateField: (field, value) => set((state) => ({ ...state, [field]: value })),

    updateGuide: (updates) => set((state) => ({
        guide: { ...state.guide, ...updates }
    })),

    updatePayment: (updates) => set((state) => ({
        payment: { ...state.payment, ...updates }
    })),

    updateSelections: (updates) => set((state) => ({
        selections: { ...state.selections, ...updates }
    })),

    updateSlotConfig: (updates) => set((state) => ({
        slotConfig: { ...state.slotConfig, ...updates }
    })),
    updateSchedule: (type, index, updates) => set((state) => {
        const key = type === 'weekday' ? 'weekdaySchedules' : 'weekendSchedules';
        const newSchedules = [...state[key]];
        newSchedules[index] = { ...newSchedules[index], ...updates };
        return { [key]: newSchedules };
    }),
    addSchedule: (type) => set((state) => {
        const key = type === 'weekday' ? 'weekdaySchedules' : 'weekendSchedules';
        return { [key]: [...state[key], { openTime: '09:00 AM', closeTime: '10:00 PM' }] };
    }),
    removeSchedule: (type, index) => set((state) => {
        const key = type === 'weekday' ? 'weekdaySchedules' : 'weekendSchedules';
        return { [key]: state[key].filter((_, i) => i !== index) };
    }),

    setGalleryUrls: (galleryUrls) => set({ galleryUrls }),
    setCourts: (courts) => set({ courts }),
    setWeekdaySchedules: (weekdaySchedules) => set({ weekdaySchedules }),
    setWeekendSchedules: (weekendSchedules) => set({ weekendSchedules }),
    setPocs: (pocs) => set({ pocs }),
    setSalesNotifs: (salesNotifs) => set({ salesNotifs }),
    setProhibitedItems: (prohibitedItems) => set({ prohibitedItems }),
    setFaqs: (faqs) => set({ faqs }),
    setDimensions: (dimensions) => set({ dimensions }),
    setEditingId: (editingId) => set({ editingId }),
    reset: () => set(initialState)
}));
