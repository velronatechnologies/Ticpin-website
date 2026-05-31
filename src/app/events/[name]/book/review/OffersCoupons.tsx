'use client';

import React from 'react';
import Image from 'next/image';
import { Tag, X, ChevronRight, ChevronDown } from 'lucide-react';
import { OfferItem } from '@/lib/api/booking';

interface OffersCouponsProps {
    cart: any;
    session: any;
    expandedSection: 'none' | 'offers' | 'coupons';
    toggleSection: (section: 'offers' | 'coupons') => void;
    offers: OfferItem[];
    appliedOffer: OfferItem | null;
    offerDiscount: number;
    applyOffer: (offer: OfferItem) => void;
    removeOffer: () => void;
    appliedCoupon: string;
    couponDiscount: number;
    removeCoupon: () => void;
    couponInput: string;
    setCouponInput: (val: string) => void;
    validateCoupon: (code?: string) => void;
    couponLoading: boolean;
    couponError: string;
    couponSuccess: string;
    availableCoupons: any[];
}

export default function OffersCoupons({
    cart,
    session,
    expandedSection,
    toggleSection,
    offers,
    appliedOffer,
    offerDiscount,
    applyOffer,
    removeOffer,
    appliedCoupon,
    couponDiscount,
    removeCoupon,
    couponInput,
    setCouponInput,
    validateCoupon,
    couponLoading,
    couponError,
    couponSuccess,
    availableCoupons
}: OffersCouponsProps) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-4 mt-[-20px]">
                <h3 style={{ color: 'black', fontSize: '25px', fontFamily: 'Anek Tamil Condensed, var(--font-anek-latin)', fontWeight: 100, lineHeight: '60px' }} className="uppercase">OFFERS</h3>
                <div className="flex-grow h-[0.5px] bg-[#AEAEAE]" />
            </div>

            {appliedOffer && (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-[10px] p-3 px-5 mb-3">
                    <div className="flex items-center gap-3">
                        <Tag size={16} className="text-green-600" />
                        <div>
                            <p className="text-[14px] font-semibold text-green-700">{appliedOffer.title}</p>
                            <p className="text-[12px] text-green-600">-₹{offerDiscount.toLocaleString('en-IN')} discount applied</p>
                        </div>
                    </div>
                    <button onClick={removeOffer} className="text-[#AEAEAE] hover:text-red-500 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {appliedCoupon && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-[10px] p-3 px-5 mb-3">
                    <div className="flex items-center gap-3">
                        <Tag size={16} className="text-blue-600" />
                        <div>
                            <p className="text-[14px] font-semibold text-blue-700">Code: {appliedCoupon}</p>
                            <p className="text-[12px] text-blue-600">-₹{couponDiscount.toLocaleString('en-IN')} discount applied</p>
                        </div>
                    </div>
                    <button onClick={removeCoupon} className="text-[#AEAEAE] hover:text-red-500 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="border border-[#AEAEAE] rounded-[15px] overflow-hidden mt-[-10px] bg-[#FDFDFD]">
                <div className="border-b border-[#F0F0F0]">
                    <div
                        className="flex items-center justify-between p-4 px-6 cursor-pointer hover:bg-[#fafafa] transition-colors"
                        onClick={() => toggleSection('offers')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 rounded-full border-[2px] border-black flex items-center justify-center text-[15px] font-bold">%</div>
                            <span style={{ color: 'black', fontSize: '20px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                {appliedOffer ? `Offer applied: ${appliedOffer.title}` : `View all ${cart?.type || 'event'} offers`}
                                {offers?.length > 0 && !appliedOffer && (
                                    <span className="ml-2 text-[13px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{offers.length} available</span>
                                )}
                            </span>
                        </div>
                        {expandedSection === 'offers' ? <ChevronDown size={18} className="text-black" /> : <ChevronRight size={18} className="text-black" />}
                    </div>

                    {expandedSection === 'offers' && (
                        <div className="p-6 pt-0 space-y-4 animate-in fade-in duration-300">
                            {!offers || offers.length === 0 ? (
                                <p className="text-[14px] text-[#AEAEAE] pb-4">No offers available for this {cart?.type || 'event'}.</p>
                            ) : (
                                offers.map((offer, i) => (
                                    <div key={i} className="border border-[#F0F0F0] bg-white rounded-[12px] p-4 flex justify-between items-center transition-all hover:border-[#AEAEAE]">
                                        <div className="flex-1 pr-4">
                                            <p className="text-[16px] font-bold text-black">{offer.title}</p>
                                            <p className="text-[13px] text-[#686868]">{offer.description}</p>
                                            <p className="text-[12px] text-green-600 font-semibold mt-1">
                                                {offer.discount_type === 'percent' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => applyOffer(offer)}
                                            className={`px-4 h-[34px] rounded-[6px] text-[13px] font-bold uppercase transition-all ${appliedOffer?.id === offer.id ? 'bg-green-100 text-green-700' : 'bg-black text-white hover:bg-zinc-800'}`}
                                        >
                                            {appliedOffer?.id === offer.id ? 'Applied' : 'Apply'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <div
                        className="flex items-center justify-between p-4 px-6 cursor-pointer hover:bg-[#fafafa] transition-colors"
                        onClick={() => toggleSection('coupons')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 flex items-center justify-center relative">
                                <Image src="/events/cupon.svg" alt="Coupons" fill className="object-contain" />
                            </div>
                            <span style={{ color: 'black', fontSize: '20px', fontFamily: 'var(--font-anek-latin)', fontWeight: 500 }}>
                                {appliedCoupon ? `Code applied: ${appliedCoupon}` : 'View coupon codes'}
                                {availableCoupons.length > 0 && !appliedCoupon && (
                                    <span className="ml-2 text-[13px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{availableCoupons.length} available</span>
                                )}
                            </span>
                        </div>
                        {expandedSection === 'coupons' ? <ChevronDown size={18} className="text-black" /> : <ChevronRight size={18} className="text-black" />}
                    </div>

                    {expandedSection === 'coupons' && (
                        <div className="p-6 pt-0 space-y-4 animate-in fade-in duration-300">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponInput}
                                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); }}
                                    onKeyDown={e => e.key === 'Enter' && validateCoupon()}
                                    placeholder="ENTER CODE"
                                    className="flex-1 h-[45px] border border-[#AEAEAE] rounded-[8px] px-4 focus:outline-none focus:border-black text-[14px] font-bold uppercase placeholder:normal-case placeholder:font-medium text-black bg-white"
                                />
                                <button
                                    onClick={() => validateCoupon()}
                                    disabled={couponLoading || !couponInput.trim()}
                                    className="px-6 h-[45px] bg-[#AC9BF7] text-white rounded-[8px] text-[13px] font-bold uppercase disabled:opacity-40 transition-all active:scale-[0.98]"
                                >
                                    {couponLoading ? '...' : 'APPLY'}
                                </button>
                            </div>
                            {couponError && <p className="text-red-500 text-[12px] font-medium">{couponError}</p>}
                            {couponSuccess && <p className="text-green-600 text-[12px] font-bold">{couponSuccess}</p>}

                            {availableCoupons.length > 0 && !appliedCoupon && (
                                <div className="space-y-2 mt-4">
                                    {availableCoupons.map((c, i) => {
                                        const expiry = new Date(c.valid_until);
                                        const now = new Date();
                                        const hoursLeft = (expiry.getTime() - now.getTime()) / 36e5;
                                        const isExpiringSoon = hoursLeft <= 24;
                                        const expiryLabel = expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                                        const usesLeft = c.max_uses > 0 ? c.max_uses - (c.used_count ?? 0) : null;
                                        return (
                                            <div key={i} className={`flex items-center justify-between p-3 border rounded-[10px] bg-white ${isExpiringSoon ? 'border-orange-300' : 'border-[#F0F0F0]'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                        <Tag size={14} className={isExpiringSoon ? 'text-orange-400' : 'text-[#AEAEAE]'} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-black uppercase">{c.code}</p>
                                                        <p className="text-[11px] text-[#686868] uppercase font-medium">
                                                            {c.discount_type === 'percent' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                                                        </p>
                                                        <p className={`text-[10px] font-medium mt-0.5 ${isExpiringSoon ? 'text-orange-500' : 'text-[#AEAEAE]'}`}>
                                                            {isExpiringSoon ? `⚠ Expires today (${expiryLabel})` : `Valid till ${expiryLabel}`}
                                                            {usesLeft !== null && ` · ${usesLeft} use${usesLeft !== 1 ? 's' : ''} left`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => validateCoupon(c.code)}
                                                    className="px-4 py-1.5 bg-[#AC9BF7] text-white rounded-[8px] text-[11px] font-bold uppercase transition-all"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="bg-[#f9f9f9] p-3 rounded-[8px]">
                                <p className="text-[12px] text-[#686868] font-medium leading-tight">
                                    {session?.id
                                        ? 'Showing coupons available for your account. Only one coupon can be applied per order.'
                                        : 'Login to see personalised coupon codes. Only one coupon can be applied per order.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
