'use client'

export function useSubdomain(): string | null {
    if (typeof window === 'undefined') return null;

    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    if (parts.length >= 3) {
        return parts[0];
    }

    return null;
}