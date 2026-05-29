'use client'

import { useAdminPlans, useUpdatePlan } from "@/lib/hooks/useAdmin"
import { Plan } from "@/types";
import { useState } from "react";

export default function AdminPlansPage() {
    const { data: plans = [], isLoading } = useAdminPlans();
    const updatePlan = useUpdatePlan();
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState<Partial<Plan>>({});

    function startEdit(plan: Plan) {
        setEditing(plan.id);
        setForm({
            priceMonthly: plan.priceMonthly,
            priceYearly: plan.priceYearly,
            maxMembers: plan.maxMembers,
            maxApiKeys: plan.maxApiKeys
        })
    }

    async function handleSave(id: string) {
        await updatePlan.mutateAsync({ id, data: form });
        setEditing(null);
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Planes</h1>
                <p className="text-sm text-gray-400 mt-0.5">Gestiona los planes de la plataforma</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(plans as Plan[]).map(plan => (
                    <div key={plan.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-white font-medium">{plan.displayName}</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    ${plan.priceMonthly}
                                    <span className="text-sm text-gray-400 font-normal">/mes</span>
                                </p>
                            </div>
                            <button
                                onClick={() => editing === plan.id ? setEditing(null) : startEdit(plan)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 bg-transparent border-none cursor-pointer">
                                {editing === plan.id ? 'Cancelar' : 'Editar'}
                            </button>
                        </div>

                        {editing === plan.id ? (
                            <div className="flex flex-col gap-3">
                                {[
                                    { key: 'priceMonthly', label: 'Precio mensual ($)' },
                                    { key: 'priceYearly', label: 'Precio anual ($)' },
                                    { key: 'maxMembers', label: 'Máx. miembros (-1 = ilimitado)' },
                                    { key: 'maxApiKeys', label: 'Máx. API keys' },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label className="text-xs text-gray-400 block mb-1">{label}</label>
                                        <input
                                            type="number"
                                            value={form[key as keyof Plan] as number ?? ''}
                                            onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                                            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700 outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleSave(plan.id)}
                                    disabled={updatePlan.isPending}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg border-none cursor-pointer transition-colors">
                                    {updatePlan.isPending ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {plan.features?.map((f: string) => (
                                    <div key={f} className="flex items-center gap-2">
                                        <span className="text-green-500 text-xs">✓</span>
                                        <span className="text-xs text-gray-400">{f}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}