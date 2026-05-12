'use client'

import VehicleStatusBadge from "@/components/fleet/VehicleStatusBadge";
import { VehicleTypeIcon } from "@/components/fleet/VehicleTypeBadge";
import { useDeleteVehicle, useUpdateVehicleStatus, useVehicles } from "@/lib/hooks/useFleet";
import { Vehicle, VehicleStatus } from "@/types";
import Link from "next/link";
import { useState } from "react";

const STATUSES: { value: string; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'AVAILABLE', label: 'Disponibles' },
    { value: 'RENTED', label: 'Rentados' },
    { value: 'MAINTENANCE', label: 'Mantenimiento' },
    { value: 'INACTIVE', label: 'Inactivos' },
]

function formatCOP(amount: number | null) {
    if (!amount) return "-";
    return new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(amount);
}

export default function FleetPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const { data: vehicles = [], isLoading } = useVehicles(statusFilter || undefined);
    const deleteVehicle = useDeleteVehicle();
    const updateStatus = useUpdateVehicleStatus('');

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-medium">Flota</h1>
                <Link href="/dashboard/fleet/new"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors no-underline">
                    + Agregar vehículo
                </Link>
            </div>

            {/* Métricas rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {STATUSES.slice(1).map(s => (
                    <div key={s.value} className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className="text-xl font-medium">
                            {vehicles.filter(v => v.status === s.value).length}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div className="flex gap-2 mb-4">
                {STATUSES.map(s => (
                    <button key={s.value}
                        onClick={() => setStatusFilter(s.value)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer
                    ${statusFilter === s.value
                                ? 'bg-indigo-500 text-white border-indigo-500'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Lista */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {isLoading && <p className="text-sm text-gray-400 p-5">Cargando...</p>}

                {!isLoading && vehicles.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-400 text-sm mb-2">Sin vehículos registrados</p>
                        <Link href="/dashboard/fleet/new"
                            className="text-indigo-500 text-sm hover:underline">
                            Agregar primer vehículo →
                        </Link>
                    </div>
                )}

                {vehicles.length > 0 && (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-100">
                                <th className="text-left px-5 py-3 font-medium">Vehículo</th>
                                <th className="text-left px-5 py-3 font-medium">Placa</th>
                                <th className="text-left px-5 py-3 font-medium">Tarifa/día</th>
                                <th className="text-left px-5 py-3 font-medium">Estado</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v: Vehicle) => (
                                <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <VehicleTypeIcon type={v.type} />
                                            <div>
                                                <p className="text-sm font-medium">{v.brand} {v.model}</p>
                                                <p className="text-xs text-gray-400">{v.year} · {v.color}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-sm font-mono text-gray-600">{v.plate}</td>
                                    <td className="px-5 py-3 text-sm">{formatCOP(v.dailyRate)}</td>
                                    <td className="px-5 py-3">
                                        <VehicleStatusBadge status={v.status as VehicleStatus} />
                                    </td>
                                    <td className="px-5 py-3">
                                        <Link href={`/dashboard/fleet/${v.id}`}
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