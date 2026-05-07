'use client'

import { apiRequest } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation"
import { EnvironmentToggle } from "./EnviromentToggle";

export function Header() {
    const router = useRouter();
    const { user, accessToken, logout } = useAppStore();

    async function handleLogout() {
        try {
            if (accessToken) {
                await apiRequest('/auth/logout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
            }
        } finally {
            logout();
            router.push('/login');
        }
    }

    return (
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
            <EnvironmentToggle />

            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{user?.email}</span>
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 border border-gray-200 rounded-md px-2.5 py-1 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
                >
                    Salir
                </button>
            </div>
        </header>
    )
}