'use client'

import { useAdminPlans, useAdminSubscriptions, useOverridePlan } from "@/lib/hooks/useAdmin"
import { Plan } from "@/types";
import { useState } from "react";

export default function AdminSubscriptionsPage() {
    const { data: subscriptions = [], isLoading } = useAdminSubscriptions();
    const { data: plans = [] } = useAdminPlans();
    const overridePlan = useOverridePlan();
    const [overriding, setOverriding] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState('');

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Suscripciones</h1>
                <p className="text-sm text-gray-400 mt-0.5">{subscriptions.length} suscripciones activas</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {isLoading && <p className="text-sm text-gray-400 p-5">Cargando...</p>}

                {subscriptions.length > 0 && (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-800">
                                <th className="text-left px-5 py-3 font-medium">Tenant ID</th>
                                <th className="text-left px-5 py-3 font-medium">Plan</th>
                                <th className="text-left px-5 py-3 font-medium">Estado</th>
                                <th className="text-left px-5 py-3 font-medium">Renovación</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((s) => (
                                <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                                    <td className="px-5 py-3 text-xs text-gray-400 font-mono">
                                        {s.tenantId?.toString().slice(0, 8)}...
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs text-indigo-400 capitalize">
                                            {s.plan?.displayName ?? s.plan?.name ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full
                      ${s.status === 'ACTIVE'
                                                ? 'bg-green-900 text-green-400'
                                                : 'bg-yellow-900 text-yellow-400'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-xs text-gray-500">
                                        {s.currentPeriodEnd
                                            ? new Date(s.currentPeriodEnd).toLocaleDateString('es-CO')
                                            : '—'}
                                    </td>
                                    <td className="px-5 py-3">
                                        {overriding === s.tenantId ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={selectedPlan}
                                                    onChange={e => setSelectedPlan(e.target.value)}
                                                    className="bg-gray-800 text-white text-xs rounded px-2 py-1 border border-gray-700 outline-none">
                                                    <option value="">Plan...</option>
                                                    {(plans as Plan[]).map(p => (
                                                        <option key={p.id} value={p.name}>{p.displayName}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => {
                                                        if (!selectedPlan) return
                                                        overridePlan.mutate({ tenantId: s.tenantId, planName: selectedPlan })
                                                        setOverriding(null)
                                                    }}
                                                    className="text-xs text-green-400 bg-transparent border-none cursor-pointer">
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => setOverriding(null)}
                                                    className="text-xs text-gray-400 bg-transparent border-none cursor-pointer">
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setOverriding(s.tenantId)}
                                                className="text-xs text-indigo-400 hover:underline bg-transparent border-none cursor-pointer">
                                                Cambiar plan
                                            </button>
                                        )}
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