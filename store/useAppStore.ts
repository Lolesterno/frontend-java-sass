import { Branding, Environment, User } from "@/types";
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    environment: Environment;
    branding: Branding | null;

    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setTokens: (accessToken: string, refreshToken: string) => void
    setBranding: (branding: Branding) => void;
    setEnvironment: (env: Environment) => void
    logout: () => void
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            environment: 'sandbox',
            branding: null,

            setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),

            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

            setBranding: (branding) => set({ branding }),

            setEnvironment: (environment) => set({ environment }),

            logout: () => set({ user: null, accessToken: null, refreshToken: null, branding: null }),
        }),
        {
            name: 'platform-storage',
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                user: state.user,
                environment: state.environment,
            })
        }
    )
)