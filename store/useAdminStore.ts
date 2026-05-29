import { AdminUser } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminStore {
    admin: AdminUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    setAdmin: (admin: AdminUser, accessToken: string, refreshToken: string) => void
    logout: () => void
}

export const useAdminStore = create<AdminStore>()(
    persist(
        (set) => ({
            admin: null,
            accessToken: null,
            refreshToken: null,
            setAdmin: (admin, accessToken, refreshToken) =>
                set({ admin, accessToken, refreshToken }),
            logout: () => set({ admin: null, accessToken: null, refreshToken: null }),
        }),
        { name: 'admin-storage' }
    )
)