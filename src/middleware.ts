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



export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname === '/') {
        return NextResponse.redirect(new URL('/events', request.url));
    }
    
    // User-agent mobile vs desktop routing redirection
    const userAgent = request.headers.get('user-agent') || '';
    const deviceCookie = request.cookies.get('device_view')?.value;
    const isMobileUA = deviceCookie === 'mobile' || (deviceCookie !== 'desktop' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent));

    // Temporary Dining Route Block - redirect to coming soon page
    const isDiningBooking = pathname.startsWith('/bookings/dining') || 
                            pathname === '/bookings/dining-tickets' || 
                            pathname === '/profile/bookings/dining' ||
                            (pathname === '/myboooking' && request.nextUrl.searchParams.get('type') === 'dining');

    if (isDiningBooking) {
        return NextResponse.redirect(new URL('/dining', request.url));
    }

    const isDiningRoot = pathname === '/dining' || pathname === '/dining/';
    const isDiningSubpathOrAdminOrList = (pathname.startsWith('/dining/') && !isDiningRoot);

    if (isDiningSubpathOrAdminOrList) {
        return NextResponse.redirect(new URL('/dining', request.url));
    }

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
    
    // Check if the route is protected
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isBookingRoute = 
        (/^\/events\/[^\/]+\/book(\/.*)?$/).test(pathname) ||
        (/^\/dining\/venue\/[^\/]+\/book(\/.*)?$/).test(pathname) ||
        (/^\/play\/[^\/]+\/book(\/.*)?$/).test(pathname);

    // Get the user session cookies
    const userSession =
        request.cookies.get('__Host-ticpin_user_session') ??
        request.cookies.get('ticpin_user_session') ??
        request.cookies.get('ticpin_user_session_info');
    
    // Auth logic for normal users and booking paths
    if ((isProtected || isBookingRoute) && !userSession) {
        // Redirect to login page if not logged in
        const search = request.nextUrl.search || '';
        return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Apply middleware to all relevant routes
    matcher: [
        '/',
        '/profile/:path*',
        '/pass/buy/:path*',
        '/logout/:path*',
        '/bookings/:path*',
        '/my-pass/:path*',
        '/ticlists/:path*',
        '/myboooking/:path*',
        '/events/:name/book',
        '/events/:name/book/:path*',
        '/dining/venue/:name/book',
        '/dining/venue/:name/book/:path*',
        '/play/:name/book',
        '/play/:name/book/:path*',
    ],
};
