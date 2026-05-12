'use client'

import { useCustomers, useDeleteCustomer } from "@/lib/hooks/useCustomers";
import { Customer } from "@/types";
import Link from "next/link";
import { useState } from "react"

export default function CustomersPage() {
    const [search, setSearch] = useState('');
    const { data: customers = [], isLoading } = useCustomers(search || undefined);
    const deleteCustomer = useDeleteCustomer();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-medium">Clientes</h1>
                <Link href="/dashboard/customers/new"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors no-underline">
                    + Nuevo cliente
                </Link>
            </div>

            <div className="mb-4">
                <input type="text" value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, email o documento..."
                    className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {isLoading && <p className="text-sm text-gray-400 p-5">Cargando...</p>}

                {!isLoading && customers.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-400 text-sm mb-2">Sin clientes registrados</p>
                        <Link href="/dashboard/customers/new"
                            className="text-indigo-500 text-sm hover:underline">
                            Agregar primer cliente →
                        </Link>
                    </div>
                )}

                {customers.length > 0 && (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-medium">Cliente</th>
                                <th className="text-left px-5 py-3 font-medium">Documento</th>
                                <th className="text-left px-5 py-3 font-medium">Teléfono</th>
                                <th className="text-left px-5 py-3 font-medium">Licencia</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((c: Customer) => (
                                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3">
                                        <p className="text-sm font-medium">{c.fullName}</p>
                                        <p className="text-xs text-gray-400">{c.email}</p>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-600">
                                        {c.documentType} {c.documentNumber}
                                    </td>
                                    <td className="px-5 py-3 text-sm text-gray-600">{c.phone ?? '—'}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                      ${c.licenseVerified
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'}`}>
                                            {c.licenseVerified ? 'Verificada' : 'Pendiente'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <Link href={`/dashboard/customers/${c.id}`}
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