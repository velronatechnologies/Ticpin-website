'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { 
  ChevronLeft, 
  CheckCircle, 
  MessageCircle, 
  User,
  MapPin,
  X
} from 'lucide-react';
import { useUserSession, clearUserSession } from '@/lib/auth/user';
import { bookingApi } from '@/lib/api/booking';
import { getBookingStatus } from '@/lib/utils/booking-status';

export default function EventBookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string;
  const session = useUserSession();
  
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        document.cookie = "device_view=mobile; path=/; max-age=31536000";
        const search = window.location.search || '';
        router.replace(`/myboooking/${bookingId}${search}`);
      } else {
        document.cookie = "device_view=desktop; path=/; max-age=31536000";
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [router, bookingId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCheckedSession(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasCheckedSession) return;
    if (!session) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [hasCheckedSession, session, router]);

  useEffect(() => {
    if (bookingId) {
      setLoading(true);
      
      bookingApi.getBookingDetails(bookingId, session?.id)
        .then((data: any) => {
          console.log('DEBUG: Booking details fetched from backend:', {
            booking_id: data?.booking_id,
            qr_token: data?.qr_token,
            qr_payload: data?.qr_payload,
            full_response: data
          });
          setError(null);
          setBooking(data);
        })
        .catch((err: any) => {
          console.error('Error fetching booking details:', err);
          if (err.message === 'UNAUTHORIZED') {
            clearUserSession();
            router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
          }
          setError('Failed to load booking details');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [bookingId, session]);

  const handleCancel = async (reason: string) => {
    const previousBooking = { ...booking };
    toast.success('Booking cancelled successfully. Refund will be processed shortly.');
    setShowCancelModal(false);
    
    // Optimistic status update
    setBooking((prev: any) => prev ? { ...prev, status: 'cancelled' } : null);

    try {
      const response: any = await bookingApi.cancelBooking(bookingId, 'events');
      
      if (!response?.message?.includes('cancelled successfully')) {
        const updatedBooking = await bookingApi.getBookingDetails(bookingId, session?.id);
        setBooking(updatedBooking);
      } else {
        const updatedBooking = await bookingApi.getBookingDetails(bookingId, session?.id);
        setBooking(updatedBooking);
      }
    } catch (err: any) {
      // Rollback UI
      setBooking(previousBooking);
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to cancel booking';
      toast.error(errorMessage);
    }
  };

  if (loading || !hasCheckedSession || !session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="text-zinc-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500">{error || 'Booking not found'}</div>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-black text-white rounded-full font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const venueImage = booking.event_image || booking.image_url || booking.images?.[0] || null;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="w-full h-14 md:h-[114px] bg-white flex items-center justify-between px-3 md:px-10 border-b border-[#D9D9D9]">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 md:w-[31px] md:h-[31px] bg-white rounded-full flex items-center justify-center border border-[#D0D0D0] md:shadow-sm"
          >
            <ChevronLeft size={18} className="text-black md:hidden" />
            <ChevronLeft size={20} className="text-black hidden md:block" />
          </button>
          <div className="flex items-center gap-3 md:gap-4">
            {/* Yellow Image Badge */}
            <div className="w-[70px] h-[40px] md:w-[104px] md:h-[58px] bg-[#FFEF9A] rounded-[8px] md:rounded-[10px] overflow-hidden flex items-center justify-center">
              {venueImage ? (
                <img 
                  src={venueImage} 
                  alt="Venue" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-black font-bold text-sm md:text-lg">₹{booking.grand_total || booking.amount || 0}</span>
              )}
            </div>
            <div className="w-[1px] h-4 md:h-[22px] bg-[#AEAEAE]" />
            <div>
              <h2 className="text-[14px] md:text-[20px] font-medium text-black truncate max-w-[150px] md:max-w-none" style={{ fontFamily: 'Anek Latin', lineHeight: '16px md:lineHeight:22px' }}>
                {booking.event_name || booking.title}
              </h2>
              <p className="text-[11px] md:text-[17px] font-medium text-[#686868] truncate max-w-[120px] md:max-w-none" style={{ fontFamily: 'Anek Latin', lineHeight: '13px md:lineHeight:19px' }}>
                {booking.venue_city || booking.city || booking.state}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-200 flex items-center justify-center">
            <User size={16} className="text-zinc-500 md:hidden" />
            <User size={20} className="text-zinc-500 hidden md:block" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 md:px-4 pt-4 md:pt-[45px]">
        {/* Booking Confirmed Card */}
        <div className="max-w-[480px] md:max-w-[787px] mx-auto">
          <div className="border border-[#686868] rounded-[16px] md:rounded-[25px] overflow-hidden" style={{ background: 'radial-gradient(52.97% 102.98% at 0% -7.55%, #D6FAE5 0%, #FFFFFF 100%)' }}>
            <div className="p-4 md:p-8">
              <div className="flex flex-row items-start justify-between gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                    <CheckCircle size={24} className="text-[#0AC655] md:hidden" />
                    <CheckCircle size={38} className="text-[#0AC655] hidden md:block" />
                    <h1 className="text-[20px] md:text-[34px] font-semibold text-black leading-none" style={{ fontFamily: 'Anek Latin', lineHeight: '22px md:lineHeight:37px' }}>
                      Booking confirmed
                    </h1>
                  </div>
                  <p className="text-[11px] md:text-[17px] font-medium text-[#686868] leading-tight" style={{ fontFamily: 'Anek Latin', lineHeight: '14px md:lineHeight:19px' }}>
                    Reach the venue 10 mins before your slot
                  </p>
                </div>

                {/* Compact QR Code */}
                <div className="flex flex-col items-center justify-center p-1.5 md:p-2 bg-white border border-[#686868]/30 rounded-[8px] md:rounded-[12px] shadow-sm shrink-0 w-[65px] h-[65px] md:w-[110px] md:h-[110px] select-none">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(booking.booking_id || booking.id || "")}&v=${Date.now()}`}
                    alt="Ticket QR Code"
                    className="w-[40px] h-[40px] md:w-[75px] md:h-[75px] object-contain"
                  />
                  <p className="text-[7px] md:text-[9px] font-bold text-black uppercase tracking-wider text-center mt-0.5 md:mt-1" style={{ fontFamily: 'Anek Latin' }}>Scan to Verify</p>
                </div>
              </div>

              <div className="border-b border-[#686868] my-4 md:my-6 w-full md:w-[717px]" />              <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 md:gap-8">
                <div className="flex-grow space-y-3 md:space-y-6">
                  {/* Date & Time */}
                  <div>
                    <p className="text-[12px] md:text-[17px] font-medium text-[#686868] mb-0.5 md:mb-1" style={{ fontFamily: 'Anek Latin', lineHeight: '14px md:lineHeight:19px' }}>
                      Date & Time
                    </p>
                    <p className="text-[14px] md:text-[20px] font-medium text-black" style={{ fontFamily: 'Anek Latin', lineHeight: '16px md:lineHeight:22px' }}>
                      {booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '-'} | {booking.time || booking.time_slot || '-'}
                    </p>
                  </div>

                  <div className="border-b border-[#686868]/40 w-full" />

                  {/* Ticket Category */}
                  <div>
                    <p className="text-[12px] md:text-[17px] font-medium text-[#686868] mb-0.5 md:mb-1" style={{ fontFamily: 'Anek Latin', lineHeight: '14px md:lineHeight:19px' }}>
                      Ticket Category
                    </p>
                    <p className="text-[14px] md:text-[20px] font-medium text-black" style={{ fontFamily: 'Anek Latin', lineHeight: '16px md:lineHeight:22px' }}>
                      {booking.ticket_category || booking.category || 'General Entry'}
                    </p>
                  </div>

                  <div className="border-b border-[#686868]/40 w-full" />

                  {/* Location */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] md:text-[17px] font-medium text-[#686868] mb-0.5 md:mb-1" style={{ fontFamily: 'Anek Latin', lineHeight: '14px md:lineHeight:19px' }}>
                        Location
                      </p>
                      <p className="text-[14px] md:text-[20px] font-medium text-black" style={{ fontFamily: 'Anek Latin', lineHeight: '16px md:lineHeight:22px' }}>
                        {booking.venue_city || booking.location || '-'}
                      </p>
                    </div>
                    <MapPin size={18} className="text-black md:hidden" />
                    <MapPin size={24} className="text-black hidden md:block" />
                  </div>

                  <div className="border-b border-[#686868]/40 w-full" />

                  {/* Offer */}
                  <div>
                    <p className="text-[12px] md:text-[17px] font-medium text-[#686868] mb-0.5 md:mb-1" style={{ fontFamily: 'Anek Latin', lineHeight: '14px md:lineHeight:19px' }}>
                      Offer
                    </p>
                    <p className="text-[13px] md:text-[20px] font-medium text-black leading-tight" style={{ fontFamily: 'Anek Latin', lineHeight: '15px md:lineHeight:22px' }}>
                      {booking.offer_name || booking.offer || 'No offer applied'}
                    </p>
                  </div>

                  {getBookingStatus(booking) === 'CONFIRMED' && (
                    <>
                      <div className="border-b border-[#686868]/40 w-full" />
                      {/* Cancel Booking */}
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="text-[16px] md:text-[22px] font-semibold underline text-[#ED4D1B] block pt-1 md:pt-2"
                        style={{ fontFamily: 'Anek Latin', lineHeight: '18px md:lineHeight:24px' }}
                      >
                        Cancel booking
                      </button>
                    </>
                  )}
                </div>


              </div>
            </div>
          </div>

          {/* Your Details Card */}
          <div className="border border-[#686868] rounded-[25px] mt-6 p-8">
            <h3 className="text-[25px] font-semibold text-black mb-4" style={{ fontFamily: 'Anek Latin', lineHeight: '28px' }}>
              Your details
            </h3>
            <div className="space-y-2">
              <p className="text-[20px] font-medium text-black" style={{ fontFamily: 'Anek Latin', lineHeight: '22px' }}>
                {booking.user_name || session?.name || '-'}
              </p>
              <p className="text-[20px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin', lineHeight: '22px' }}>
                {booking.user_phone || session?.phone || '-'}
              </p>
            </div>
          </div>

          {/* Booking Info Card */}
          <div className="border border-[#686868] rounded-[25px] mt-6 p-8">
            <div className="space-y-2">
              <p className="text-[17px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin', lineHeight: '19px' }}>
                Booking ID: {booking.booking_id || booking.id}
              </p>
              <p className="text-[17px] font-medium text-[#686868]" style={{ fontFamily: 'Anek Latin', lineHeight: '19px' }}>
                Booking date: {booking.booked_at ? new Date(booking.booked_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </p>
            </div>
          </div>

          {/* Terms & Conditions Card */}
          <div className="bg-[#E1E1E1] rounded-[25px] mt-6 p-8 h-[330px]">
            <h3 className="text-[25px] font-semibold text-black mb-4" style={{ fontFamily: 'Anek Latin', lineHeight: '28px' }}>
              Terms & Conditions
            </h3>
            <div className="space-y-3 text-[#686868] text-sm">
              <p>• Please arrive 10 minutes before the event.</p>
              <p>• Late arrivals may result in denied entry.</p>
              <p>• Tickets are non-transferable.</p>
              <p>• Cancellations must be made at least 24 hours before the event.</p>
              <p>• Refunds will be processed within 5-7 business days.</p>
            </div>
          </div>

          {/* Chat with Support Card */}
          <div 
            className="border border-[#686868] rounded-[25px] mt-6 p-8 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => router.push('/chat-support')}
          >
            <MessageCircle size={32} className="text-black" strokeWidth={2} />
            <h3 className="text-[25px] font-semibold text-black" style={{ fontFamily: 'Anek Latin', lineHeight: '28px' }}>
              Chat with support
            </h3>
          </div>
        </div>
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-[26px] w-[787px] h-[398px] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[25px] font-semibold text-black" style={{ fontFamily: 'Anek Latin', lineHeight: '28px' }}>
                Booking cancellation request
              </h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-[25px] font-semibold text-black"
              >
                <X size={28} />
              </button>
            </div>

            <div className="border-b border-dashed border-[#686868] w-[787px] mb-4" />

            <p className="text-[17px] font-medium text-[#686868] mb-4" style={{ fontFamily: 'Anek Latin', lineHeight: '19px' }}>
              Select your reason here
            </p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => handleCancel('Plan change')}
                className="px-6 py-3 border border-[#D9D9D9] rounded-[33px] text-[20px] font-medium text-black hover:bg-gray-50"
                style={{ fontFamily: 'Anek Latin', lineHeight: '22px' }}
              >
                Plan change
              </button>
              <button
                onClick={() => handleCancel('Found a better offer elsewhere')}
                className="px-6 py-3 border border-[#D9D9D9] rounded-[33px] text-[20px] font-medium text-black hover:bg-gray-50"
                style={{ fontFamily: 'Anek Latin', lineHeight: '22px' }}
              >
                Found a better offer elsewhere
              </button>
              <button
                onClick={() => handleCancel('Booked by mistake')}
                className="px-6 py-3 border border-[#D9D9D9] rounded-[33px] text-[20px] font-medium text-black hover:bg-gray-50"
                style={{ fontFamily: 'Anek Latin', lineHeight: '22px' }}
              >
                Booked by mistake
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleCancel('Others')}
                className="px-6 py-3 border border-[#D9D9D9] rounded-[33px] text-[20px] font-medium text-black hover:bg-gray-50"
                style={{ fontFamily: 'Anek Latin', lineHeight: '22px' }}
              >
                Others
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
