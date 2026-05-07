'use client'

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useBranding } from "@/lib/hooks/useBranding";
import { useSubdomain } from "@/lib/hooks/useSubdomain";
import { useTenantBySlug } from "@/lib/hooks/useTenant";
import { useAppStore } from "@/store/useAppStore";
import { useHydration } from "@/store/useHydration";
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const { accessToken } = useAppStore();
    const hydrated = useHydration();
    const subdomain = useSubdomain();
    useBranding();
    useTenantBySlug(subdomain);

    useEffect(() => {
        if (hydrated && !accessToken) router.push('/login');
    }, [accessToken, router, hydrated]);

    if(!hydrated) return null;

    if (!accessToken) return null;

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}