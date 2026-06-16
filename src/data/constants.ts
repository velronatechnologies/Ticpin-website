export const sportsCategories = [
    { name: 'CRICKET', image: '/play/playck.png', href: '/play/cricket' },
    { name: 'FOOTBALL', image: '/play/playfb.png' },
    { name: 'PICKLEBALL', image: '/play/playpb.png' },
    { name: 'TENNIS', image: '/play/playtens.png' },
    { name: 'BADMINTON', image: '/play/playbm.png' },
    { name: 'TABLE TENNIS', image: '/play/playtt.png' },
    { name: 'BASKETBALL', image: '/play/playbb.png' },
];

export const venueFilters = ['Top Rated', 'Cricket', 'Pickleball', 'Badminton'];

// NOTE: Admin detection is server-side only via isAdmin claim in JWT.
// Do NOT add phone numbers or emails here for admin detection.


export const navItems = [
    { name: 'Dining', href: '/dining' },
    { name: 'Events', href: '/events' },
    { name: 'Play', href: '/play' },
];
