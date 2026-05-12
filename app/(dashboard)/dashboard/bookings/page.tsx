'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useBookings, useUpdateBookingStatus } from '@/lib/hooks/useBookings'
import { useVehicles } from '@/lib/hooks/useFleet'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'
import type { Booking, BookingStatus, Vehicle, Customer } from '@/types'

const STATUSES = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'CONFIRMED', label: 'Confirmadas' },
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'COMPLETED', label: 'Completadas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(amount)
}

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const { data: bookings = [], isLoading } = useBookings(statusFilter || undefined)
  const { data: vehicles = [] } = useVehicles()
  const { data: customers = [] } = useCustomers()
  const updateStatus = useUpdateBookingStatus()

  const vehicleMap = Object.fromEntries(vehicles.map((v: Vehicle) => [v.id, v]))
  const customerMap = Object.fromEntries(customers.map((c: Customer) => [c.id, c]))

  const NEXT_ACTIONS: Record<string, { label: string; status: string }[]> = {
    PENDING:   [{ label: 'Confirmar', status: 'CONFIRMED' }, { label: 'Rechazar', status: 'REJECTED' }],
    CONFIRMED: [{ label: 'Iniciar', status: 'ACTIVE' }, { label: 'Cancelar', status: 'CANCELLED' }],
    ACTIVE:    [{ label: 'Completar', status: 'COMPLETED' }],
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Reservas</h1>
        <Link href="/dashboard/bookings/new"
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors no-underline">
          + Nueva reserva
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {STATUSES.slice(1).map(s => (
          <div key={s.value} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-lg font-medium">
              {bookings.filter(b => b.status === s.value).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setStatusFilter(s.value)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer
                    ${statusFilter === s.value
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading && <p className="text-sm text-gray-400 p-5">Cargando...</p>}

        {!isLoading && bookings.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm mb-2">Sin reservas</p>
            <Link href="/dashboard/bookings/new"
                  className="text-indigo-500 text-sm hover:underline">
              Crear primera reserva →
            </Link>
          </div>
        )}

        {bookings.length > 0 && (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">Cliente</th>
                <th className="text-left px-5 py-3 font-medium">Vehículo</th>
                <th className="text-left px-5 py-3 font-medium">Fechas</th>
                <th className="text-left px-5 py-3 font-medium">Total</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: Booking) => {
                const vehicle = vehicleMap[b.vehicleId]
                const customer = customerMap[b.customerId]
                const actions = NEXT_ACTIONS[b.status] ?? []

                return (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium">{customer?.fullName ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : '—'}
                      <p className="text-xs text-gray-400">{vehicle?.plate}</p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(b.startDate).toLocaleDateString('es-CO')}
                      <br />→ {new Date(b.endDate).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">{formatCOP(b.totalAmount)}</td>
                    <td className="px-5 py-3">
                      <BookingStatusBadge status={b.status as BookingStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {actions.map(a => (
                          <button key={a.status}
                                  onClick={() => updateStatus.mutate({ id: b.id, status: a.status })}
                                  disabled={updateStatus.isPending}
                                  className="text-xs text-indigo-500 hover:underline bg-transparent border-none cursor-pointer disabled:opacity-40">
                            {a.label}
                          </button>
                        ))}
                        <Link href={`/dashboard/bookings/${b.id}`}
                              className="text-xs text-gray-400 hover:underline">
                          Ver
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}