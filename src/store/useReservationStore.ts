import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SelectedTicket {
  name: string;
  price: number;
  quantity: number;
}

interface ReservationState {
  reservationId: string | null;
  eventId: string | null;
  selectedSeats: SelectedTicket[];
  expiresAt: string | null;
  setReservation: (reservationId: string, eventId: string, selectedSeats: SelectedTicket[], expiresAt: string) => void;
  setExpiresAt: (expiresAt: string) => void;
  clearReservation: () => void;
  hasActiveReservation: () => boolean;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      reservationId: null,
      eventId: null,
      selectedSeats: [],
      expiresAt: null,
      setReservation: (reservationId, eventId, selectedSeats, expiresAt) =>
        set({ reservationId, eventId, selectedSeats, expiresAt }),
      setExpiresAt: (expiresAt) =>
        set({ expiresAt }),
      clearReservation: () =>
        set({ reservationId: null, eventId: null, selectedSeats: [], expiresAt: null }),
      hasActiveReservation: () => {
        const { expiresAt, reservationId } = get();
        if (!reservationId || !expiresAt) return false;
        return new Date(expiresAt).getTime() > Date.now();
      },
    }),
    {
      name: 'ticpin-event-reservation',
    }
  )
);
