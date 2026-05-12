'use client'

import { useAppStore } from '@/store/useAppStore';
import { CalendarDays, Car, DollarSign, House, KeyRoundIcon, Receipt, Settings, User, User2Icon } from 'lucide-react'
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Overview', icon: <House /> },
    { href: '/dashboard/fleet', label: 'Flota', icon: <Car /> },
    { href: '/dashboard/bookings', label: 'Reservas', icon: <CalendarDays /> },
    { href: '/dashboard/customers', label: 'Clientes', icon: <User2Icon /> },
    { href: '/dashboard/apikeys', label: 'API Keys', icon: <KeyRoundIcon /> },
    { href: '/dashboard/payments', label: 'Pagos', icon: <DollarSign /> },
    { href: '/dashboard/billing', label: 'Billing', icon: <Receipt /> },
    { href: '/dashboard/members', label: 'Miembros', icon: <User /> },
    { href: '/dashboard/settings', label: 'Configuración', icon: <Settings /> },
];

export function Sidebar() {
    const pathname = usePathname();
    const { branding } = useAppStore();

    const displayName = branding?.displayName ?? 'Platform';

    return (
        <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col py-6">
            <div className="px-5 pb-6">
                {branding?.logoUrl ? (
                    <Image
                        src={branding.logoUrl}
                        alt={displayName}
                        className="h-8 object-contain"
                    />
                ) : (
                    <span className="font-medium text-base text-indigo-500">
                        {displayName}
                    </span>
                )}
            </div>

            <nav className="flex-1">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2.5 px-5 py-2 text-sm transition-all no-underline
                border-r-2
                ${active
                                    ? 'font-medium text-indigo-500 bg-indigo-50 border-indigo-500'
                                    : 'font-normal text-gray-500 bg-transparent border-transparent hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-sm">{item.icon}</span>
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}