'use client'

import { useAdminPlans, useAdminTenant, useOverridePlan, useToggleTenant } from "@/lib/hooks/useAdmin";
import { Plan } from "@/types";
import { useRouter } from "next/navigation";
import { use, useState } from "react"

export default function AdminTenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: tenant, isLoading } = useAdminTenant(id);
    const { data: plans = [] } = useAdminPlans();
    const toggleTenant = useToggleTenant();
    const overridePlan = useOverridePlan();
    const [selectedPlan, setSelectedPlan] = useState('');

    if (isLoading) return <p className="text-gray-400 text-sm">Cargando...</p>
    if (!tenant) return <p className="text-gray-400 text-sm">Tenant no encontrado</p>

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()}
                    className="text-gray-400 hover:text-white bg-transparent border-none cursor-pointer text-sm">←</button>
                <div>
                    <h1 className="text-xl font-semibold text-white">{tenant.name}</h1>
                    <p className="text-sm text-gray-400">{tenant.slug}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full
          ${tenant.active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {tenant.active ? 'Activo' : 'Inactivo'}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl">

                {/* Info */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-white mb-3">Información</p>
                    {[
                        ['ID', tenant.id],
                        ['Plan', tenant.plan],
                        ['Owner ID', tenant.ownerId],
                        ['Creado', new Date(tenant.createdAt).toLocaleString('es-CO')],
                    ].map(([label, value]) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                            <span className="text-sm text-gray-400">{label}</span>
                            <span className="text-xs text-gray-300 font-mono">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Acciones */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-white mb-3">Acciones</p>

                    {/* Override plan */}
                    <div className="mb-4">
                        <label className="text-xs text-gray-400 block mb-1">Cambiar plan manualmente</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedPlan}
                                onChange={e => setSelectedPlan(e.target.value)}
                                className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-2 py-1.5 border border-gray-700 outline-none">
                                <option value="">Seleccionar plan</option>
                                {(plans as Plan[]).map(p => (
                                    <option key={p.id} value={p.name}>{p.displayName}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                    if (!selectedPlan) return
                                    overridePlan.mutate({ tenantId: id, planName: selectedPlan })
                                }}
                                disabled={!selectedPlan || overridePlan.isPending}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors">
                                Aplicar
                            </button>
                        </div>
                    </div>

                    {/* Toggle estado */}
                    <button
                        onClick={() => toggleTenant.mutate({ id, active: !tenant.active })}
                        disabled={toggleTenant.isPending}
                        className={`w-full py-2 rounded-lg text-sm font-medium border-none cursor-pointer transition-colors
              ${tenant.active
                                ? 'bg-red-900 hover:bg-red-800 text-red-300'
                                : 'bg-green-900 hover:bg-green-800 text-green-300'}`}>
                        {tenant.active ? 'Desactivar tenant' : 'Activar tenant'}
                    </button>
                </div>
            </div>
        </div>
    )
}