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
  addTicket: (ticket: SelectedTicket) => void;
  removeTicket: (ticketName: string) => void;
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
      
      // FIX: Use functional updates to prevent race conditions
      // This ensures that concurrent adds don't overwrite each other
      addTicket: (ticket) =>
        set((state) => {
          // Check if ticket already exists
          const existing = state.selectedSeats.find(t => t.name === ticket.name);
          if (existing) {
            // Update quantity if ticket exists
            return {
              selectedSeats: state.selectedSeats.map(t =>
                t.name === ticket.name ? { ...t, quantity: t.quantity + ticket.quantity } : t
              )
            };
          }
          // Append new ticket
          return {
            selectedSeats: [...state.selectedSeats, ticket]
          };
        }),
      
      // FIX: Remove ticket safely using functional updates
      removeTicket: (ticketName) =>
        set((state) => ({
          selectedSeats: state.selectedSeats.filter(t => t.name !== ticketName)
        })),
      
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
