import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { GatewayConfig, PaymentIntentResponse, Transaction } from "@/types";

export function useTransactions() {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: () => apiRequest<Transaction[]>('/payments/transactions'),
    })
}

export function useGatewayConfig() {
    return useQuery({
        queryKey: ['gateway-config'],
        queryFn: () => apiRequest<GatewayConfig>('/payments/config')
    })
}

export function useConfigureGateway() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            gatewayType: string;
            secretKey: string;
            publicKey: string;
            webhookSecret?: string
            mode: string;
        }) =>  apiRequest<GatewayConfig>('/payments/config', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['gateway-config'] }),
    })
}

export function useCreatePaymentIntent() {
    return useMutation({
        mutationFn: (data: {
            amount: number;
            currency: string;
            description: string;
            bookingId?: string;
            idempotencyKey?: string;
        }) => apiRequest<PaymentIntentResponse>('/payments/intent', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    })
}

export function useConfirmPayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (paymentIntentId: string) =>
            apiRequest<Transaction>(`/payments/confirm/${paymentIntentId}`, {
                method: 'POST',
            }),
            onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] })
    })
}

export function useRefundPayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (paymentIntentId: string) =>
            apiRequest<Transaction>(`/payments/refund/${paymentIntentId}`, {
                method: 'POST'
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] })
    })
}