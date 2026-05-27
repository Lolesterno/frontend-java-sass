'use client'

import { useConfirmPayment, useCreatePaymentIntent, useGatewayConfig } from "@/lib/hooks/usePayments";
import { Booking } from "@/types"
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js"
import { StripePaymentForm } from "./StripePaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { useUpdateBookingPayment } from "@/lib/hooks/useBookings";

interface Props {
    booking: Booking;
    onClose: () => void;
    onSuccess: (transactionId: string) => void;
}

function formatCOP(amount: number) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(amount)
}

export function StripePaymentModal({ booking, onClose, onSuccess }: Props) {
    const { data: gatewayConfig } = useGatewayConfig();
    const createIntent = useCreatePaymentIntent();
    const confirmPayment = useConfirmPayment();
    const updateBookingPayment = useUpdateBookingPayment();

    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const stripePromise = gatewayConfig?.publicKey
        ? loadStripe(gatewayConfig.publicKey)
        : null;

    useEffect(() => {
        if (!gatewayConfig?.configured) return;

        createIntent.mutateAsync({
            amount: booking.totalAmount,
            currency: booking.currency,
            description: `Reserva ${booking.id.slice(0, 8).toUpperCase()}`,
            bookingId: booking.id,
            idempotencyKey: `booking-${booking.id}`,
        }).then(response => {
            setClientSecret(response.clientSecret);
            setPaymentIntentId(response.paymentIntentId);
        }).catch(err => {
            setError(err instanceof Error ? err.message : 'Error al inicializar el Pago')
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gatewayConfig?.configured]);

    async function handlePaymentSuccess(confirmedPaymentIntentId: string) {
        try {
            const tx = await confirmPayment.mutateAsync(confirmedPaymentIntentId);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const txId = (tx as any).transactionId ?? confirmedPaymentIntentId;

            await updateBookingPayment.mutateAsync({
                id: booking.id,
                transactionId: txId,
                paymentStatus: 'PAID',
            })

            setSuccess(true);
            setTimeout(() => {
                onSuccess(txId);
                onClose();
            }, 2000);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error al confirmar el pago')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <p className="text-sm font-medium">Pagar reserva</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {formatCOP(booking.totalAmount)} · {booking.rateType}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-xl leading-none">
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {!gatewayConfig?.configured && !createIntent.isPending && (
                        <div className="text-center py-6">
                            <p className="text-gray-500 text-sm mb-2">No hay pasarela de pago configurada</p>
                            <p className="text-xs text-gray-400">Configura Stripe en Configuración → Pagos</p>
                        </div>
                    )}

                    {gatewayConfig?.configured && !clientSecret && !error && (
                        <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Preparando el pago...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <p className="text-red-600 text-sm">{error}</p>
                            <button onClick={onClose}
                                className="mt-3 text-sm text-indigo-500 hover:underline bg-transparent border-none cursor-pointer">
                                Cerrar
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="text-center py-6">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-2xl">✓</span>
                            </div>
                            <p className="text-green-700 font-medium">Pago aprobado</p>
                            <p className="text-sm text-gray-400 mt-1">La reserva fue confirmada automáticamente</p>
                        </div>
                    )}

                    {clientSecret && paymentIntentId && !success && stripePromise && (
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance: {
                                    theme: 'stripe',
                                    variables: {
                                        colorPrimary: '#6366f1',
                                        colorBackground: '#ffffff',
                                        colorText: '#1e293b',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                                        borderRadius: '8px',
                                    },
                                },
                            }}
                        >
                            <StripePaymentForm
                                paymentIntentId={paymentIntentId}
                                amount={booking.totalAmount}
                                currency={booking.currency}
                                onSuccess={handlePaymentSuccess}
                                onError={setError}
                            />
                        </Elements>
                    )}
                </div>
            </div>
        </div>
    )
}