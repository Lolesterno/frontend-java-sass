'use client'

import { useAdminStore } from "@/store/useAdminStore";
import { Building, CreditCard, DollarSign, Home, User } from "lucide-react"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react";

const NAV_ITEMS = [
    { href: '/admin/dashboard', label: 'Overview', icon: <Home /> },
    { href: '/admin/tenants', label: 'Tenants', icon: <Building /> },
    { href: '/admin/subscriptions', label: 'Suscripciones', icon: <CreditCard /> },
    { href: '/admin/plans', label: 'Planes', icon: <DollarSign /> },
    { href: '/admin/admins', label: 'Administradores', icon: <User /> },
]

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { admin, accessToken, logout } = useAdminStore();

    useEffect(() => {
        if (!accessToken) router.push('/admin/login')
    }, [accessToken, router]);

    if (!accessToken) return null;

    return (
        <div className="min-h-screen bg-gray-950 flex">

            {/* Sidebar */}
            <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="px-4 py-5 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">⚡</span>
                        </div>
                        <div>
                            <p className="text-white text-xs font-semibold">Admin Panel</p>
                            <p className="text-gray-500 text-xs">{admin?.role}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-2 py-3">
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 no-underline transition-colors
                ${pathname === item.href
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="px-4 py-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-0.5 truncate">{admin?.name}</p>
                    <p className="text-xs text-gray-600 truncate mb-3">{admin?.email}</p>
                    <button
                        onClick={() => { logout(); router.push('/admin/login') }}
                        className="w-full text-xs text-gray-400 hover:text-red-400 bg-transparent border border-gray-700 hover:border-red-700 rounded-lg py-1.5 cursor-pointer transition-colors">
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido */}
            <main className="flex-1 p-6 overflow-auto">
                {children}
            </main>
        </div>
    )
}