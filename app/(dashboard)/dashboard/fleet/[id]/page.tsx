'use client'

import VehicleStatusBadge from "@/components/fleet/VehicleStatusBadge";
import { VehicleTypeIcon } from "@/components/fleet/VehicleTypeBadge";
import { useAddPricing, useRemovePricing, useUpdateVehicleStatus, useVehicle, useVehiclePricing } from "@/lib/hooks/useFleet";
import { RateType, VehicleStatus } from "@/types";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

const STATUS_ACTIONS: Record<string, { label: string; next: string; className: string }[]> = {
    AVAILABLE: [{ label: 'Enviar a mantenimiento', next: 'MAINTENANCE', className: 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' }],
    RENTED: [],
    MAINTENANCE: [{ label: 'Marcar disponible', next: 'AVAILABLE', className: 'text-green-600 border-green-200 hover:bg-green-50' }],
    INACTIVE: [{ label: 'Reactivar', next: 'AVAILABLE', className: 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' }],
}


const RATE_TYPES: RateType[] = ["HOURLY", "DAILY", "WEEKLY", "MONTHLY"];

function formatCOP(amount: number | null) {
    if (!amount) return '—'
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount)
}

export default function VehicleDetailPAge({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: vehicle, isLoading } = useVehicle(id);
    const { data: pricing = [] } = useVehiclePricing(id);
    const updateStatus = useUpdateVehicleStatus(id);
    const addPricing = useAddPricing(id);
    const removePricing = useRemovePricing(id);

    const [newRate, setNewRate] = useState({ rateType: 'DAILY', amount: '' });

    if (isLoading) return <p className="text-sm text-gray-400 p-6">Cargando...</p>
    if (!vehicle) return <p className="text-sm text-gray-400 p-6">Vehiculo no encontrado</p>

    const actions = STATUS_ACTIONS[vehicle.status] ?? [];

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()}
                    className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm">←</button>
                <VehicleTypeIcon type={vehicle.type} />
                <h1 className="text-xl font-medium">{vehicle.brand} {vehicle.model}</h1>
                <VehicleStatusBadge status={vehicle.status as VehicleStatus} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl">

                {/* Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm font-medium mb-3">Información</p>
                    {[
                        ['Placa', vehicle.plate],
                        ['Año', String(vehicle.year)],
                        ['Color', vehicle.color ?? '—'],
                        ['Puestos', String(vehicle.seats ?? '—')],
                        ['Transmisión', vehicle.transmission],
                        ['Combustible', vehicle.fuelType],
                        ['VIN', vehicle.vin ?? '—'],
                    ].map(([label, value]) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className="text-sm font-medium">{value}</span>
                        </div>
                    ))}
                </div>

                {/* Tarifas base */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm font-medium mb-3">Tarifas base</p>
                    {[
                        ['Por hora', vehicle.hourlyRate],
                        ['Por día', vehicle.dailyRate],
                        ['Por semana', vehicle.weeklyRate],
                        ['Por mes', vehicle.monthlyRate],
                    ].map(([label, value]) => (
                        <div key={label as string}
                            className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-gray-500">{label as string}</span>
                            <span className="text-sm font-medium">{formatCOP(value as number | null)}</span>
                        </div>
                    ))}
                </div>

                {/* Tarifas personalizadas */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <p className="text-sm font-medium mb-3">Tarifas personalizadas</p>

                    {pricing.map(p => (
                        <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-gray-500">{p.rateType}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{formatCOP(p.amount)}</span>
                                <button onClick={() => removePricing.mutate(p.id)}
                                    className="text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-2 mt-3">
                        <select value={newRate.rateType}
                            onChange={e => setNewRate(r => ({ ...r, rateType: e.target.value }))}
                            className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                            {RATE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <input type="number" value={newRate.amount}
                            onChange={e => setNewRate(r => ({ ...r, amount: e.target.value }))}
                            placeholder="Monto" min={0}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        <button
                            onClick={() => {
                                if (!newRate.amount) return
                                addPricing.mutate({ rateType: newRate.rateType, amount: Number(newRate.amount) })
                                setNewRate(r => ({ ...r, amount: '' }))
                            }}
                            className="bg-indigo-500 text-white text-sm px-3 rounded-lg border-none cursor-pointer hover:bg-indigo-600">
                            +
                        </button>
                    </div>
                </div>

                {/* Acciones de estado */}
                {actions.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <p className="text-sm font-medium mb-3">Acciones</p>
                        <div className="flex flex-col gap-2">
                            {actions.map(action => (
                                <button key={action.next}
                                    onClick={() => updateStatus.mutate(action.next)}
                                    disabled={updateStatus.isPending}
                                    className={`border rounded-lg py-2 text-sm font-medium cursor-pointer bg-transparent transition-colors disabled:opacity-60 ${action.className}`}>
                                    {action.label}
                                </button>
                            ))}
                            <button
                                onClick={() => updateStatus.mutate('INACTIVE')}
                                disabled={updateStatus.isPending || vehicle.status === 'INACTIVE'}
                                className="border border-gray-200 rounded-lg py-2 text-sm text-gray-500 cursor-pointer bg-transparent hover:bg-gray-50 transition-colors disabled:opacity-40">
                                Desactivar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}