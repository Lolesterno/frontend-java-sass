/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useVehicles } from '@/lib/hooks/useFleet'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { useCreateBooking, useCheckAvailability } from '@/lib/hooks/useBookings'
import type { Vehicle, Customer } from '@/types'

const RATE_TYPES = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']

function calcTotal(start: string, end: string, rateType: string, rateAmount: number): number {
  if (!start || !end || !rateAmount) return 0
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const hours = ms / (1000 * 60 * 60)
  if (rateType === 'HOURLY') return Math.ceil(hours) * rateAmount
  if (rateType === 'DAILY') return Math.ceil(hours / 24) * rateAmount
  if (rateType === 'WEEKLY') return Math.ceil(hours / (24 * 7)) * rateAmount
  if (rateType === 'MONTHLY') return Math.ceil(hours / (24 * 30)) * rateAmount
  return 0
}

export default function NewBookingPage() {
  const router = useRouter()
  const { data: vehicles = [] } = useVehicles('AVAILABLE')
  const { data: customers = [] } = useCustomers()
  const createBooking = useCreateBooking()
  const checkAvailability = useCheckAvailability()

  const [form, setForm] = useState({
    vehicleId: '', customerId: '', startDate: '', endDate: '',
    rateType: 'DAILY', rateAmount: '', depositAmount: '',
    pickupLocation: '', returnLocation: '', notes: '',
  })
  const [availability, setAvailability] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    if (key === 'startDate' || key === 'endDate') setAvailability(null)
  }

  async function handleCheckAvailability() {
    if (!form.vehicleId || !form.startDate || !form.endDate) return
    const result = await checkAvailability.mutateAsync({
      vehicleId: form.vehicleId,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    })
    setAvailability(result.available)
  }

  const total = calcTotal(form.startDate, form.endDate, form.rateType, Number(form.rateAmount))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const booking = await createBooking.mutateAsync({
        vehicleId: form.vehicleId as any,
        customerId: form.customerId as any,
        startDate: new Date(form.startDate).toISOString() as any,
        endDate: new Date(form.endDate).toISOString() as any,
        rateType: form.rateType,
        rateAmount: Number(form.rateAmount),
        totalAmount: total,
        depositAmount: form.depositAmount ? Number(form.depositAmount) : 0,
        pickupLocation: form.pickupLocation || undefined,
        returnLocation: form.returnLocation || undefined,
        notes: form.notes || undefined,
      } as any)
      router.push(`/dashboard/bookings/${booking.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reserva')
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm">←</button>
        <h1 className="text-xl font-medium">Nueva reserva</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">Vehículo y cliente</p>

          <div>
            <label className="text-sm font-medium block mb-1">Vehículo disponible</label>
            <select value={form.vehicleId} onChange={e => set('vehicleId', e.target.value)}
                    required className={inputClass}>
              <option value="">Seleccionar vehículo</option>
              {(vehicles as Vehicle[]).map(v => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} — {v.plate} {v.dailyRate ? `($${v.dailyRate}/día)` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Cliente</label>
            <select value={form.customerId} onChange={e => set('customerId', e.target.value)}
                    required className={inputClass}>
              <option value="">Seleccionar cliente</option>
              {(customers as Customer[]).map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.documentType} {c.documentNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">Fechas</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Fecha inicio</label>
              <input type="datetime-local" value={form.startDate}
                     onChange={e => set('startDate', e.target.value)}
                     required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Fecha fin</label>
              <input type="datetime-local" value={form.endDate}
                     onChange={e => set('endDate', e.target.value)}
                     required className={inputClass} />
            </div>
          </div>

          {form.vehicleId && form.startDate && form.endDate && (
            <div>
              <button type="button" onClick={handleCheckAvailability}
                      disabled={checkAvailability.isPending}
                      className="text-sm text-indigo-500 bg-transparent border-none cursor-pointer hover:underline disabled:opacity-40">
                {checkAvailability.isPending ? 'Verificando...' : '🔍 Verificar disponibilidad'}
              </button>
              {availability === true && (
                <p className="text-sm text-green-600 mt-1">✓ Vehículo disponible para esas fechas</p>
              )}
              {availability === false && (
                <p className="text-sm text-red-500 mt-1">✗ Vehículo no disponible para esas fechas</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">Tarifa</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Tipo de tarifa</label>
              <select value={form.rateType} onChange={e => set('rateType', e.target.value)}
                      className={inputClass}>
                {RATE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Monto tarifa (COP)</label>
              <input type="number" value={form.rateAmount}
                     onChange={e => set('rateAmount', e.target.value)}
                     placeholder="0" min={0} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Depósito (COP)</label>
            <input type="number" value={form.depositAmount}
                   onChange={e => set('depositAmount', e.target.value)}
                   placeholder="0" min={0} className={inputClass} />
          </div>

          {total > 0 && (
            <div className="bg-indigo-50 rounded-lg p-3">
              <p className="text-sm text-indigo-700 font-medium">
                Total estimado: {new Intl.NumberFormat('es-CO', {
                  style: 'currency', currency: 'COP', minimumFractionDigits: 0
                }).format(total)}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">Detalles adicionales</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Lugar de entrega</label>
              <input value={form.pickupLocation}
                     onChange={e => set('pickupLocation', e.target.value)}
                     placeholder="Oficina principal" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Lugar de devolución</label>
              <input value={form.returnLocation}
                     onChange={e => set('returnLocation', e.target.value)}
                     placeholder="Oficina principal" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                      rows={2} placeholder="Observaciones..." className={inputClass} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={createBooking.isPending}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors">
          {createBooking.isPending ? 'Creando reserva...' : 'Crear reserva'}
        </button>
      </form>
    </div>
  )
}