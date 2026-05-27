import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
    '/profile',
    '/pass/buy',
    '/bookings',
    '/my-pass',
    '/logout',
];

const ADMIN_ROUTES = [
    '/admin'
];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
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
        // Redirect to homepage if not logged in
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Auth logic for organizer dashboard pages
    if (isOrganizerProtected) {
        if (!orgSession) {
            // Redirect to dining partner login as default
            return NextResponse.redirect(new URL('/list-your-dining/Login', request.url));
        }
    }

    // Auth logic for admin pages
    if (isAdminProtected) {
        // Exclude /admin/login from protection
        if (pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check organizer session for admin role
        if (orgSession) {
            try {
                const raw = orgSession.value;
                
                // Validate base64 format
                if (!/^[A-Za-z0-9+/=]+$/.test(raw)) {
                    console.error('[Auth] Invalid base64 in orgSession cookie');
                    return NextResponse.redirect(new URL('/list-your-dining/Login', request.url));
                }
                
                const json = atob(raw);
                const session = JSON.parse(json);
                
                // Validate required fields
                if (!session.id || session.isAdmin === undefined) {
                    console.error('[Auth] Invalid session structure:', Object.keys(session));
                    const response = NextResponse.redirect(new URL('/list-your-dining/Login', request.url));
                    response.cookies.delete('ticpin_session');
                    return response;
                }
                
                if (session.isAdmin === true) {
                    return NextResponse.next();
                }
            } catch (error) {
                console.error('[Auth] Cookie parsing error:', error);
                // Clear invalid cookie and redirect
                const response = NextResponse.redirect(new URL('/list-your-dining/Login', request.url));
                response.cookies.delete('ticpin_session');
                return response;
            }
        }

        // Fallback to user phone check for legacy admin
        if (userSession) {
            try {
                const raw = userSession.value;
                const json = atob(raw);
                const session = JSON.parse(json);
                if (session.phone === '6383667872') {
                    return NextResponse.next();
                }
            } catch { /* ignore */ }
        }

        // If neither check passed, redirect to root
        return NextResponse.redirect(new URL('/', request.url));
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
        '/organizer/:path*'
    ],
};
