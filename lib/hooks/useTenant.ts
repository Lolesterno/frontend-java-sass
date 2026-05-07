import { useAppStore } from "@/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { Tenant } from "@/types";

export function useTenant() {
    const { user } = useAppStore();

    return useQuery({
        queryKey: ['tenant', user?.tenantId],
        queryFn: () => apiRequest<Tenant>(`/tenants/${user?.tenantId}`),
        enabled: !!user?.tenantId,
    })
}

export function useTenantBySlug(slug: string | null) {
    return useQuery({
        queryKey: ['tenant-slug', slug],
        queryFn: () => apiRequest<Tenant>(`/tenants/by-slug/${slug}`),
        enabled: !!slug,
    })
}