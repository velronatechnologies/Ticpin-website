'use client';

import { ChevronLeft, ChevronRight, Info, Percent, Tag, User, MapPin, Clock, Edit2 } from 'lucide-react';

interface MobileReviewBookingProps {
    event?: {
        name: string;
        date: string;
        time: string;
    };
    onBack: () => void;
}

export default function MobileReviewBooking({ event, onBack }: MobileReviewBookingProps) {
    return (
        <div className="md:hidden min-h-screen bg-white relative flex flex-col overflow-x-hidden" style={{ fontFamily: "'Anek Latin', sans-serif" }}>
            {/* Header Section */}
            <div className="w-full pt-4 px-4 relative h-[60px] shrink-0 flex items-center">
                <button
                    onClick={onBack}
                    className="w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center shadow-sm z-10 border border-[#EFEFEF]"
                >
                    <ChevronLeft size={20} className="text-black" />
                </button>
                <h1 className="ml-4 text-[18px] font-semibold text-black">Review your booking</h1>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 w-full overflow-y-auto pb-[100px]">
                {/* Timer Banner - Rectangle 524 */}
                <div className="mx-4 mt-2 h-[29px] bg-[#E1E1E1] rounded-[8px] flex items-center justify-center">
                    <span className="text-[12px] font-medium text-black">
                        Complete your booking in <span className="text-[#5331EA]">{' {TIME} '}</span> mins
                    </span>
                </div>

                {/* Event Summary Section */}
                <div className="px-4 mt-6 flex gap-4">
                    {/* Event Image */}
                    <div className="w-[87px] h-[98px] bg-[#110D2C] rounded-[10px] overflow-hidden shrink-0">
                        <div className="w-full h-full p-2 flex flex-col items-center justify-center relative bg-[url('/10.1.jpg')] bg-cover bg-center">
                            {!event && <span className="text-[10px] text-[#DFFF00] font-black italic leading-[0.8] text-center">THE TICPIN<br />PLAY<br />FESTIVAL</span>}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-[15px] font-medium text-black leading-tight uppercase">{event?.name || '{EVENT NAME}'}</h2>
                        <div className="mt-2 text-[13px] font-normal text-[#686868] uppercase">
                            <p>{event?.location || '{LOCATION}'}</p>
                        </div>
                    </div>
                </div>

                {/* Event Details Card - Rectangle 525 */}
                <div className="mx-4 mt-6 border border-[#D9D9D9] rounded-[9px] p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-[15px] font-medium text-black">Sat, 23 May</span>
                        <span className="text-[15px] font-medium text-black">7 PM</span>
                    </div>

                    <div className="w-full h-[0.7px] bg-[#D9D9D9] mb-4" />

                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[18px] font-medium text-black">1 x General Access</h3>
                            <p className="text-[15px] font-normal text-black mt-1">₹5,000 cover</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[18px] font-medium text-black">₹5,000</span>
                            <button
                                className="text-[12px] font-semibold text-[#686868] mt-1 relative pb-[3px]"
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
                </div>

                {/* Offers Section */}
                <div className="px-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">OFFERS</h3>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="border border-[#D9D9D9] rounded-[9px] overflow-hidden">
                        <button className="w-full h-[55px] flex items-center justify-between px-4 active:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Percent size={19} className="text-black" />
                                <span className="text-[18px] font-medium text-black">View all event offers</span>
                            </div>
                            <ChevronRight size={20} className="text-zinc-400" />
                        </button>
                        <div className="flex justify-center">
                            <div className="w-[85%] h-[0.7px] bg-[#D9D9D9]" />
                        </div>
                        <button className="w-full h-[55px] flex items-center justify-between px-4 active:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <Tag size={19} className="text-black" />
                                <span className="text-[18px] font-medium text-black">View all coupon codes</span>
                            </div>
                            <ChevronRight size={20} className="text-zinc-400" />
                        </button>
                    </div>
                </div>

                {/* Payment Details Section */}
                <div className="px-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">PAYMENT DETAILS</h3>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="border border-[#D9D9D9] rounded-[9px] p-4 pb-0 overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[17px] font-semibold text-black">Order amount</h4>
                            <span className="text-[17px] font-semibold text-black">₹5,000</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-1">
                                <span className="text-[12px] font-normal text-black">Fees and chargers</span>
                                <ChevronRight size={12} className="text-black rotate-90" />
                            </div>
                            <span className="text-[12px] font-normal text-black">₹300</span>
                        </div>
                        <div className="w-full h-[0.7px] bg-[#D9D9D9] mb-2" />
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[15px] font-semibold text-black">Grand Total</h4>
                            <span className="text-[17px] font-semibold text-black">₹5,300</span>
                        </div>
                    </div>
                </div>

                {/* Donation Section */}
                <div className="px-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">DONATE TO EXPERIENCE INDIA</h3>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="rounded-[9px] overflow-hidden">
                        <div className="bg-[#5331EA15] p-4 relative overflow-hidden rounded-t-[9px]">
                            <div className="max-w-[220px]">
                                <h4 className="text-[20px] font-semibold leading-[1.1]">
                                    <span className="text-[#5331EA] block">Helping children</span>
                                    <span className="text-black block whitespace-nowrap">access nutritious food</span>
                                </h4>
                            </div>
                            {/* Donation Illustration */}
                            <div className="absolute right-[-5px] bottom-[-10px] w-[110px] h-[90px]">
                                <img
                                    src="/events/donate pic.svg"
                                    alt="Donate"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between bg-white border border-[#AEAEAE] rounded-b-[9px]">
                            <div className="flex items-center gap-2">
                                <span className="text-[12px] font-normal text-black">Donate with </span>
                                <span
                                    className="text-[12px] font-normal text-black relative pb-[3px]"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 1px)',
                                        backgroundPosition: '0 100%',
                                        backgroundSize: '4px 2px',
                                        backgroundRepeat: 'repeat-x'
                                    }}
                                >
                                    every order
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-[69px] h-[32px] border border-[#AEAEAE] rounded-[10px] flex items-center justify-between px-3">
                                    <span className="text-[13px] font-medium text-black">₹5</span>
                                    <Edit2 size={12} className="text-[#212121]" />
                                </div>
                                <button className="w-[56px] h-[27px] border border-black rounded-[7px] text-[12px] font-medium text-black">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Details Section */}
                <div className="px-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-[13px] font-medium text-[#3B3B3B] tracking-[0.1em] uppercase shrink-0">BILLING DETAILS</h3>
                        <div className="flex-1 h-[0.7px] bg-[#D9D9D9]" />
                    </div>
                    <div className="border border-[#AEAEAE] rounded-[9px] p-4">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <User size={20} className="text-zinc-600" />
                                </div>
                                <span className="text-[15px] font-medium text-black">User Name {'{AUTO FETCH}'}</span>
                            </div>
                            <button className="text-[12px] font-normal text-black flex items-center gap-1">
                                Edit <ChevronRight size={12} />
                            </button>
                        </div>
                        <div className="ml-8 space-y-2 text-[13px] font-normal text-black">
                            <p>User number {'{AUTO FETCH}'}</p>
                            <p>User email {'{AUTO FETCH}'}</p>
                            <p>User state {'{AUTO FETCH}'}</p>
                        </div>

                        <div className="w-full h-[0.7px] bg-[#D9D9D9] my-4" />

                        <p className="text-[12px] font-normal text-[#686868] leading-tight">
                            Information mentioned above will be used for generating the invoice and sending out the tickets.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="mt-auto w-full h-[88px] bg-[#EFEFEF] flex items-center justify-between px-[25px] shrink-0 border-t border-zinc-200">
                <div className="flex flex-col">
                    <span className="text-[12px] font-normal text-black">1 ticket</span>
                    <span className="text-[20px] font-medium text-black leading-tight">₹5,000</span>
                </div>
                <button className="w-[148px] h-[44px] bg-black text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center active:scale-95 transition-transform">
                    Checkout
                </button>
            </div>
        </div>
    );
}
