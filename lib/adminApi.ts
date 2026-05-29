import { useAdminStore } from "@/store/useAdminStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export async function adminRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const { accessToken } = useAdminStore.getState();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    }

    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

    if (res.status === 401) {
        useAdminStore.getState().logout();
        window.location.href = '/admin/login';
        throw new Error('Session Expirada')
    }

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP ${res.status}`)
    }

    if (res.status === 204) return null as T
    return res.json();
}