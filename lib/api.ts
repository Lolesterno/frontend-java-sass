import { useAppStore } from "@/store/useAppStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function doRefresh(): Promise<string | null> {
    const { refreshToken, setTokens, logout } = useAppStore.getState();
    if (!refreshToken) { logout(); return null }

    try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) { logout(); return null }
        const data = await res.json();

        setTokens(data.accessToken, data.refreshToken);
        return data.accessToken
    } catch  {
        logout();
        return null;
    }
}

async function refreshTokenOnce(): Promise<string | null> {
    if (isRefreshing) {
        return new Promise(resolve => {
            refreshQueue.push(resolve)
        })
    }

    isRefreshing = true;
    const newToken = await doRefresh();
    isRefreshing = false;

    refreshQueue.forEach(cb => cb(newToken ?? ''));
    refreshQueue = [];

    return newToken;
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

    let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
        const newToken = await refreshTokenOnce();

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