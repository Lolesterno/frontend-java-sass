const ICONS: Record<string, string> = {
    CAR: '🚗', MOTORCYCLE: '🏍️', TRUCK: '🚚',
    VAN: '🚐', BUS: '🚌', BICYCLE: '🚲',
    SCOOTER: '🛵', OTHER: '🚘',
}

export function VehicleTypeIcon({ type }: { type: string }) {
    return <span>{ICONS[type] ?? '🚘'}</span>
}