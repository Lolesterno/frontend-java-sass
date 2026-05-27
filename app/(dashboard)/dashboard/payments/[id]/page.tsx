'use client'

import { TransactionBadge } from "@/components/payments/TransactionBadge";
import { apiRequest } from "@/lib/api";
import { useConfirmPayment, useRefundPayment } from "@/lib/hooks/usePayments";
import { Transaction } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-3 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-800">{value}</span>
        </div>
    )
}

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const reverse = useRefundPayment();
    const confirmPayment = useConfirmPayment();

    const [verifying, setVerifying] = useState(false)
    const [verifyResult, setVerifyResult] = useState<string | null>(null)
    const [error, setError] = useState('')

    const { data: tx, isLoading, refetch } = useQuery({
        queryKey: ['transaction', id],
        queryFn: async () => {
            const txs = await apiRequest<Transaction[]>('/payments/transactions')
            return txs.find(t => t.id === id) ?? null
        },
    });

    if (isLoading) {
        return <p className="text-sm text-gray-400 p-6">Cargando...</p>
    }

    if (!tx) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Transacción no encontrada</p>
                <button onClick={() => router.back()}
                    className="text-indigo-500 text-sm hover:underline bg-transparent border-none cursor-pointer">
                    ← Volver
                </button>
            </div>
        )
    }

    async function handleVerify() {
        if (!tx?.responseCode) return
        setVerifying(true);
        setError('')
        setVerifyResult(null)

        try {
            const result = await confirmPayment.mutateAsync(tx.responseCode);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const status = (result as any).status
            setVerifyResult(status)
            refetch();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al verificar el pago')
        } finally {
            setVerifying(false);
        }
    }

    async function handleReverse() {
        if (!tx?.responseCode) return;
        setError('')
        try {
            await reverse.mutateAsync(tx.responseCode);
            refetch();
        } catch (error) {
            setError(error instanceof Error ? error.message : ' Errlr al realizar el reverso del pago');
        }
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()}
                    className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm">
                    ←
                </button>
                <h1 className="text-xl font-medium">Detalle de transacción</h1>
            </div>

            <div className="max-w-lg bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-medium">
                            {new Intl.NumberFormat('es-CO', {
                                style: 'currency', currency: tx.currency, minimumFractionDigits: 0
                            }).format(tx.amount)}
                        </p>
                        <p className="text-sm text-gray-400 mt-0.5">{tx.description}</p>
                    </div>
                    <TransactionBadge status={tx.status} />
                </div>

                {/* Detalles */}
                <div className="px-6 py-2">
                    <DetailRow label="ID" value={tx.id} />
                    <DetailRow label="Tarjeta"
                        value={tx.cardLastFour
                            ? `${tx.cardBrand} ···· ${tx.cardLastFour}`
                            : '—'} />
                    <DetailRow label="Moneda" value={tx.currency} />
                    <DetailRow label="Código de respuesta" value={tx.responseCode ?? '—'} />
                    <DetailRow label="Mensaje" value={tx.responseMessage ?? '—'} />
                    <DetailRow
                        label="Fecha"
                        value={new Date(tx.createdAt).toLocaleString('es-CO')}
                    />
                </div>

                {/* Resultado de verificación */}
                {verifyResult && (
                    <div className={`mx-6 mb-3 px-4 py-3 rounded-lg text-sm
            ${verifyResult === 'APPROVED'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'}`}>
                        {verifyResult === 'APPROVED'
                            ? '✓ Pago confirmado en Stripe'
                            : `Estado en Stripe: ${verifyResult}`}
                    </div>
                )}

                {error && (
                    <p className="mx-6 mb-3 text-sm text-red-500">{error}</p>
                )}

                {/* Acciones */}
                <div className="px-6 py-4 border-t border-gray-100 flex flex-col gap-2">

                    {/* Verificar — solo si está PENDING */}
                    {tx.status === 'PENDING' && tx.responseCode && (
                        <button
                            onClick={handleVerify}
                            disabled={verifying}
                            className="w-full border border-indigo-200 text-indigo-500 hover:bg-indigo-50 disabled:opacity-60 font-medium py-2 rounded-lg text-sm cursor-pointer transition-colors bg-transparent">
                            {verifying ? 'Verificando...' : '🔍 Verificar estado en Stripe'}
                        </button>
                    )}

                    {/* Reversar — solo si está APPROVED */}
                    {tx.status === 'APPROVED' && tx.responseCode && (
                        <button
                            onClick={handleReverse}
                            disabled={reverse.isPending}
                            className="w-full border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60 font-medium py-2 rounded-lg text-sm cursor-pointer transition-colors bg-transparent">
                            {reverse.isPending ? 'Reversando...' : 'Reversar transacción'}
                        </button>
                    )}

                    {/* Ya reversada o rechazada — sin acciones */}
                    {(tx.status === 'REVERSED' || tx.status === 'DECLINED') && (
                        <p className="text-xs text-center text-gray-400">
                            Sin acciones disponibles para este estado
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}