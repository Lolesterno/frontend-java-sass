type Status = 'APPROVED' | 'DECLINED' | 'REVERSED' | 'PENDING';

const CONFIG: Record<Status, { label: string; className: string }> = {
    APPROVED: { label: 'Aprobado', className: 'bg-green-100 text-green-700' },
    DECLINED: { label: 'Rechazado', className: 'bg-red-100 text-red-600' },
    REVERSED: { label: 'Reversado', className: 'bg-gray-100 text-gray-500' },
    PENDING: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
}

export function TransactionBadge({ status }: { status: Status }) {
    const { label, className } = CONFIG[status] ?? CONFIG.PENDING
    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
            {label}
        </span>
    )
}