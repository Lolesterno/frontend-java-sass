'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { apiRequest } from '@/lib/api'
import type { Usage, Subscription } from '@/types'

function MetricCard({ label, value, sub, color = '' }: {
  label: string; value: string; sub?: string; color?: string
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-medium ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function OverviewPage() {
  const { user } = useAppStore()

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.tenantId],
    queryFn: () => apiRequest<Subscription>(`/billing/subscriptions/${user?.tenantId}`),
    enabled: !!user?.tenantId,
  })

  const { data: vehicleCount } = useQuery({
    queryKey: ['vehicles-count'],
    queryFn: () => apiRequest<number>('/fleet/vehicles/count'),
  })

  const { data: customerCount } = useQuery({
    queryKey: ['customers-count'],
    queryFn: () => apiRequest<number>('/customers/count'),
  })

  const { data: bookingCount } = useQuery({
    queryKey: ['bookings-count'],
    queryFn: () => apiRequest<number>('/bookings/count'),
  })


  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Overview</h1>

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Negocio</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <MetricCard label="Vehículos" value={String(vehicleCount ?? '—')} sub="en flota" />
        <MetricCard label="Clientes" value={String(customerCount ?? '—')} sub="registrados" />
        <MetricCard label="Reservas activas" value={String(bookingCount ?? '—')} sub="en curso" />
      </div>

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Plataforma</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        
        <MetricCard
          label="Plan activo"
          value={subscription?.plan.displayName ?? '—'}
          sub={subscription
            ? `Renovación: ${new Date(subscription.currentPeriodEnd).toLocaleDateString('es')}`
            : '—'}
        />
        
      </div>

    </div>
  )
}