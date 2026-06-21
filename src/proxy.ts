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
    
    // Check if the route is protected
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAdminProtected = ADMIN_ROUTES.some(route => pathname.startsWith(route));
    const isOrganizerProtected = pathname.startsWith('/organizer');

    // Get the user/organizer session cookies
    const userSession = request.cookies.get('ticpin_user_session');
    const orgSession = request.cookies.get('ticpin_session');
    
    // Auth logic for normal users
    if (isProtected && !userSession) {
        // Redirect to login page if not logged in
        const search = request.nextUrl.search || '';
        return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname + search)}`, request.url));
    }

    // Auth logic for organizer dashboard pages
    if (isOrganizerProtected) {
        if (!orgSession) {
            // Redirect to dining partner login as default
            return NextResponse.redirect(new URL(`/list-your-dining/Login?redirect=${encodeURIComponent(pathname)}`, request.url));
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
    ],
};
