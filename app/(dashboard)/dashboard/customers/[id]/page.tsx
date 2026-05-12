'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomer, useVerifyLicense } from '@/lib/hooks/useCustomers'
import { useCustomerBookings } from '@/lib/hooks/useBookings'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'
import type { BookingStatus } from '@/types'

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: customer, isLoading } = useCustomer(id)
  const { data: bookings = [] } = useCustomerBookings(id)
  const verifyLicense = useVerifyLicense(id)

  if (isLoading) return <p className="text-sm text-gray-400 p-6">Cargando...</p>
  if (!customer) return <p className="text-sm text-gray-400 p-6">Cliente no encontrado</p>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm">←</button>
        <h1 className="text-xl font-medium">{customer.fullName}</h1>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full
          ${customer.licenseVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {customer.licenseVerified ? 'Licencia verificada' : 'Licencia pendiente'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium mb-3">Información</p>
          {[
            ['Email', customer.email],
            ['Teléfono', customer.phone ?? '—'],
            ['Documento', `${customer.documentType} ${customer.documentNumber}`],
            ['Dirección', customer.address ?? '—'],
            ['Licencia', customer.licenseNumber ?? '—'],
            ['Vence', customer.licenseExpiry
              ? new Date(customer.licenseExpiry).toLocaleDateString('es-CO')
              : '—'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}

          {!customer.licenseVerified && (
            <button
              onClick={() => verifyLicense.mutate()}
              disabled={verifyLicense.isPending}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg border-none cursor-pointer transition-colors">
              {verifyLicense.isPending ? 'Verificando...' : '✓ Marcar licencia como verificada'}
            </button>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium mb-3">Historial de reservas</p>
          {bookings.length === 0 && (
            <p className="text-sm text-gray-400">Sin reservas aún</p>
          )}
          {bookings.map(b => (
            <div key={b.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-xs text-gray-500">
                  {new Date(b.startDate).toLocaleDateString('es-CO')} →{' '}
                  {new Date(b.endDate).toLocaleDateString('es-CO')}
                </p>
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(b.totalAmount)}
                </p>
              </div>
              <BookingStatusBadge status={b.status as BookingStatus} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}