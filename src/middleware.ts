import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    // Only apply basic auth to /admin routes
    if (!req.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        // Simple hardcoded credentials for MVP
        // In a real app, these should preferably be in environment variables
        const validUser = process.env.ADMIN_USER || 'admin';
        const validPassword = process.env.ADMIN_PASSWORD || 'silver1234!';

        if (user === validUser && pwd === validPassword) {
            return NextResponse.next();
        }
    }

    // Return 401 response and ask for credentials
    return new NextResponse('Auth required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
    });
}

export const config = {
    matcher: ['/admin/:path*'],
};
