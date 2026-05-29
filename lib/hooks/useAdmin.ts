import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminRequest } from "../adminApi";
import { AdminMetrics, AdminUser, Plan, Subscription, TenantAdmin } from "@/types";

export function useAdminMetrics() {
    return useQuery({
        queryKey: ['admin-metrics'],
        queryFn: () => adminRequest<AdminMetrics>('/admin/metrics')
    })
}

export function useAdminTenants() {
    return useQuery({
        queryKey: ['admin-tenants'],
        queryFn: () => adminRequest<TenantAdmin[]>('/admin/tenants')
    })
}

export function useAdminTenant(id: string) {
    return useQuery({
        queryKey: ['admin-tenant', id],
        queryFn: () => adminRequest<TenantAdmin>(`/admin/tenants/${id}`),
        enabled: !!id,
    })
}

export function useToggleTenant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, active }: { id: string, active: boolean }) =>
            adminRequest(`/admin/tenants/${id}/status?active=${active}`, { method: 'PATCH' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-tenants'] })
    })
}

export function useAdminPlans() {
    return useQuery({
        queryKey: ['admin-plans'],
        queryFn: () => adminRequest<Plan[]>('/admin/plans'),
    })
}

export function useUpdatePlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Plan> }) =>
            adminRequest<Plan>(`/admin/plans/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-plans'] })
    })
}

export function useAdminSubscriptions() {
    return useQuery({
        queryKey: ['admin-subscriptions'],
        queryFn: () => adminRequest<Subscription[]>('/admin/subscriptions')
    })
}

export function useOverridePlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ tenantId, planName }: { tenantId: string, planName: string }) =>
            adminRequest(`/admin/subscriptions/${tenantId}/override?planName=${planName}`, {
                method: 'POST',
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-subscriptions'] })
            qc.invalidateQueries({ queryKey: ['admin-tenants'] })
        }
    })
}

export function useAdminUsers() {
    return useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminRequest<AdminUser[]>('/admin/auth/admins')
    })
}

export function useCreateAdmin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
            adminRequest('/admin/auth/admins', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] })
    })
}