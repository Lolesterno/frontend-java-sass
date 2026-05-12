'use client'

import { useCreateVehicle } from "@/lib/hooks/useFleet"
import { VehicleType } from "@/types"
import { useRouter } from "next/navigation"
import { useState } from "react"

const VEHICLE_TYPES: VehicleType[] = ['CAR', 'MOTORCYCLE', 'TRUCK', 'VAN', 'BUS', 'BICYCLE', 'SCOOTER', 'OTHER']
const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC']
const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'GAS']

export default function NewVehiclePage() {
    const router = useRouter();
    const createVehicle = useCreateVehicle();
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        type: VEHICLE_TYPES.find(type => type === 'CAR'),
        brand: '', model: '', year: new Date().getFullYear(),
        plate: '', color: '', seats: '', transmission: 'MANUAL',
        fuelType: 'GASOLINE', dailyRate: '', hourlyRate: '',
        weeklyRate: '', monthlyRate: '', description: '',
    })

    function set(key: string, value: string | number) {
        setForm(f => ({ ...f, [key]: value }))
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError('')

        try {
            const vehicle = await createVehicle.mutateAsync({
                ...form,
                year: Number(form.year),
                seats: Number(form.seats),
                dailyRate: Number(form.dailyRate),
                hourlyRate: Number(form.hourlyRate),
                weeklyRate: Number(form.weeklyRate),
                monthlyRate: Number(form.monthlyRate),
                plate: form.plate.toUpperCase(),

            })
            router.push(`/dashboard/fleet/${vehicle.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear vehículo')
        }
    }

    const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()}
                    className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm">←</button>
                <h1 className="text-xl font-medium">Nuevo vehículo</h1>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl">
                <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4 mb-4">
                    <p className="text-sm font-medium text-gray-700">Información básica</p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Tipo</label>
                            <select value={form.type} onChange={e => set('type', e.target.value)}
                                className={inputClass}>
                                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Año</label>
                            <input type="number" value={form.year}
                                onChange={e => set('year', e.target.value)}
                                min={1900} max={2030} required className={inputClass} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Marca</label>
                            <input type="text" value={form.brand}
                                onChange={e => set('brand', e.target.value)}
                                placeholder="Toyota" required className={inputClass} />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Modelo</label>
                            <input type="text" value={form.model}
                                onChange={e => set('model', e.target.value)}
                                placeholder="Corolla" required className={inputClass} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Placa</label>
                            <input type="text" value={form.plate}
                                onChange={e => set('plate', e.target.value.toUpperCase())}
                                placeholder="ABC123" required className={inputClass} />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Color</label>
                            <input type="text" value={form.color}
                                onChange={e => set('color', e.target.value)}
                                placeholder="Blanco" className={inputClass} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Puestos</label>
                            <input type="number" value={form.seats}
                                onChange={e => set('seats', e.target.value)}
                                placeholder="5" min={1} className={inputClass} />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Transmisión</label>
                            <select value={form.transmission}
                                onChange={e => set('transmission', e.target.value)}
                                className={inputClass}>
                                {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Combustible</label>
                            <select value={form.fuelType}
                                onChange={e => set('fuelType', e.target.value)}
                                className={inputClass}>
                                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">Descripción</label>
                        <textarea value={form.description}
                            onChange={e => set('description', e.target.value)}
                            rows={3} placeholder="Descripción del vehículo..."
                            className={inputClass} />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4 mb-4">
                    <p className="text-sm font-medium text-gray-700">Tarifas (COP)</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'hourlyRate', label: 'Por hora' },
                            { key: 'dailyRate', label: 'Por día' },
                            { key: 'weeklyRate', label: 'Por semana' },
                            { key: 'monthlyRate', label: 'Por mes' },
                        ].map(({ key, label }) => (
                            <div key={key}>
                                <label className="text-sm font-medium block mb-1">{label}</label>
                                <input type="number" value={form[key as keyof typeof form]}
                                    onChange={e => set(key, e.target.value)}
                                    placeholder="0" min={0} step={1000}
                                    className={inputClass} />
                            </div>
                        ))}
                    </div>
                </div>

                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                <button type="submit" disabled={createVehicle.isPending}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors">
                    {createVehicle.isPending ? 'Guardando...' : 'Crear vehículo'}
                </button>
            </form>
        </div>
    )
}