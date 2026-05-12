import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { Customer } from "@/types";

export function useCustomers(search?: string) {
    return useQuery({
        queryKey: ['customers', search],
        queryFn: () => apiRequest<Customer[]>(`/customers${search ? `?search=${search}` : ''}`),
    })
}

export function useCustomer(id: string) {
    return useQuery({
        queryKey: ['customer', id],
        queryFn: () => apiRequest<Customer>(`/customers/${id}`),
        enabled: !!id
    })
}

export function useCreateCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Customer>) =>
            apiRequest<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
    })
}

export function useUpdateCustomer(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Customer>) =>
            apiRequest<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['customers'] })
            qc.invalidateQueries({ queryKey: ['customer', id] })
        }
    })
}

export function useVerifyLicense(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () =>
            apiRequest(`/customers/${id}/verify-license`, { method: 'PATCH' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', id] })
    })
}

export function useDeleteCustomer() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            apiRequest(`/customers/${id}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] })
    })
}