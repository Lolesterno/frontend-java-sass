'use client'

import { useAdminSubscriptions, useAdminTenant, useAdminTenants } from "@/lib/hooks/useAdmin";
import { TenantAdmin } from "@/types";

function MetricCard({ label, value, sub, color }: {
    label: string; value: string; sub?: string; color?: string
}) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${color ?? 'text-white'}`}>{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    )
}

export default function AdminOverviewPage() {
    const { data: tenants = [] } = useAdminTenants();
    const { data: subscriptions = [] } = useAdminSubscriptions();

    const activeTenants = tenants.filter((t: TenantAdmin) => t.active).length;
    const inactiveTenants = tenants.filter((t: TenantAdmin) => !t.active).length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planDist = subscriptions.reduce((acc: Record<string, number>, s: any) => {
        const plan = s.plan?.name ?? 'unknown';
        acc[plan] = (acc[plan] ?? 0) + 1;
        return acc
    }, {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mrr = subscriptions.reduce((acc: number, s: any) => {
        return acc + (s.plan?.priceMonhtly ?? 0)
    }, 0);

    const newThisWeek = tenants.filter((t: TenantAdmin) => {
        const created = new Date(t.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
    }).length;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">Overview</h1>
                <p className="text-sm text-gray-400 mt-0.5">Estado general de la plataforma</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <MetricCard label="Total tenants" value={String(tenants.length)} />
                <MetricCard label="Tenants activos" value={String(activeTenants)} color="text-green-400" />
                <MetricCard label="Nuevos esta semana" value={String(newThisWeek)} color="text-indigo-400" />
                <MetricCard label="MRR estimado" value={`$${mrr}`} sub="USD / mes" color="text-yellow-400" />
            </div>

            {/* Distribución de planes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-white mb-4">Distribución de planes</p>
                    {Object.entries(planDist).map(([plan, count]) => (
                        <div key={plan} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                            <span className="text-sm text-gray-400 capitalize">{plan}</span>
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${(count / subscriptions.length) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-white font-medium w-6 text-right">{count}</span>
                            </div>
                        </div>
                    ))}
                    {Object.keys(planDist).length === 0 && (
                        <p className="text-sm text-gray-500">Sin suscripciones</p>
                    )}
                </div>

                {/* Tenants recientes */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-sm font-medium text-white mb-4">Tenants recientes</p>
                    {tenants.slice(0, 5).map((t: TenantAdmin) => (
                        <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                            <div>
                                <p className="text-sm text-white">{t.name}</p>
                                <p className="text-xs text-gray-500">{t.slug}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                                    }`}>
                                    {t.active ? 'Activo' : 'Inactivo'}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">{t.plan}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}