'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBooking, useUpdateBookingPayment, useUpdateBookingStatus } from '@/lib/hooks/useBookings'
import { useVehicle } from '@/lib/hooks/useFleet'
import { useCustomer } from '@/lib/hooks/useCustomers'
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge'
import type { BookingStatus } from '@/types'
import { PaymentModal } from '@/components/bookings/PaymentModal'
import { useConfirmPayment } from '@/lib/hooks/usePayments'

const NEXT_ACTIONS: Record<string, { label: string; status: string; className: string }[]> = {
  PENDING: [
    { label: 'Confirmar', status: 'CONFIRMED', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    { label: 'Rechazar', status: 'REJECTED', className: 'bg-red-500 hover:bg-red-600 text-white' },
  ],
  CONFIRMED: [
    { label: 'Iniciar renta', status: 'ACTIVE', className: 'bg-green-500 hover:bg-green-600 text-white' },
    { label: 'Cancelar', status: 'CANCELLED', className: 'border border-red-200 text-red-500 hover:bg-red-50' },
  ],
  ACTIVE: [
    { label: 'Completar entrega', status: 'COMPLETED', className: 'bg-indigo-500 hover:bg-indigo-600 text-white' },
  ],
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(amount)
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [showPayment, setShowPayment] = useState(false);

  const { id } = use(params)
  const router = useRouter()
  const { data: booking, isLoading } = useBooking(id)
  const { data: vehicle } = useVehicle(booking?.vehicleId ?? '')
  const { data: customer } = useCustomer(booking?.customerId ?? '')
  const updateStatus = useUpdateBookingStatus();

  const confirmPayment = useConfirmPayment();
  const updateBookingPayment = useUpdateBookingPayment();
  const [verifying, setVerifiying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  async function handleVerifyPayment() {
    if (!booking?.transactionId) return

    setVerifiying(true)
    setVerifyError('');

    try {
      // Buscamos la transaccion en Stripe por el paymentIntentId

      const tx = await confirmPayment.mutateAsync(booking?.transactionId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((tx as any).status === 'APPROVED') {
        await updateBookingPayment.mutateAsync({
          id: booking.id,
          transactionId: booking?.transactionId,
          paymentStatus: 'PAID',
        })
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setVerifyError(`Estado del pago: ${(tx as any).status}`)
      }
    } catch (error) {
      setVerifyError(error instanceof Error ? error.message : 'Error al verificar ')
    } finally {
      setVerifiying(false);
    }
  }

  if (isLoading) return <p className="text-sm text-gray-400 p-6">Cargando...</p>
  if (!booking) return <p className="text-sm text-gray-400 p-6">Reserva no encontrada</p>

  const actions = NEXT_ACTIONS[booking.status] ?? []



  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm">←</button>
        <h1 className="text-xl font-medium">Reserva</h1>
        <BookingStatusBadge status={booking.status as BookingStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl">

        {/* Vehículo */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium mb-3">Vehículo</p>
          {vehicle ? (
            <>
              <p className="text-base font-medium">{vehicle.brand} {vehicle.model}</p>
              <p className="text-sm text-gray-500">{vehicle.year} · {vehicle.plate} · {vehicle.color}</p>
            </>
          ) : <p className="text-sm text-gray-400">Cargando...</p>}
        </div>

        {/* Cliente */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium mb-3">Cliente</p>
          {customer ? (
            <>
              <p className="text-base font-medium">{customer.fullName}</p>
              <p className="text-sm text-gray-500">{customer.email}</p>
              <p className="text-sm text-gray-500">{customer.documentType} {customer.documentNumber}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-2 inline-block
                ${customer.licenseVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {customer.licenseVerified ? '✓ Licencia verificada' : '⚠ Licencia pendiente'}
              </span>
            </>
          ) : <p className="text-sm text-gray-400">Cargando...</p>}
        </div>

        {/* Detalles de la reserva */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium mb-3">Detalles</p>
          {[
            ['Inicio', new Date(booking.startDate).toLocaleString('es-CO')],
            ['Fin', new Date(booking.endDate).toLocaleString('es-CO')],
            ['Tipo tarifa', booking.rateType],
            ['Tarifa', formatCOP(booking.rateAmount)],
            ['Depósito', formatCOP(booking.depositAmount)],
            ['Total', formatCOP(booking.totalAmount)],
            ['Entrega', booking.pickupLocation ?? '—'],
            ['Devolución', booking.returnLocation ?? '—'],
            ['Fuente', booking.source],
            ['Pago', booking.paymentStatus],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Acciones */}
        {actions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-medium mb-3">Acciones</p>
            <div className="flex flex-col gap-2">
              {actions.map(action => (
                <button key={action.status}
                  onClick={() => updateStatus.mutate({ id: booking.id, status: action.status })}
                  disabled={updateStatus.isPending}
                  className={`py-2 rounded-lg text-sm font-medium cursor-pointer border-none transition-colors disabled:opacity-60 ${action.className}`}>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notas */}
        {(booking.notes || booking.internalNotes) && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-medium mb-3">Notas</p>
            {booking.notes && (
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1">Cliente</p>
                <p className="text-sm text-gray-700">{booking.notes}</p>
              </div>
            )}
            {booking.internalNotes && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Internas</p>
                <p className="text-sm text-gray-700">{booking.internalNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel de pago */}
      {booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-sm font-medium mb-3">Pago</p>

          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">Estado</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full
        ${booking.paymentStatus === 'PAID'
                ? 'bg-green-100 text-green-700'
                : booking.paymentStatus === 'FAILED'
                  ? 'bg-red-100 text-red-500'
                  : 'bg-yellow-100 text-yellow-700'}`}>
              {booking.paymentStatus === 'PAID'
                ? '✓ Pagado'
                : booking.paymentStatus === 'FAILED'
                  ? '✗ Fallido'
                  : 'Pendiente'}
            </span>
          </div>

          {/* Transacción ID si existe */}
          {booking.transactionId && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">Transacción</span>
              <span className="text-xs font-mono text-gray-400">
                {booking.transactionId.slice(0, 12)}...
              </span>
            </div>
          )}

          {verifyError && (
            <p className="text-xs text-red-500 mb-2">{verifyError}</p>
          )}

          <div className="flex flex-col gap-2">
            {/* Botón pagar — solo si pendiente y sin transacción */}
            {booking.paymentStatus === 'PENDING' && !booking.transactionId && (
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg border-none cursor-pointer transition-colors">
                💳 Generar pago
              </button>
            )}

            {/* Botón verificar — si hay transacción pero no está PAID */}
            {booking.transactionId && booking.paymentStatus !== 'PAID' && (
              <button
                onClick={handleVerifyPayment}
                disabled={verifying}
                className="w-full border border-indigo-200 text-indigo-500 hover:bg-indigo-50 disabled:opacity-60 text-sm font-medium py-2 rounded-lg cursor-pointer transition-colors bg-transparent">
                {verifying ? 'Verificando...' : '🔍 Verificar estado del pago'}
              </button>
            )}
          </div>
        </div>
      )}


      {showPayment && booking && (
        <PaymentModal
          booking={booking}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false)
          }}
        />
      )}

    </div>
  )
}