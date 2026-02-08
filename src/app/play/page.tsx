'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppBanner from '@/components/layout/AppBanner';
import SportCategoryCard from '@/components/play/SportCategoryCard';
import VenueCard from '@/components/play/VenueCard';
import FilterBar from '@/components/play/FilterBar';

const sportsCategories = [
    { name: 'CRICKET', image: '/play/playck.png' },
    { name: 'FOOTBALL', image: '/play/playck.png' }, // playck as fallback if playfb.png is missing, but usually football is there
    { name: 'PICKLEBALL', image: '/play/playpb.png' },
    { name: 'TENNIS', image: '/play/playtens.png' },
    { name: 'BADMINTON', image: '/play/playbm.png' },
    { name: 'TABLE TENNIS', image: '/play/playtt.png' },
    { name: 'BASKETBALL', image: '/play/playbb.png' },
];

const sportsVenues = Array(8).fill({
    name: 'Name',
    location: 'Location',
    image: '/play/m.png'
});

const filters = ['Top Rated', 'Cricket', 'Pickleball', 'Badminton'];

export default function PlayPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white font-[family-name:var(--font-anek-latin)]">
            {/* <Navbar /> */}

            <main className="max-w-[1536px] mx-auto px-4 md:px-14 py-12 space-y-20">

                {/* Explore Sports Section */}
                <section className="space-y-10">
                    <h2 className="text-4xl font-bold text-black px-2">Explore Sports</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 px-2 max-w-5xl">
                        {sportsCategories.map((sport, i) => (
                            <SportCategoryCard
                                key={i}
                                name={sport.name}
                                image={sport.image}
                            />
                        ))}
                    </div>
                </section>

                {/* All Sports Venues Section */}
                <section className="space-y-10">
                    <h2 className="text-4xl font-bold text-black px-2">All Sports Venues</h2>

                    {/* Filters */}
                    <div className="px-2">
                        <FilterBar filters={filters} />
                    </div>

                    {/* Venues Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-2 max-w-7xl">
                        {sportsVenues.map((venue, i) => (
                            <VenueCard
                                key={i}
                                name={venue.name}
                                location={venue.location}
                                image={venue.image}
                            />
                        ))}
                    </div>
                </section>

                <div className="mt-20">
                    <AppBanner />
                </div>
            </main>

            <Footer />
        </div>
    );
}
