'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserSession } from '@/lib/auth/user';
import { bookingApi } from '@/lib/api/booking';
import BookingDetailsClient from '@/components/bookings/BookingDetailsClient';

export default function PlayBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;
  const session = useUserSession();

  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    if (!bookingId) return;
    setLoading(true);
    bookingApi.getBookingDetails(bookingId, session?.id)
      .then((data: any) => setBooking(data))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [bookingId, session?.id]);

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

  if (!booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500">Booking not found</p>
      </div>
    );
  }

  return <BookingDetailsClient initialBooking={booking} />;
}
