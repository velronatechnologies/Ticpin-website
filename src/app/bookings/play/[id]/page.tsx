'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUserSession } from '@/lib/auth/user';
import { bookingApi } from '@/lib/api/booking';
import BookingDetailsClient from '@/components/bookings/BookingDetailsClient';

export default function PlayBookingDetailPage() {
  const params = useParams();
  const bookingId = params?.id as string;
  const session = useUserSession();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    bookingApi.getBookingDetails(bookingId, session?.id)
      .then((data: any) => setBooking(data))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [bookingId, session?.id]);

  if (loading) {
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
