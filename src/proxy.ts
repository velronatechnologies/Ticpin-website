import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
    '/profile',
    '/pass/buy',
    '/bookings',
    '/my-pass',
    '/logout',
    '/ticlists',
    '/myboooking',
];

const ADMIN_ROUTES = [
    '/admin'
];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // User-agent mobile vs desktop routing redirection
    const userAgent = request.headers.get('user-agent') || '';
    const deviceCookie = request.cookies.get('device_view')?.value;
    const isMobileUA = deviceCookie === 'mobile' || (deviceCookie !== 'desktop' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));

    if (isMobileUA) {
        if (pathname.startsWith('/bookings')) {
            const search = request.nextUrl.search || '';
            
            if (pathname === '/bookings') {
                const type = request.nextUrl.searchParams.get('type') || 'events';
                return NextResponse.redirect(new URL(`/myboooking?type=${type}`, request.url));
            }
            if (pathname === '/bookings/dining' || pathname === '/bookings/dining-tickets') {
                return NextResponse.redirect(new URL('/myboooking?type=dining', request.url));
            } else if (pathname === '/bookings/events' || pathname === '/bookings/event-tickets') {
                return NextResponse.redirect(new URL('/myboooking?type=events', request.url));
            } else if (pathname === '/bookings/play' || pathname === '/bookings/play-tickets') {
                return NextResponse.redirect(new URL('/myboooking?type=play', request.url));
            }
            
            const categoryMatch = pathname.match(/^\/bookings\/(dining|events|play)\/([^\/]+)$/);
            if (categoryMatch) {
                const id = categoryMatch[2];
                return NextResponse.redirect(new URL(`/myboooking/${id}${search}`, request.url));
            }
            
            const generalMatch = pathname.match(/^\/bookings\/([^\/]+)$/);
            if (generalMatch) {
                const id = generalMatch[1];
                return NextResponse.redirect(new URL(`/myboooking/${id}${search}`, request.url));
            }
        }
    } else {
        if (pathname.startsWith('/myboooking')) {
            const search = request.nextUrl.search || '';
            
            const detailMatch = pathname.match(/^\/myboooking\/([^\/]+)$/);
            if (detailMatch) {
                const id = detailMatch[1];
                return NextResponse.redirect(new URL(`/bookings/${id}${search}`, request.url));
            }
            
            if (pathname === '/myboooking') {
                return NextResponse.redirect(new URL(`/bookings${search}`, request.url));
            }
        }
    }

    // Enforce no-cache for slot-booking pages (must always show latest lock state from DB)
    if (pathname.includes('/book/')) {
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store, max-age=0');
        console.debug(`[Cache] Slot page ${pathname} marked no-store`);
        return response;
    }
    
    // Organizer login / onboarding routes
    const isDiningLoginRoute = pathname === '/list-your-dining/Login' || pathname === '/list-your-dining/Signin' || pathname === '/list-your-dining/otp';
    const isEventsLoginRoute = pathname === '/list-your-events/Login' || pathname === '/list-your-events/Signin' || pathname === '/list-your-events/otp';
    const isPlayLoginRoute = pathname === '/list-your-play/Login' || pathname === '/list-your-play/Signin' || pathname === '/list-your-play/otp';

    // Organizer protected routes (setup and creation/management)
    const isDiningOrgRoute = pathname.startsWith('/list-your-dining/setup') || pathname.startsWith('/list-your-dining/list-your-Setups') || pathname.startsWith('/dining/create') || pathname.startsWith('/dining/edit');
    const isEventsOrgRoute = pathname.startsWith('/list-your-events/setup') || pathname.startsWith('/list-your-events/list-your-Setups') || pathname.startsWith('/events/create') || pathname.startsWith('/events/edit');
    const isPlayOrgRoute = pathname.startsWith('/list-your-play/setup') || pathname.startsWith('/list-your-play/list-your-Setups') || pathname.startsWith('/play/create') || pathname.startsWith('/play/edit');

    // Check if the route is protected
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isBookingRoute = 
        (/^\/events\/[^\/]+\/book(\/.*)?$/).test(pathname) ||
        (/^\/dining\/venue\/[^\/]+\/book(\/.*)?$/).test(pathname) ||
        (/^\/play\/[^\/]+\/book(\/.*)?$/).test(pathname);
    const isAdminProtected = ADMIN_ROUTES.some(route => pathname.startsWith(route));
    const isOrganizerProtected = pathname.startsWith('/organizer');

    // Get the user/organizer session cookies
    const userSession = request.cookies.get('ticpin_user_session');
    const orgSession = request.cookies.get('ticpin_session');
    
    // Redirect logged-in organizers away from login/register pages
    if (orgSession) {
        if (isDiningLoginRoute) {
            return NextResponse.redirect(new URL('/organizer/dashboard?category=dining', request.url));
        }
        if (isEventsLoginRoute) {
            return NextResponse.redirect(new URL('/organizer/dashboard?category=events', request.url));
        }
        if (isPlayLoginRoute) {
            return NextResponse.redirect(new URL('/organizer/dashboard?category=play', request.url));
        }
    }

    // Auth logic for normal users and booking paths
    if ((isProtected || isBookingRoute) && !userSession) {
        // Redirect to login page if not logged in
        const search = request.nextUrl.search || '';
        return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url));
    }

    // Auth logic for organizer dashboard pages
    if (isOrganizerProtected) {
        if (!orgSession) {
            const searchParams = request.nextUrl.searchParams;
            const category = searchParams.get('category');
            let loginUrl = '/list-your-dining/Login';
            if (category === 'events') loginUrl = '/list-your-events/Login';
            if (category === 'play') loginUrl = '/list-your-play/Login';
            return NextResponse.redirect(new URL(`${loginUrl}?redirect=${encodeURIComponent(pathname + request.nextUrl.search)}`, request.url));
        }
    }

    // Auth logic for organizer onboarding setup and creation pages
    if (!orgSession) {
        const search = request.nextUrl.search || '';
        if (isDiningOrgRoute) {
            return NextResponse.redirect(new URL(`/list-your-dining/Login?redirect=${encodeURIComponent(pathname + search)}`, request.url));
        }
        if (isEventsOrgRoute) {
            return NextResponse.redirect(new URL(`/list-your-events/Login?redirect=${encodeURIComponent(pathname + search)}`, request.url));
        }
        if (isPlayOrgRoute) {
            return NextResponse.redirect(new URL(`/list-your-play/Login?redirect=${encodeURIComponent(pathname + search)}`, request.url));
        }
    }

    // Auth logic for admin pages
    if (isAdminProtected) {
        if (pathname === '/admin/newadminpanel') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        // Exclude /admin/login from protection
        if (pathname === '/admin/login') {
            return NextResponse.next();
        }

        const loginUrl = new URL(`/admin/login?redirect=${encodeURIComponent(pathname)}`, request.url);

        // Check organizer session for admin role
        if (orgSession) {
            try {
                const raw = orgSession.value;
                
                // Validate base64 format
                if (!/^[A-Za-z0-9+/=]+$/.test(raw)) {
                    console.error('[Auth] Invalid base64 in orgSession cookie');
                    const response = NextResponse.redirect(loginUrl);
                    response.cookies.delete('ticpin_session');
                    return response;
                }
                
                const json = atob(raw);
                const session = JSON.parse(json);
                
                // Validate required fields
                if (!session.id || session.isAdmin === undefined) {
                    console.error('[Auth] Invalid session structure:', Object.keys(session));
                    const response = NextResponse.redirect(loginUrl);
                    response.cookies.delete('ticpin_session');
                    return response;
                }
                
                if (session.isAdmin === true) {
                    return NextResponse.next();
                }
            } catch (error) {
                console.error('[Auth] Cookie parsing error:', error);
                // Clear invalid cookie and redirect
                const response = NextResponse.redirect(loginUrl);
                response.cookies.delete('ticpin_session');
                return response;
            }
        }

        // If isAdmin check failed or orgSession not found, redirect to admin login
        const response = NextResponse.redirect(loginUrl);
        if (orgSession) {
            response.cookies.delete('ticpin_session');
        }
        return response;
    }

    return NextResponse.next();
}

export const config = {
    // Apply middleware to all relevant routes
    matcher: [
        '/profile/:path*',
        '/admin/:path*',
        '/pass/buy/:path*',
        '/logout/:path*',
        '/bookings/:path*',
        '/my-pass/:path*',
        '/organizer/:path*',
        '/ticlists/:path*',
        '/myboooking/:path*',
        '/events/:name/book',
        '/events/:name/book/:path*',
        '/dining/venue/:name/book',
        '/dining/venue/:name/book/:path*',
        '/play/:name/book',
        '/play/:name/book/:path*',
        '/list-your-dining/:path*',
        '/list-your-events/:path*',
        '/list-your-play/:path*',
        '/dining/create',
        '/dining/create/:path*',
        '/dining/edit',
        '/dining/edit/:path*',
        '/play/create',
        '/play/create/:path*',
        '/play/edit',
        '/play/edit/:path*',
        '/events/create',
        '/events/create/:path*',
        '/events/edit',
        '/events/edit/:path*',
    ],
};
