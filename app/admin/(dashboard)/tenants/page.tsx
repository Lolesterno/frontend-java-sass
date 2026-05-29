'use client'

import { useAdminTenants, useToggleTenant } from "@/lib/hooks/useAdmin"
import { TenantAdmin } from "@/types";
import Link from "next/link";
import { useState } from "react";

export default function AdminTenantsPage() {
    const { data: tenants = [], isLoading } = useAdminTenants();
    const toggleTenant = useToggleTenant();
    const [search, setSearch] = useState('');

    const filtered = tenants.filter((t: TenantAdmin) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-white">Tenants</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{tenants.length} registrados</p>
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o slug..."
                    className="w-full max-w-sm bg-gray-900 text-white rounded-lg px-3 py-2 text-sm outline-none border border-gray-700 focus:border-indigo-500"
                />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {isLoading && <p className="text-sm text-gray-400 p-5">Cargando...</p>}

                {!isLoading && filtered.length === 0 && (
                    <p className="text-sm text-gray-500 p-5">Sin tenants</p>
                )}

                {filtered.length > 0 && (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-800">
                                <th className="text-left px-5 py-3 font-medium">Tenant</th>
                                <th className="text-left px-5 py-3 font-medium">Plan</th>
                                <th className="text-left px-5 py-3 font-medium">Estado</th>
                                <th className="text-left px-5 py-3 font-medium">Creado</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((t: TenantAdmin) => (
                                <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                                    <td className="px-5 py-3">
                                        <p className="text-sm text-white font-medium">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.slug}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs text-indigo-400 capitalize">{t.plan}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full
                      ${t.active
                                                ? 'bg-green-900 text-green-400'
                                                : 'bg-red-900 text-red-400'}`}>
                                            {t.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-500">
                                        {new Date(t.createdAt).toLocaleDateString('es-CO')}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <Link href={`/admin/tenants/${t.id}`}
                                                className="text-xs text-indigo-400 hover:underline">
                                                Ver
                                            </Link>
                                            <button
                                                onClick={() => toggleTenant.mutate({ id: t.id, active: !t.active })}
                                                disabled={toggleTenant.isPending}
                                                className={`text-xs bg-transparent border-none cursor-pointer
                          ${t.active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}>
                                                {t.active ? 'Desactivar' : 'Activar'}
                                            </button>
                                        </div>
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