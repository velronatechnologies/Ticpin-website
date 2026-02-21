
'use client';


import { useRouter, useParams } from 'next/navigation';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, MapPin, Star, ChevronDown, ChevronRight, CheckCircle2, Navigation, PhoneCall, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import BookingCard from '@/components/dining/venue/BookingCard';
import CouponCard from '@/components/dining/CouponCard';
import AppBanner from '@/components/layout/AppBanner';
import Image from 'next/image';
import { diningApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import AIChatPanel from '@/components/shared/AIChatPanel';

export default function DiningVenueDetail() {
    const router = useRouter();
    const params = useParams();
    const venueId = params.id as string;
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [venue, setVenue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userOffers, setUserOffers] = useState<any[]>([]);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const { isLoggedIn, userId, token } = useStore();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchVenue = async () => {
            setIsLoading(true);
            try {
                // Try fetching by ID first
                const response = await diningApi.getById(venueId);
                if (response.success && response.data) {
                    setVenue(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch venue:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (venueId) fetchVenue();
    }, [venueId]);

    // Fetch user-specific offers
    useEffect(() => {
        const fetchUserOffers = async () => {
            if (!isLoggedIn || !userId || !token) return;

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/offers/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    // Filter for active, non-expired dining offers
                    const now = new Date();
                    const activeOffers = data.data.filter((offer: any) =>
                        offer.is_active &&
                        offer.offer_type === 'dining' &&
                        new Date(offer.valid_until) > now
                    );
                    setUserOffers(activeOffers);
                }
            } catch (error) {
                console.error('Failed to fetch user offers:', error);
            }
        };

        fetchUserOffers();
    }, [isLoggedIn, userId, token]);

    if (isLoading) {
        return <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#866BFF]"></div>
        </div>;
    }

    if (!venue) {
        return <div className="min-h-screen flex flex-col justify-center items-center gap-4">
            <h1 className="text-2xl font-bold">Venue Not Found</h1>
            <button onClick={() => router.back()} className="text-[#866BFF] font-bold uppercase tracking-wider underline">Go Back</button>
        </div>;
    }

    const smallImages = (venue.images?.gallery || [
        '/images.png',
        '/images.png',
        '/images.png',
        '/images.png',
    ]).filter((src: string) => src && src.trim() !== "");

    return (
        <div className="min-h-screen bg-[#f8f4ff] font-[family-name:var(--font-anek-latin)] text-sm md:text-base selection:bg-primary selection:text-white">
            <main className="mx-auto max-w-[1800px] px-4 md:px-14 py-4 md:py-8">
                <button
                    onClick={() => router.back()}
                    className="mb-4 md:mb-6 flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-xl border border-zinc-100 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400"
                >
                    <ArrowLeft size={14} className="md:w-4 md:h-4" />
                    Back
                </button>

                {/* Vertical Split Layout Wrapper */}
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,800px)_392px] gap-4 justify-center">

                    {/* LEFT SIDE: Hero Image + All Other Details */}
                    <div className="space-y-8 md:space-y-10">
                        {/* Large Hero Image */}
                        <div className="relative h-[300px] md:h-[450px] rounded-[32px] overflow-hidden shadow-sm">
                            <Image src={venue.images?.hero || "/login/banner.jpeg"} fill className="object-cover" alt={venue.name} priority />
                        </div>

                        {/* Restaurant Name & Actions */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-[36px] font-semibold tracking-tight text-black leading-tight">{venue.name}</h1>
                                <div className="flex items-center gap-2 py-1">
                                    <div className="flex items-center gap-1.5 px-1.5 py-0.5 text-white text-[11px] font-semibold rounded bg-[#298103]">
                                        {venue.rating || 4.5} <Star size={10} className="fill-white" />
                                    </div>
                                    <span className="text-zinc-300">|</span>
                                    <div className="flex items-center gap-1.5 text-[14px] text-zinc-600 font-medium">
                                        <span className="text-[#298103]">Open Now</span>
                                        <span className="text-zinc-400">{venue.timings || "11:00 AM - 11:00 PM"}</span>
                                    </div>
                                </div>
                                <p className="text-[15px] text-zinc-500 font-medium">{venue.location?.venue_name || venue.location?.city || "Chennai"}</p>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <a
                                    href={venue.location?.map_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2.5 px-6 py-2.5 border border-zinc-300 rounded-full bg-[#f8f4ff] text-[16px] font-semibold text-black hover:bg-zinc-50 transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-[15deg]">
                                        <path d="M3 11l19-9-9 19-2-8-8-2z" />
                                    </svg> Directions
                                </a>
                                <a
                                    href={`tel:${venue.contact_phone || ""}`}
                                    className="flex items-center gap-2.5 px-6 py-2.5 border border-zinc-300 rounded-full bg-[#f8f4ff] text-[16px] font-semibold text-black hover:bg-zinc-50 transition-colors"
                                >
                                    <PhoneCall size={18} /> Call
                                </a>
                                <button
                                    onClick={() => setIsAiOpen(true)}
                                    className="flex items-center gap-2.5 px-6 py-2.5 border border-purple-200 rounded-full bg-purple-50 text-[16px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors shadow-sm"
                                >
                                    <Sparkles size={18} className="text-purple-600" /> Ask AI
                                </button>
                            </div>
                            <hr className="mt-8 border-zinc-400" />
                        </div>

                        {/* Offers Section */}
                        {((venue.offers && venue.offers.length > 0) || userOffers.length > 0) && (
                            <section className="space-y-6">
                                <h2 className="text-[32px] font-semibold text-black">Offers</h2>

                                {/* User-specific offers */}
                                {userOffers.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-[18px] font-semibold text-purple-600 flex items-center gap-2">
                                            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm">For You</span>
                                            Exclusive Offers Available
                                        </h3>
                                        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                                            {userOffers.map((offer: any) => (
                                                <div key={offer.id} className="min-w-[300px] bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 shadow-md">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <div className="text-lg font-bold text-purple-900">{offer.discount_value}{offer.discount_type === 'percentage' ? '%' : '₹'} OFF</div>
                                                            <div className="text-sm text-purple-600 font-medium">{offer.offer_name}</div>
                                                        </div>
                                                        <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                            {offer.discount_type === 'percentage' ? 'PERCENTAGE' : 'FLAT'}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-zinc-500 space-y-1">
                                                        {offer.min_order_value > 0 && (
                                                            <p>Min. order: ₹{offer.min_order_value}</p>
                                                        )}
                                                        {offer.max_discount_amount > 0 && (
                                                            <p>Max discount: ₹{offer.max_discount_amount}</p>
                                                        )}
                                                        <p className="text-purple-600 font-medium">Valid till: {new Date(offer.valid_until).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-purple-200">
                                                        <code className="bg-white px-3 py-1 rounded text-sm font-mono font-bold text-purple-900 border border-purple-300">
                                                            {offer.offer_code}
                                                        </code>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Venue offers */}
                                {venue.offers && venue.offers.length > 0 && (
                                    <div className="space-y-3">
                                        {userOffers.length > 0 && <h3 className="text-[18px] font-semibold text-zinc-600">Venue Offers</h3>}
                                        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                                            {venue.offers.map((offer: any, i: number) => (
                                                <CouponCard key={i} discount={offer.title} code={offer.description || "T&C Apply"} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Menu section */}
                        {venue.menu_images && venue.menu_images.length > 0 && (
                            <section className="space-y-6">
                                <h2 className="text-[32px] font-semibold text-black">Menu</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {(venue.menu_images || []).filter((src: string) => src && src.trim() !== "").map((src: string, i: number) => (
                                        <div key={i} className="relative aspect-[3/4] rounded-[24px] overflow-hidden border border-zinc-100 shadow-sm bg-white">
                                            <Image src={src} fill className="object-cover" alt={`Menu Page ${i + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Facilities */}
                        {venue.facilities && venue.facilities.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-[32px] font-semibold text-black">Available facilities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 font-semibold">
                                    {venue.facilities.map((item: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2 text-[14px] text-zinc-500">
                                            <CheckCircle2 size={16} className="text-[#298103]" />
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Venue Section */}
                        <section className="space-y-4">
                            <h2 className="text-[32px] font-semibold text-black">Venue</h2>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-6 bg-white border border-zinc-200 rounded-[24px] shadow-sm gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-[20px] font-semibold text-zinc-800">{venue.location?.venue_name || venue.name}</h3>
                                    <p className="text-[16px] font-semibold text-zinc-400">{venue.location?.address || "Address not available"}</p>
                                </div>
                                <a
                                    href={venue.location?.map_url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-zinc-300 rounded-[10px] text-black font-medium uppercase tracking-tight text-[18px] hover:bg-zinc-50 transition-colors"
                                >
                                    <MapPin size={18} strokeWidth={1.5} /> GET DIRECTIONS
                                </a>
                            </div>
                        </section>

                        {/* FAQ Section */}
                        {venue.faqs && venue.faqs.length > 0 && (
                            <div className="space-y-4">
                                <div
                                    onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)}
                                    className={`w-full flex flex-col p-6 bg-white border border-zinc-200 rounded-[20px] cursor-pointer shadow-sm`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[20px] font-semibold text-black">Frequently Asked Questions</h3>
                                        <ChevronDown size={20} className={`text-zinc-400 transition-transform duration-300 ${activeFaq === 1 ? 'rotate-180' : ''}`} />
                                    </div>
                                    {activeFaq === 1 && (
                                        <div className="mt-4 space-y-4 text-zinc-500 text-base font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
                                            {venue.faqs.map((faq: any, i: number) => (
                                                <div key={i} className="space-y-1">
                                                    <p className="text-black">Q: {faq.question}</p>
                                                    <p>A: {faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: 4 Images + Booking Card */}
                    <div className="space-y-6">
                        {/* 2x2 Image Grid (Exactly 392px wide) */}
                        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[300px] md:h-[450px]">
                            {smallImages.map((src: string, i: number) => (
                                <div key={i} className="relative rounded-[24px] overflow-hidden shadow-sm h-full border border-zinc-50 bg-white">
                                    <Image src={src} fill className="object-cover" alt={`Gallery ${i}`} />
                                </div>
                            ))}
                        </div>

                        {/* Sticky Booking Card */}
                        <div className="sticky top-24 z-10">
                            <BookingCard venue={venue} />
                        </div>
                    </div>
                </div>


            </main>
            <BottomBanner />
            <Footer />
            <AIChatPanel
                isOpen={isAiOpen}
                onClose={() => setIsAiOpen(false)}
                venueData={venue}
                venueType="dining"
            />
        </div>
    );
}