import { useAppStore } from "@/store/useAppStore";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { Branding } from "@/types";
import { useEffect } from "react";

export function useBranding() {
    const { user, setBranding } = useAppStore();

    const query = useQuery({
        queryKey: ['branding', user?.tenantId],
        queryFn: () => apiRequest<Branding>(`/tenants/${user?.tenantId}/branding`),
        enabled: !!user?.tenantId,
    });

    useEffect(() => {
        if (query.data) {
            setBranding(query.data);

            document.documentElement.style.setProperty('--primary', query.data.primaryColor);
            document.documentElement.style.setProperty('--secondary', query.data.secondaryColor);
        }
    }, [query.data, setBranding]);

    return query;
}