'use client'

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useState } from "react";

interface Props {
    paymentIntentId: string;
    amount: number;
    currency: string;
    onSuccess: (transactionId: string) => void;
    onError: (error: string) => void
}

function formatCOP(amount: number, currency: string) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency.toUpperCase(),
        minimumFractionDigits: 0,
    }).format(amount)
}

export function StripePaymentForm({ paymentIntentId, amount, currency, onSuccess, onError }: Props) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault()
        if (!stripe || !elements) return

        setLoading(true);

        try {
            // Paso 1 - Confirmacion del pago con los datos de la tarjeta

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                onError(error.message ?? 'Error al procesar el pago')
                return
            }

            if (paymentIntent?.status === 'succeeded') {
                
                onSuccess(paymentIntentId);
            } else {
                onError(`Estado inesperado: ${paymentIntent.status}`)
            }

        } catch (error) {
            onError(error instanceof Error ? error.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm text-gray-500">Total a cobrar</span>
                <span className="text-base font-medium text-indigo-600">
                    {formatCOP(amount, currency)}
                </span>
            </div>

            <PaymentElement
                options={{
                    layout: 'tabs',
                    defaultValues: {
                        billingDetails: {
                            address: { country: 'CO' },
                        },
                    },
                }}
            />

            <button
                type="submit"
                disabled={!stripe || !elements || loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors"
            >
                {loading ? 'Procesando...' : `Pagar ${formatCOP(amount, currency)}`}
            </button>
            
        </form>
    )
}