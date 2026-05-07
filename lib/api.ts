import { useAppStore } from "@/store/useAppStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

async function refreshTokens(): Promise<string | null> {
    const { refreshToken, setTokens, logout } = useAppStore.getState();
    if (!refreshToken) { logout(); return null }

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
    })

    if (!res.ok) { logout(); return null }

    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken)
    return data.accessToken
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const { accessToken, user } = useAppStore.getState();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    if (user?.tenantId) {
        headers['X-Tenant-Id'] = user.tenantId
    }
    console.log(headers)

    let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
        const newToken = await refreshTokens();
        if (!newToken) throw new Error('Sesion expired');
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    }

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error || `HTTP ${res.status}`)
    }

    if (res.status === 204) return null as T
    return res.json();
}