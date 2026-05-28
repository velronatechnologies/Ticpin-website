'use client';

import React from 'react';
import EventCard from '@/components/events/EventCard';

interface RealEvent {
    id: string;
    name: string;
    city?: string;
    date?: string;
    time?: string;
    price_starts_from?: number;
    portrait_image_url?: string;
    landscape_image_url?: string;
}

interface EventsGridProps {
    events: RealEvent[];
}

const EventsGrid = React.memo(function EventsGrid({ events }: EventsGridProps) {
    const formatDate = (iso?: string) => {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 rounded-[20px] border border-dashed border-zinc-300 text-zinc-400 text-lg">
                No events found matching your criteria.
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-6 justify-center sm:justify-start transition-all">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    id={event.id}
                    name={event.name}
                    location={event.city ?? ''}
                    date={formatDate(event.date)}
                    time={event.time ?? ''}
                    ticketPrice={typeof event.price_starts_from === 'number' ? `₹${event.price_starts_from}` : '—'}
                    image={event.portrait_image_url || event.landscape_image_url || '/events/events-1/ticpinbanner.jpg'}
                />
            ))}
        </div>
    );
});

export default EventsGrid;
