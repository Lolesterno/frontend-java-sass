import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { AvailabilityResponse, Booking } from "@/types";

export function useBookings(status?: string) {
    return useQuery({
        queryKey: ['bookings', status],
        queryFn: () => apiRequest<Booking[]>(`/bookings/${status ? `?status=${status}` : ''}`),
    })
}

export function useBooking(id: string) {
    return useQuery({
        queryKey: ['booking', id],
        queryFn: () => apiRequest<Booking>(`/bookings/${id}`),
        enabled: !!id,
    })
}

export function useVehicleBookings(vehicleId: string) {
    return useQuery({
        queryKey: ['bookings-vehicle', vehicleId],
        queryFn: () => apiRequest<Booking[]>(`/bookings/vehicle/${vehicleId}`),
        enabled: !!vehicleId,
    })
}

export function useCustomerBookings(customerId: string) {
    return useQuery({
        queryKey: ['bookings-customer', customerId],
        queryFn: () => apiRequest<Booking[]>(`/bookings/customer/${customerId}`),
        enabled: !!customerId,
    })
}

export function useCalendarBookings(from: string, to: string) {
    return useQuery({
        queryKey: ['bookings-calenda', from, to],
        queryFn: () => apiRequest<Booking[]>(`/bookings/calendar?from=${from}&to=${to}`),
        enabled: !!from && !!to,
    })
}

export function useCreateBooking() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Booking>) => 
            apiRequest<Booking>('/bookings/', { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] })
    })
}

export function useUpdateBookingStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            apiRequest<Booking>(`/bookings/${id}/status?status=${status}`, { method: 'PATCH' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] })
    })
}

export function useCheckAvailability() {
    return useMutation({
        mutationFn: (data: { vehicleId: string; startDate: string; endDate: string }) =>
            apiRequest<AvailabilityResponse>('/bookings/availability', {
                method: 'POST', body: JSON.stringify(data)
            }),
    })
}

export function useUpdateBookingPayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, transactionId, paymentStatus }: {
            id: string;
            transactionId: string;
            paymentStatus: string;
        }) => apiRequest<Booking>(`/bookings/${id}/payment`, {
            method: 'PATCH',
            body: JSON.stringify({ transactionId, paymentStatus })
        }),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['bookings'] })
            qc.invalidateQueries({ queryKey: ['booking', id] })
            qc.invalidateQueries({ queryKey: ['transactions'] })
        }
    })
}