'use client';

import SportCategoryCard from '@/components/play/SportCategoryCard';
import VenueCard from '@/components/play/VenueCard';
import BottomBanner from '@/components/layout/BottomBanner';
import Footer from '@/components/layout/Footer';
import { useState, useEffect, useRef } from 'react';
import { playApi } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { sportsCategories } from '@/data/playData';

// Must match backend sports list exactly
const SPORT_FILTERS = ['Cricket', 'Football', 'Pickleball', 'Tennis', 'Badminton', 'Table Tennis', 'Basketball'];

// Convert uppercase display name (e.g. 'TABLE TENNIS') to API name (e.g. 'Table Tennis')
const toApiSport = (displayName: string) =>
  displayName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

export default function Home() {
  const { location: storeLocation } = useStore();
  const [venueList, setVenueList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const venuesSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchPlay = async () => {
      setIsLoading(true);
      try {
        const cityOnly = storeLocation
          ? (storeLocation.includes(',') ? storeLocation.split(',').pop()?.trim() : storeLocation)
          : '';
        const response = await playApi.getAll(20, '', activeCategory, cityOnly);
        if (response.success && response.data) {
          const items = response.data.items || [];
          if (items.length > 0) {
            setVenueList(items);
          } else if (cityOnly) {
            // No venues in this city — fall back to all
            const fallback = await playApi.getAll(20, '', activeCategory, '');
            if (fallback.success && fallback.data) {
              setVenueList(fallback.data.items || []);
            }
          } else {
            setVenueList([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch play venues:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlay();
  }, [storeLocation, activeCategory]);

  const handleSportCardClick = (displayName: string) => {
    const apiSport = toApiSport(displayName);
    setActiveCategory(prev => prev === apiSport ? '' : apiSport);
    setTimeout(() => {
      venuesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFCED] via-white to-white font-[family-name:var(--font-anek-latin)]">
      <main className="mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 py-8 md:py-12 space-y-12 md:space-y-20">

        {/* Explore Sports Section */}
        <section className="space-y-8 md:space-y-10">
          <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold mb-6 md:mb-8 uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>
            Explore Sports
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 px-2 max-w-5xl">
            {sportsCategories.map((sport, i) => {
              const apiSport = toApiSport(sport.name);
              return (
                <SportCategoryCard
                  key={i}
                  name={sport.name}
                  image={sport.image}
                  isActive={activeCategory === apiSport}
                  onClick={() => handleSportCardClick(sport.name)}
                />
              );
            })}
          </div>
        </section>

        {/* All Sports Venues Section */}
        <section className="space-y-8 md:space-y-10" ref={venuesSectionRef}>
          {/* Section header */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 md:mb-8">
            <h2 className="font-[family-name:var(--font-anek-latin)] font-semibold uppercase text-black tracking-normal text-[24px] md:text-[30px]" style={{ fontWeight: 600 }}>
              {activeCategory ? `${activeCategory} Venues` : 'All Sports Venues'}
            </h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory('')}
                className="text-sm font-bold text-[#E7C200] underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Clear filter ✕
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-3 px-2">
            <button
              className="px-6 py-3 text-base font-medium bg-white text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              style={{ border: '1px solid #a4a4a4', borderRadius: '22px' }}
            >
              <img src="/filter 1.png" alt="Filter" className="w-[18px] h-[18px] object-contain" />
              <span>Filters</span>
              <img src="/filter arrow.svg" alt="arrow" className="w-[10px] h-[6px] ml-1" />
            </button>
            {SPORT_FILTERS.map(sport => (
              <button
                key={sport}
                onClick={() => setActiveCategory(prev => prev === sport ? '' : sport)}
                className={`px-6 py-3 text-base font-medium transition-all duration-200 whitespace-nowrap uppercase ${activeCategory === sport
                    ? 'bg-[#E7C200] text-black font-bold shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                style={{ border: activeCategory === sport ? '1px solid #E7C200' : '1px solid #a4a4a4', borderRadius: '22px' }}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* Venues Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl">
              {venueList.length > 0 ? (
                venueList.map((venue, i) => (
                  <VenueCard
                    key={i}
                    id={venue.id}
                    name={venue.name}
                    location={venue.location?.venue_name || venue.location?.city || 'Chennai'}
                    image={venue.images?.hero || '/placeholder.jpg'}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg">
                    {activeCategory
                      ? `No ${activeCategory} venues found yet. Check back soon!`
                      : 'No sports venues available right now. Check back soon!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

      </main>
      <BottomBanner />
      <Footer />
    </div>
  );
}
