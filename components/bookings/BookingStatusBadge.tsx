type Status = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'

const CONFIG: Record<Status, { label: string; className: string }> = {
  PENDING:   { label: 'Pendiente',  className: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-blue-100 text-blue-600' },
  ACTIVE:    { label: 'Activa',     className: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completada', className: 'bg-gray-100 text-gray-600' },
  CANCELLED: { label: 'Cancelada',  className: 'bg-red-100 text-red-500' },
  REJECTED:  { label: 'Rechazada',  className: 'bg-red-100 text-red-600' },
}

export function BookingStatusBadge({ status }: { status: Status }) {
  const { label, className } = CONFIG[status] ?? CONFIG.PENDING
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  )
}