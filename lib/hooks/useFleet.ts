import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { PricingSeason, Vehicle, VehiclePrice } from "@/types";

export function useVehicles(status?: string) {
    return useQuery({
        queryKey: ['vehicles', status],
        queryFn: () => apiRequest<Vehicle[]>(`/fleet/vehicles${status ? `?status=${status}` : ''}`)
    })
}

export function useVehicle(id: string) {
    return useQuery({
        queryKey: ['vehicle', id],
        queryFn: () => apiRequest<Vehicle>(`/fleet/vehicles/${id}`),
        enabled: !!id,
    })
}

export function useVehicleCount() {
    return useQuery({
        queryKey: ['vehicles-count'],
        queryFn: () => apiRequest<number>('/fleet/vehicles/count')
    })
}

export function useCreateVehicle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Vehicle>) =>
            apiRequest<Vehicle>('/fleet/vehicles', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] })
    })
}

export function useUpdateVehicle(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Vehicle>) =>
            apiRequest<Vehicle>(`/fleet/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['vehicles'] })
            qc.invalidateQueries({ queryKey: ['vehicle', id] })
        }
    })
}

export function useUpdateVehicleStatus(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (status: string) =>
            apiRequest(`/fleet/vehicles/${id}/status?status=${status}`, { method: 'PATCH' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] })
    })
}

export function useDeleteVehicle() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            apiRequest(`/fleet/vehicles/${id}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
    })
}

export function useVehiclePricing(vehicleId: string) {
    return useQuery({
        queryKey: ['vehicle-pricing', vehicleId],
        queryFn: () => apiRequest<VehiclePrice[]>(`/fleet/vehicles/${vehicleId}/pricing`),
        enabled: !!vehicleId
    })
}

export function useAddPricing(vehicleId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { rateType: string; amount: number; currency?: string }) =>
            apiRequest<VehiclePrice>(`/fleet/vehicles/${vehicleId}/pricing`, {
                method: 'POST', body: JSON.stringify(data)
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-pricing', vehicleId] })
    })
}

export function useRemovePricing(vehicleId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (pricingId: string) =>
            apiRequest(`/fleet/vehicles/pricing/${pricingId}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicle-pricing', vehicleId] })
    })
}

export function useSeasons() {
    return useQuery({
        queryKey: ['seasons'],
        queryFn: () => apiRequest<PricingSeason[]>('/fleet/seasons'),
    })
}

export function useCreateSeason() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<PricingSeason, 'id' | 'active'>) =>
            apiRequest<PricingSeason>('/fleet/seasons', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['seasons'] })
    })
}

export function useDeleteSeason() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            apiRequest(`/fleet/seasons/${id}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['seasons'] })
    })
}