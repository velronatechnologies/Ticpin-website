import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Poc {
    name: string;
    email: string;
    mobile: string;
}

export interface SalesNotif {
    email: string;
    mobile: string;
}

export interface Faq {
    question: string;
    answer: string;
}

export interface Court {
    name: string;
    type: string;
    price: string;
    image_url: string;
}

export interface PaymentDetails {
    organizerName: string;
    gstin: string;
    accountNumber: string;
    ifsc: string;
    accountType: string;
}

export interface Selections {
    category: string;
    subCategory: string;
    city: string;
}

export interface PlayCreateState {
    venueName: string;
    description: string;
    portraitUrl: string;
    landscapeUrl: string;
    secondaryBannerUrl: string;
    videoUrl: string;
    galleryUrls: string[];
    instagramLink: string;
    googleMapLink: string;
    venueAddress: string;

    timeHour: string;
    timeMinute: string;
    timePeriod: string;
    closeHour: string;
    closeMinute: string;
    closePeriod: string;

    facilities: string[];
    petFriendly: string;
    outsideFood: string;
    venueLocationType: string;
    surfaceType: string;
    cancellations: string;
    changingRooms: string;
    equipmentRentals: string;
    maxDuration: string;

    payment: PaymentDetails;
    pocs: Poc[];
    salesNotifs: SalesNotif[];
    
    playInstructions: string;
    youtubeVideoUrl: string;
    prohibitedItems: string[];
    faqs: Faq[];
    courts: Court[];

    selections: Selections;

    // Actions
    setField: (field: keyof Omit<PlayCreateState, 'setField' | 'setPaymentField' | 'setSelection' | 'addFacility' | 'removeFacility' | 'addGalleryUrl' | 'addProhibitedItem' | 'removeProhibitedItem' | 'addFaq' | 'removeFaq' | 'addPoc' | 'removePoc' | 'addSalesNotif' | 'removeSalesNotif' | 'clearDraft'>, value: any) => void;
    setPaymentField: (field: keyof PaymentDetails, value: string) => void;
    setSelection: (field: keyof Selections, value: string) => void;
    
    toggleFacility: (facility: string) => void;
    addGalleryUrl: (url: string) => void;
    
    addProhibitedItem: (item: string) => void;
    removeProhibitedItem: (index: number) => void;
    
    addFaq: (faq: Faq) => void;
    removeFaq: (index: number) => void;
    
    addPoc: (poc: Poc) => void;
    removePoc: (index: number) => void;
    
    addSalesNotif: (notif: SalesNotif) => void;
    removeSalesNotif: (index: number) => void;
    
    clearDraft: () => void;
}

const initialState = {
    venueName: '',
    description: '',
    portraitUrl: '',
    landscapeUrl: '',
    secondaryBannerUrl: '',
    videoUrl: '',
    galleryUrls: [],
    instagramLink: '',
    googleMapLink: '',
    venueAddress: '',

    timeHour: '',
    timeMinute: '',
    timePeriod: 'AM',
    closeHour: '',
    closeMinute: '',
    closePeriod: 'PM',

    facilities: [],
    petFriendly: '',
    outsideFood: '',
    venueLocationType: '',
    surfaceType: '',
    cancellations: '',
    changingRooms: '',
    equipmentRentals: '',
    maxDuration: '',

    payment: {
        organizerName: '',
        gstin: '',
        accountNumber: '',
        ifsc: '',
        accountType: ''
    },
    pocs: [],
    salesNotifs: [],
    
    playInstructions: '',
    youtubeVideoUrl: '',
    prohibitedItems: [],
    faqs: [],
    courts: [],

    selections: {
        category: 'Select Sport',
        subCategory: 'Select Court Type',
        city: 'Select City'
    }
};

export const usePlayCreateStore = create<PlayCreateState>()(
    persist(
        (set) => ({
            ...initialState,

            setField: (field, value) => set({ [field]: value }),
            
            setPaymentField: (field, value) => set((state) => ({
                payment: { ...state.payment, [field]: value }
            })),
            
            setSelection: (field, value) => set((state) => ({
                selections: { ...state.selections, [field]: value }
            })),

            toggleFacility: (facility) => set((state) => ({
                facilities: state.facilities.includes(facility)
                    ? state.facilities.filter(f => f !== facility)
                    : [...state.facilities, facility]
            })),

            addGalleryUrl: (url) => set((state) => ({
                galleryUrls: [...state.galleryUrls, url]
            })),

            addProhibitedItem: (item) => set((state) => ({
                prohibitedItems: [...state.prohibitedItems, item]
            })),
            
            removeProhibitedItem: (index) => set((state) => ({
                prohibitedItems: state.prohibitedItems.filter((_, i) => i !== index)
            })),

            addFaq: (faq) => set((state) => ({
                faqs: [...state.faqs, faq]
            })),
            
            removeFaq: (index) => set((state) => ({
                faqs: state.faqs.filter((_, i) => i !== index)
            })),

            addPoc: (poc) => set((state) => ({
                pocs: [...state.pocs, poc]
            })),
            
            removePoc: (index) => set((state) => ({
                pocs: state.pocs.filter((_, i) => i !== index)
            })),

            addSalesNotif: (notif) => set((state) => ({
                salesNotifs: [...state.salesNotifs, notif]
            })),
            
            removeSalesNotif: (index) => set((state) => ({
                salesNotifs: state.salesNotifs.filter((_, i) => i !== index)
            })),

            clearDraft: () => set(initialState),
        }),
        {
            name: 'play-create-storage',
            // Only persist fields that make sense to persist
        }
    )
);
