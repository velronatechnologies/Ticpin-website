'use client';

import React from 'react';
import EventCard from '@/components/events/EventCard';

import { getMinPrice, formatEventDateUTC } from '@/lib/utils';

interface RealEvent {
    id: string;
    name: string;
    city?: string;
    venue_name?: string;
    venue_address?: string;
    date?: string;
    time?: string;
    price_starts_from?: number;
    portrait_image_url?: string;
    landscape_image_url?: string;
    ticket_categories?: Array<{ name: string; price?: number; capacity?: number }>;
    layout_json?: string;
}

interface EventsGridProps {
    events: RealEvent[];
}

const EventsGrid = React.memo(function EventsGrid({ events }: EventsGridProps) {
    const formatDate = (iso?: string) => {
        return formatEventDateUTC(iso);
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 rounded-[20px] border border-dashed border-zinc-300 text-zinc-400 text-lg">
                No events found matching your criteria.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center sm:justify-items-start transition-all">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    venueName={event.venue_name ?? ''}
                    venueAddress={event.venue_address ?? ''}
                    location={event.city ?? ''}
                    date={formatDate(event.date)}
                    time={event.time ?? ''}
                    ticketPrice={(() => {
                        const minP = getMinPrice(event);
                        return minP > 0 ? `₹${minP}` : '—';
                    })()}
                    image={event.portrait_image_url || event.landscape_image_url || '/events/events-1/ticpinbanner.jpg'}
                />
            ))}
        </div>
    );
});

export default EventsGrid;
