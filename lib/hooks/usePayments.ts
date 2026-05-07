import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { CardToken, Transaction } from "@/types";

export function useTransactions() {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: () => apiRequest<Transaction[]>('/payments/transactions')
    })
}

export function useTokenize() {
    return useMutation({
        mutationFn: (data: {
            cardNumber: string
            expiryMonth: string
            expiryYear: string
            cvv: string
            cardHolder: string
        }) => apiRequest<CardToken>('/payments/tokenize', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    })
}

export function useCharge(){
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            cardToken: string
            amount: number
            currency: string
            description: string
            idempotencyKey?: string
        }) => apiRequest<Transaction>('/payments/charge', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    })
}

export function useReverse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (transactionId: string) =>
            apiRequest(`/payments/reverse/${transactionId}`, { method: 'POST' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] })
    })
}