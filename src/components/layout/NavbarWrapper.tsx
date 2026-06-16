'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { useIdentityStore } from '@/store/useIdentityStore';

const hideOnPaths = ['/chat-support', '/chat-support/session', '/bookings', '/profile/bookings'];

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { userSession, organizerSession, activeRole, switchRole } = useIdentityStore();

  useEffect(() => {
    if (!pathname) return;

    const isOrganizerPath = pathname.startsWith('/organizer');
    const isUserBookingPath = pathname.includes('/book') || 
                              pathname.startsWith('/bookings') || 
                              pathname.startsWith('/profile');

    if (isOrganizerPath) {
      if (organizerSession && activeRole !== 'organizer') {
        switchRole('organizer');
      }
    } else if (isUserBookingPath) {
      if (userSession && activeRole !== 'user') {
        switchRole('user');
      }
    }
  }, [pathname, userSession, organizerSession, activeRole, switchRole]);

  const shouldHide = pathname?.startsWith('/organizer') || 
                    pathname?.startsWith('/ticket') || 
                    pathname?.startsWith('/pass') || 
                    pathname?.includes('/book') || 
                    hideOnPaths.some(path => pathname?.startsWith(path));
  
  if (shouldHide) return null;
  return <Navbar />;
}
