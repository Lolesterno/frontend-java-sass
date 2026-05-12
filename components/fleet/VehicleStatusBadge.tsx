type Status = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';

const CONFIG: Record<Status, { label: string; className: string }> = {
    AVAILABLE: { label: 'Disponible', className: 'bg-green-100 text-green-700' },
    RENTED: { label: 'Rentado', className: 'bg-blue-100 text-blue-600' },
    MAINTENANCE: { label: 'Mantenimiento', className: 'bg-yellow-100 text-yellow-700' },
    INACTIVE: { label: 'Inactivo', className: 'bg-gray-100 text-gray-500' }
}

export default function VehicleStatusBadge({ status }: { status: Status }) {
    const { label, className } = CONFIG[status] ?? CONFIG.INACTIVE;

    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
            {label}
        </span>
    )
}