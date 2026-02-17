'use client';

import { useState, useEffect } from 'react';
import SportCategoryCard from '@/components/play/SportCategoryCard';
import VenueCard from '@/components/play/VenueCard';
import FilterBar from '@/components/play/FilterBar';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import ArtistAvatar from '@/components/events/ArtistAvatar';
import { playApi, artistsApi } from '@/lib/api';
import { useStore } from '@/store/useStore';

export default function Home() {
  const { location: storeLocation } = useStore();
  const [artistList, setArtistList] = useState<any[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [venueList, setVenueList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sportsCategories = [
    { name: 'CRICKET', image: '/play/playck.png', href: '/play/cricket' },
    { name: 'FOOTBALL', image: '/play/playfb.png', href: '/play/football' },
    { name: 'PICKLEBALL', image: '/play/playpb.png', href: '/play/pickleball' },
    { name: 'TENNIS', image: '/play/playtens.png', href: '/play/tennis' },
    { name: 'BADMINTON', image: '/play/playbm.png', href: '/play/badminton' },
    { name: 'TABLE TENNIS', image: '/play/playtt.png', href: '/play/table-tennis' },
    { name: 'BASKETBALL', image: '/play/playbb.png', href: '/play/basketball' },
  ];

  const filters = ['Top Rated', 'Cricket', 'Pickleball', 'Badminton'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [artistsRes, venuesRes] = await Promise.all([
          artistsApi.getAll(),
          playApi.getAll(8, '', '', storeLocation)
        ]);

        if (artistsRes.success && artistsRes.data) {
          setArtistList(artistsRes.data || []);
        }

        if (venuesRes.success && venuesRes.data) {
          setVenueList(venuesRes.data.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [storeLocation]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    setShowLeftArrow(container.scrollLeft > 20);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white font-[family-name:var(--font-anek-latin)]">
      <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 py-8 md:py-12 space-y-12 md:space-y-20">

        {/* Explore Sports Section */}
        <section className="space-y-8 md:space-y-10">
          <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>Explore Sports</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 px-2 max-w-5xl">
            {sportsCategories.map((sport, i) => (
              <SportCategoryCard
                key={i}
                name={sport.name}
                image={sport.image}
                href={sport.href}
              />
            ))}
          </div>
        </section>

        {/* Artists Section */}
        {artistList.length > 0 && (
          <section className="space-y-8 md:space-y-10">
            <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>Artists</h2>
            <div className="relative group">
              <div
                id="home-artists-container"
                onScroll={handleScroll}
                className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 overflow-x-auto py-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
              >
                {artistList.map((artist) => (
                  <ArtistAvatar
                    key={artist.id}
                    id={artist.id}
                    name={artist.name}
                    image={artist.image_url || '/placeholder.jpg'}
                  />
                ))}
              </div>

              {showLeftArrow && (
                <button
                  onClick={() => {
                    const container = document.getElementById('home-artists-container');
                    if (container) {
                      container.scrollBy({ left: -400, behavior: 'smooth' });
                    }
                  }}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200 hidden md:flex z-20"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => {
                  const container = document.getElementById('home-artists-container');
                  if (container) {
                    container.scrollBy({ left: 400, behavior: 'smooth' });
                  }
                }}
                className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200 hidden md:flex z-20"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>
        )}

        {/* All Sports Venues Section */}
        <section className="space-y-8 md:space-y-10">
          <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>All Sports Venues</h2>

          {/* Filters */}
          <div>
            <FilterBar filters={filters} />
          </div>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl">
            {venueList.length > 0 ? (
              venueList.map((venue) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name}
                  location={venue.location?.venue_name || venue.location?.city || "Chennai"}
                  image={venue.images?.hero || '/placeholder.jpg'}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No venues available right now.</p>
              </div>
            )}
          </div>
        </section>

      </main>
      <BottomBanner />
      <Footer />
    </div>
  );
}
