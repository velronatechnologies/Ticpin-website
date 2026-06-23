'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Percent, Tag, ChevronRight, Clock, User, ChevronDown, TriangleAlert, Edit2, Info, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useIdentityStore } from '@/store/useIdentityStore';

interface CartData {
    eventId: string;
    eventName: string;
    city: string;
    tickets: { name: string; price: number; quantity: number }[];
    totalPrice: number;
    type?: 'event';
    date?: string;
    timeSlot?: string;
}

interface MobileReviewBookingProps {
    cart: CartData | null;
    step: 'review' | 'billing' | 'success';
    setStep: (step: 'review' | 'billing' | 'success') => void;
    timeRemaining: number;
    formatTimer: (seconds: number) => string;
    eventData: { 
        id: string; 
        name: string; 
        portrait_image_url?: string; 
        landscape_image_url?: string;
        venue_address?: string;
        venue_name?: string;
        city?: string;
    } | null;
    offers: any[];
    expandedSection: 'none' | 'offers' | 'coupons';
    toggleSection: (sec: 'none' | 'offers' | 'coupons') => void;
    couponInput: string;
    setCouponInput: (val: string) => void;
    validateCoupon: () => void;
    couponLoading: boolean;
    couponError: string;
    couponSuccess: string;
    applyOffer: (offer: any) => void;
    removeOffer: () => void;
    removeCoupon: () => void;
    orderAmount: number;
    bookingFee: number;
    totalDiscount: number;
    grandTotal: number;
    billing: {
        name: string;
        phone: string;
        nationality: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    setBilling: (val: any) => void;
    firstName: string;
    setFirstName: (val: string) => void;
    lastName: string;
    setLastName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    handlePayNow: () => Promise<void>;
    handleContinue: () => void;
    bookingError: string;
    setBookingError: (val: string) => void;
    bookingLoading: boolean;
    acceptedTerms: boolean;
    setAcceptedTerms: (val: boolean) => void;
    removeTicket: (index: number) => void;
    phoneInputValue: string;
    handlePhoneChange: (e: any) => void;
    
    // New props passed from page.tsx
    onBack: () => void;
    donationAmount: number;
    setDonationAmount: (val: number) => void;
    isDonationAdded: boolean;
    setIsDonationAdded: (val: boolean) => void;
    isDonationEdited: boolean;
    setIsDonationEdited: (val: boolean) => void;
}

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
];

export default function MobileReviewBooking({
    cart,
    timeRemaining,
    formatTimer,
    eventData,
    offers,
    expandedSection,
    toggleSection,
    couponInput,
    setCouponInput,
    validateCoupon,
    couponLoading,
    couponError,
    couponSuccess,
    applyOffer,
    orderAmount,
    bookingFee,
    totalDiscount,
    grandTotal,
    billing,
    setBilling,
    email,
    setEmail,
    handlePayNow,
    bookingError: checkoutError,
    setBookingError,
    bookingLoading,
    removeTicket,
    onBack,
    donationAmount,
    setDonationAmount,
    isDonationAdded,
    setIsDonationAdded,
    isDonationEdited,
    setIsDonationEdited,
    acceptedTerms,
    setAcceptedTerms,
}: MobileReviewBookingProps) {
    const identity = useIdentityStore();
    const userSession = identity.userSession;

    const [showGstDetails, setShowGstDetails] = useState(false);
    const [isEditingBilling, setIsEditingBilling] = useState(false);

    // Auto-fetch profile fields on mount or when userSession/identity updates
    useEffect(() => {
        if (userSession) {
            if (!billing.name && userSession.name) {
                setBilling((prev: any) => ({ ...prev, name: userSession.name }));
            }
            if (!billing.phone && userSession.phone) {
                setBilling((prev: any) => ({ ...prev, phone: userSession.phone }));
            }
            if (!email && userSession.email) {
                setEmail(userSession.email);
            }
        }

        // Also fetch from rememberedBilling in the identity store if available
        const remembered = identity.rememberedBilling;
        if (remembered) {
            setBilling((prev: any) => ({
                ...prev,
                name: prev.name || remembered.name || '',
                phone: prev.phone || remembered.phone || '',
                state: prev.state || remembered.state || '',
                nationality: prev.nationality || remembered.nationality || 'Indian resident',
                address: prev.address || remembered.address || '',
                city: prev.city || remembered.city || '',
                pincode: prev.pincode || remembered.pincode || '',
            }));
        }
    }, [userSession, identity.rememberedBilling, setBilling, setEmail]);

    const fmtDate = (iso: string) => {
        if (!iso) return '';
        const d = new Date(iso + 'T00:00:00');
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const venueFirstSegment = eventData?.venue_address
        ? eventData.venue_address.split(',')[0].trim()
        : '';
    const venueName = venueFirstSegment || eventData?.venue_name || '';
    const cityName = eventData?.city || cart?.city || '';

    // Active Display Variables
    const activeName = billing.name || userSession?.name || '';
    const activePhone = billing.phone || userSession?.phone || '';
    const activeEmail = email || userSession?.email || '';
    const activeState = billing.state || '';

    const hasMissingDetails = !activeName || !activePhone || !activeEmail || !activeState;

    useEffect(() => {
        if (hasMissingDetails) {
            setIsEditingBilling(true);
        }
    }, [hasMissingDetails]);

    if (!cart) return null;

    return (
        <div className="md:hidden fixed inset-0 z-[140] bg-white font-sans overflow-y-auto pb-32 flex flex-col" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
            {/* Header Section */}
            <div className="fixed top-0 left-0 w-full bg-white h-[60px] shrink-0 flex items-center px-4 z-50 border-b border-[#EFEFEF]">
                <h1 className="ml-2 text-[18px] font-semibold text-black">Review your booking</h1>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-grow w-full mt-[60px] overflow-y-auto pb-[100px]">
                {/* Timer Banner - Rectangle 524 */}
                {timeRemaining > 0 && (
                    <div className="mx-4 mt-2 h-[29px] bg-[#E1E1E1] rounded-[8px] flex items-center justify-center">
                        <span className="text-[12px] font-medium text-black">
                            Complete your booking in <span className="text-[#5331EA] font-semibold">{formatTimer(timeRemaining)}</span> mins
                        </span>
                    </div>
                )}

                {/* Event Summary Section */}
                <div className="px-4 mt-6 flex gap-4">
                    {/* Event Image */}
                    <div className="w-[87px] h-[98px] bg-[#110D2C] rounded-[10px] overflow-hidden shrink-0 relative">
                        {eventData?.landscape_image_url || eventData?.portrait_image_url ? (
                            <Image
                                src={eventData.landscape_image_url || eventData.portrait_image_url || ''}
                                alt={cart.eventName}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full p-2 flex flex-col items-center justify-center bg-[#110D2C]">
                                <span className="text-[10px] text-[#DFFF00] font-black italic leading-[0.8] text-center">THE TICPIN<br />PLAY<br />FESTIVAL</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-[15px] font-medium text-black leading-tight uppercase">{cart.eventName}</h2>
                        <div className="mt-2 text-[13px] font-normal text-[#686868] uppercase">
                            <p>{venueName}</p>
                            <p>{cityName}</p>
                        </div>
                    </div>
                </div>

                {/* Event Details Card - Rectangle 525 */}
                <div className="mx-4 mt-6 border border-[#D9D9D9] rounded-[9px] p-4 bg-white">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[15px] font-medium text-black">
                            {cart.date ? fmtDate(cart.date) : 'Date'}
                        </span>
                        {cart.timeSlot && (
                            <span className="text-[15px] font-medium text-black">{cart.timeSlot}</span>
                        )}
                    </div>

                    <div className="w-full h-[0.7px] bg-[#D9D9D9] mb-4" />

                    <div className="space-y-4">
                        {cart.tickets?.map((t, i) => (
                            <div key={i} className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-[18px] font-medium text-black">{t.quantity} x {t.name}</h3>
                                    <p className="text-[15px] font-normal text-black mt-1">₹{t.price.toLocaleString('en-IN')} cover</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[18px] font-medium text-black">₹{(t.price * t.quantity).toLocaleString('en-IN')}</span>
                                    <button
                                        onClick={() => removeTicket(i)}
                                        className="text-[12px] font-semibold text-[#686868] mt-1 relative pb-[3px] active:scale-95 transition-transform"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle, #686868 1.5px, transparent 1.5px)',
                                            backgroundPosition: '0 100%',
                                            backgroundSize: '6px 3px',
                                            backgroundRepeat: 'repeat-x'
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Offers Section */}
                <div className="px-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">OFFERS</h3>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="border border-[#D9D9D9] rounded-[9px] overflow-hidden bg-white">
                        <button 
                            type="button"
                            onClick={() => toggleSection(expandedSection === 'offers' ? 'none' : 'offers')}
                            className="w-full h-[55px] flex items-center justify-between px-4 active:bg-zinc-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Percent size={19} className="text-black" />
                                <span className="text-[18px] font-medium text-black">View all event offers</span>
                            </div>
                            <ChevronRight size={20} className={`text-zinc-400 transition-transform duration-200 ${expandedSection === 'offers' ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {expandedSection === 'offers' && (
                            <div className="p-4 bg-zinc-50 border-t border-[#D9D9D9] space-y-2 animate-in fade-in duration-200">
                                {offers.length > 0 ? (
                                    offers.map(o => (
                                        <div key={o.id} className="flex justify-between items-center p-2 bg-white rounded border border-[#D9D9D9]">
                                            <div>
                                                <p className="font-bold text-[13px] text-black">{o.code}</p>
                                                <p className="text-[11px] text-[#686868]">{o.description}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => applyOffer(o)}
                                                className="px-2.5 py-1 bg-black text-white rounded text-[11px] font-bold"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[12px] text-[#686868] italic text-center">No offers available for this event</p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-center">
                            <div className="w-[85%] h-[0.7px] bg-[#D9D9D9]" />
                        </div>

                        <button 
                            type="button"
                            onClick={() => toggleSection(expandedSection === 'coupons' ? 'none' : 'coupons')}
                            className="w-full h-[55px] flex items-center justify-between px-4 active:bg-zinc-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Tag size={19} className="text-black" />
                                <span className="text-[18px] font-medium text-black">View all coupon codes</span>
                            </div>
                            <ChevronRight size={20} className={`text-zinc-400 transition-transform duration-200 ${expandedSection === 'coupons' ? 'rotate-90' : ''}`} />
                        </button>

                        {expandedSection === 'coupons' && (
                            <div className="p-4 bg-zinc-50 border-t border-[#D9D9D9] space-y-3 animate-in fade-in duration-200">
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 border border-[#AEAEAE] rounded-[8px] px-3 h-[40px] text-[14px] font-medium outline-none bg-white text-black"
                                        placeholder="Enter coupon code"
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                    />
                                    <button
                                        type="button"
                                        onClick={validateCoupon}
                                        disabled={couponLoading}
                                        className="px-4 bg-black text-white rounded-[8px] text-[13px] font-bold active:scale-95 transition-transform"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && <p className="text-red-500 text-[12px]">{couponError}</p>}
                                {couponSuccess && <p className="text-green-600 text-[12px]">{couponSuccess}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Summary */}
                {checkoutError && (
                    <div className="mx-4 mt-4 flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
                        <TriangleAlert size={14} className="shrink-0" />
                        <span>{checkoutError}</span>
                    </div>
                )}

                {/* Payment Details Section */}
                <div className="px-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">PAYMENT DETAILS</h3>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="border border-[#D9D9D9] rounded-[9px] p-4 bg-white overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[17px] font-semibold text-black">Order amount</h4>
                            <span className="text-[17px] font-semibold text-black">₹{formatPrice(orderAmount)}</span>
                        </div>
                        
                        <div className="flex flex-col mb-2">
                            <div 
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setShowGstDetails(!showGstDetails)}
                            >
                                <div className="flex items-center gap-1">
                                    <span className="text-[12px] font-normal text-black">Fees and charges (inc. of GST)</span>
                                    <ChevronRight size={14} className={`text-black transition-transform duration-300 ${showGstDetails ? 'rotate-90' : ''}`} />
                                </div>
                                <span className="text-[12px] font-normal text-black">₹{formatPrice(bookingFee)}</span>
                            </div>
                            {showGstDetails && (
                                <div className="pl-4 pr-1 mt-2 mb-1 space-y-2 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                                    <div className="flex justify-between text-[11px] text-[#686868] font-medium">
                                        <span>Base Platform Fee</span>
                                        <span>₹{formatPrice(bookingFee / 1.18)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] text-[#686868] font-medium">
                                        <span>Integrated GST (18%)</span>
                                        <span>₹{formatPrice(bookingFee - (bookingFee / 1.18))}</span>
                                    </div>
                                    <div className="h-[0.5px] bg-[#EBEBEB] w-full" />
                                </div>
                            )}
                        </div>

                        {totalDiscount > 0 && (
                            <div className="flex justify-between items-center mb-2 text-green-600">
                                <span className="text-[12px] font-normal">Discount</span>
                                <span className="text-[12px] font-normal font-bold">-₹{formatPrice(totalDiscount)}</span>
                            </div>
                        )}
                        <div className="w-full h-[0.7px] bg-[#D9D9D9] my-2" />
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="text-[15px] font-semibold text-black">Grand Total</h4>
                            <span className="text-[17px] font-semibold text-black">₹{formatPrice(grandTotal)}</span>
                        </div>
                    </div>
                </div>

                {/* Billing Details Section */}
                <div className="px-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">BILLING DETAILS</h3>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    {isEditingBilling ? (
                        <div className="border border-[#AEAEAE] rounded-[9px] p-4 bg-white space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[15px] font-medium text-black">Edit Billing Details</span>
                                <button 
                                    onClick={() => setIsEditingBilling(false)}
                                    className="text-[12px] font-semibold text-black border border-black rounded-[5px] px-2 py-0.5 hover:bg-black hover:text-white transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[12px] font-semibold text-zinc-500">Name</label>
                                    <input 
                                        type="text" 
                                        value={billing.name || ''}
                                        onChange={e => {
                                            setBilling((prev: any) => ({ ...prev, name: e.target.value }));
                                            setBookingError('');
                                        }}
                                        placeholder="Enter Name"
                                        className="w-full h-[40px] border border-[#D9D9D9] rounded-[8px] px-3 text-[14px] font-medium outline-none text-black bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[12px] font-semibold text-zinc-500">Phone</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none">
                                            {/* India Flag */}
                                            <div className="flex flex-col w-[13.39px] h-[12.54px] rounded-[1px] overflow-hidden shrink-0">
                                                <div className="h-[4.18px] bg-[#F28623]" />
                                                <div className="h-[4.18px] bg-[#F0F5F9] flex items-center justify-center">
                                                    <div className="w-[3px] h-[3px] rounded-full bg-[#00247D]" />
                                                </div>
                                                <div className="h-[4.18px] bg-[#65B54E]" />
                                            </div>
                                            <span className="text-zinc-500 text-[14px] font-semibold">+91</span>
                                        </div>
                                        <input 
                                            type="tel" 
                                            maxLength={10}
                                            value={billing.phone || ''}
                                            onChange={e => {
                                                setBilling((prev: any) => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }));
                                                setBookingError('');
                                            }}
                                            placeholder="Enter Phone Number"
                                            className="w-full h-[40px] border border-[#D9D9D9] rounded-[8px] pr-3 text-[14px] font-medium outline-none text-black bg-white"
                                            style={{ paddingLeft: '64px' }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[12px] font-semibold text-zinc-500">Email</label>
                                    <input 
                                        type="email" 
                                        value={email || ''}
                                        onChange={e => {
                                            setEmail(e.target.value);
                                            setBookingError('');
                                        }}
                                        placeholder="Enter Email"
                                        className="w-full h-[40px] border border-[#D9D9D9] rounded-[8px] px-3 text-[14px] font-medium outline-none text-black bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[12px] font-semibold text-zinc-500">Nationality</label>
                                    <select 
                                        value={billing.nationality || 'Indian resident'}
                                        onChange={e => {
                                            setBilling((prev: any) => ({ ...prev, nationality: e.target.value }));
                                            setBookingError('');
                                        }}
                                        className="w-full h-[40px] border border-[#D9D9D9] rounded-[8px] px-2 text-[14px] font-medium outline-none bg-white text-black scrollbar-hide"
                                    >
                                        <option value="Indian resident">Indian resident</option>
                                        <option value="International resident">International resident</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[12px] font-semibold text-zinc-500">State</label>
                                    <select 
                                        value={billing.state || ''}
                                        onChange={e => {
                                            setBilling((prev: any) => ({ ...prev, state: e.target.value }));
                                            setBookingError('');
                                        }}
                                        className="w-full h-[40px] border border-[#D9D9D9] rounded-[8px] px-2 text-[14px] font-medium outline-none bg-white text-black scrollbar-hide"
                                    >
                                        <option value="">Select State</option>
                                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-[#AEAEAE] rounded-[9px] p-4 bg-white">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        <User size={20} className="text-zinc-600" />
                                    </div>
                                    <span className="text-[15px] font-medium text-black">{activeName || '{AUTO FETCH}'}</span>
                                </div>
                                <button 
                                    onClick={() => setIsEditingBilling(true)}
                                    className="text-[12px] font-normal text-black flex items-center gap-1 hover:underline active:scale-95 transition-transform"
                                >
                                    Edit <ChevronRight size={12} />
                                </button>
                            </div>
                            <div className="ml-8 space-y-2 text-[13px] font-normal text-black">
                                <p>{activePhone || '{AUTO FETCH}'}</p>
                                <p>{activeEmail || '{AUTO FETCH}'}</p>
                                <p>{activeState || '{AUTO FETCH}'}</p>
                                <p>{billing.nationality || 'Indian resident'}</p>
                            </div>

                            <div className="w-full h-[0.7px] bg-[#D9D9D9] my-4" />

                            <p className="text-[12px] font-normal text-[#686868] leading-tight">
                                Information mentioned above will be used for generating the invoice and sending out the tickets.
                            </p>
                        </div>
                    )}
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="px-4 mt-6 mb-8 flex items-start gap-2.5">
                    <input
                        type="checkbox"
                        id="mobile-terms"
                        checked={acceptedTerms}
                        onChange={e => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black shrink-0"
                    />
                    <label htmlFor="mobile-terms" className="text-[12px] font-normal text-[#686868] leading-tight select-none">
                        I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline cursor-pointer text-black font-semibold">Terms and Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline cursor-pointer text-black font-semibold">Privacy Policy</a>.
                    </label>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-[25px] z-[130] border-t border-[#AEAEAE] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col">
                    <span className="text-[12px] font-normal text-black">
                        {cart.tickets?.reduce((acc, t) => acc + t.quantity, 0) || 0} {cart.tickets?.reduce((acc, t) => acc + t.quantity, 0) === 1 ? 'ticket' : 'tickets'}
                    </span>
                    <span className="text-[20px] font-medium text-black leading-tight mt-[1px]">₹{formatPrice(grandTotal)}</span>
                </div>
                <button
                    onClick={handlePayNow}
                    disabled={bookingLoading}
                    className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
                >
                    {bookingLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                        'Checkout'
                    )}
                </button>
            </div>
        </div>
    );
}
