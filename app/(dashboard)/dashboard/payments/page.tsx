'use client'

import { TransactionBadge } from "@/components/payments/TransactionBadge";
import { useTransactions } from "@/lib/hooks/usePayments"
import { Transaction } from "@/types";
import Link from "next/link";

function formatCOP(amount: number) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default function PaymentsPage() {
    const { data: transactions = [], isLoading } = useTransactions();
    const approved = transactions.filter(t => t.status === 'APPROVED').length;
    const declined = transactions.filter(t => t.status === 'DECLINED').length;
    const total = transactions.filter(t => t.status === 'APPROVED').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div>
            {/* <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-medium">Pagos</h1>
                <Link href="/dashboard/payments/new"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors no-underline">
                    + Nuevo cobro
                </Link>
            </div> */}

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Total cobrado</p>
                    <p className="text-2xl font-medium text-green-600">{formatCOP(total)}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Aprobadas</p>
                    <p className="text-2xl font-medium">{approved}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm text-gray-500 mb-1">Rechazadas</p>
                    <p className="text-2xl font-medium text-red-500">{declined}</p>
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-sm font-medium">Transacciones recientes</p>
                </div>

                {isLoading && (
                    <p className="text-sm text-gray-400 p-5">Cargando...</p>
                )}

                {!isLoading && transactions.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-400 text-sm mb-2">Sin transacciones</p>
                        <Link href="/dashboard/payments/new"
                            className="text-indigo-500 text-sm hover:underline">
                            Realizar primer cobro →
                        </Link>
                    </div>
                )}

                {transactions.length > 0 && (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-medium">Descripción</th>
                                <th className="text-left px-5 py-3 font-medium">Tarjeta</th>
                                <th className="text-left px-5 py-3 font-medium">Monto</th>
                                <th className="text-left px-5 py-3 font-medium">Estado</th>
                                <th className="text-left px-5 py-3 font-medium">Fecha</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx: Transaction) => (
                                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3 text-sm text-gray-700">{tx.description || '—'}</td>
                                    <td className="px-5 py-3 text-sm font-mono text-gray-500">
                                        {tx.cardBrand} ···· {tx.cardLastFour}
                                    </td>
                                    <td className="px-5 py-3 text-sm font-medium">
                                        {formatCOP(tx.amount)}
                                    </td>
                                    <td className="px-5 py-3">
                                        <TransactionBadge status={tx.status} />
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-400">
                                        {new Date(tx.createdAt).toLocaleString('es-CO')}
                                    </td>
                                    <td className="px-5 py-3">
                                        <Link href={`/dashboard/payments/${tx.id}`}
                                            className="text-xs text-indigo-500 hover:underline">
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}