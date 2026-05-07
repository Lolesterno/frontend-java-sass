import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ['/login', '/register']
const ROOT_HOSTS = ['localhost', '127.0.0.1', 'lvh.me'];

function getSubdomain(host: string): string | null {
    const hostname = host.split(':')[0];
    if (ROOT_HOSTS.includes(hostname)) return null;
    const parts = hostname.split('.');
    if (parts.length >= 3) return parts[0];
    return null;
}

export async function middleware(request: NextRequest) {
    const host = request.headers.get('host') ?? '';
    const { pathname } = request.nextUrl;
    const subdomain = getSubdomain(host);
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!subdomain) {
        return NextResponse.next();
    }

    if (isPublic) {
        const response = NextResponse.next()
        response.headers.set('x-tenant-slug', subdomain)
        return response
    }

    const apiUrl = process.env.API_URL ?? 'http://localhost:8080/api/v1';
    try {
        const res = await fetch(
            `${apiUrl}/tenants/by-slug/${subdomain}`,
            { cache: 'no-store' }
        )

        if (!res.ok) {
            const port = host.includes(':') ? ':' + host.split(':')[1] : ''
            return NextResponse.redirect(
                new URL(`${request.nextUrl.protocol}//lvh.me${port}`)
            )
        }

        const tenant = await res.json();
        const response = NextResponse.next();
        response.headers.set('x-tenant-id', tenant.id);
        response.headers.set('x-tenant-slug', subdomain);
        return response;

    } catch (e) {
        console.error('Middleware tenant fetch error:', e)
        const response = NextResponse.next()
        response.headers.set('x-tenant-slug', subdomain)
        return response
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',]
}