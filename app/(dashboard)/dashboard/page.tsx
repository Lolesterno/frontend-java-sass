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

  const { data: usage } = useQuery({
    queryKey: ['usage', user?.tenantId],
    queryFn: () => apiRequest<Usage>(`/billing/usage/${user?.tenantId}`),
    enabled: !!user?.tenantId,
  })

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

  const usagePercent = usage?.usagePercent ?? 0
  const requestsUsed = usage?.requestsUsed ?? 0
  const requestsLimit = usage?.requestsLimit ?? 0

  const barColor =
    usagePercent > 80 ? 'bg-red-500' :
    usagePercent > 60 ? 'bg-amber-400' : 'bg-indigo-500'

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
          label="Requests este mes"
          value={requestsUsed.toLocaleString()}
          sub={requestsLimit === -1 ? 'Sin límite' : `de ${requestsLimit.toLocaleString()}`}
        />
        <MetricCard
          label="Plan activo"
          value={subscription?.plan.displayName ?? '—'}
          sub={subscription
            ? `Renovación: ${new Date(subscription.currentPeriodEnd).toLocaleDateString('es')}`
            : '—'}
        />
        <MetricCard
          label="Uso del período"
          value={`${usagePercent.toFixed(1)}%`}
          sub={requestsLimit === -1 ? 'Ilimitado' : undefined}
        />
      </div>

      {requestsLimit !== -1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium mb-2">Uso de requests</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`}
                 style={{ width: `${Math.min(usagePercent, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {requestsUsed.toLocaleString()} / {requestsLimit.toLocaleString()} requests
          </p>
        </div>
      )}
    </div>
  )
}