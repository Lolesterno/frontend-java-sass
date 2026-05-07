'use client';

import { apiRequest } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { Subscription, Usage } from "@/types";
import { useQuery } from "@tanstack/react-query";

function MetricCard({ label, value, sub }: { label: string, value: string, sub?: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-medium">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    )
}

export default function OverviewPage() {
    const { user } = useAppStore();

    const { data: usage } = useQuery({
        queryKey: ['usage', user?.tenantId],
        queryFn: () => apiRequest<Usage>(`/billing/usage/${user?.tenantId}`),
        enabled: !!user?.tenantId,
    });

    const { data: subscription } = useQuery({
        queryKey: ['subscription', user?.tenantId],
        queryFn: () => apiRequest<Subscription>(`/billing/subscriptions/${user?.tenantId}`),
        enabled: !!user?.tenantId,
    });

    const usagePercent = usage?.usagePercent ?? 0;
    const requestsUsed = usage?.requestsUsed ?? 0;
    const requestsLimit = usage?.requestsLimit ?? 0;

    const barColor =
        usagePercent > 80 ? 'bg-red-500' :
            usagePercent > 60 ? 'bg-amber-400' :
                'bg-indigo-500';

    return (
        <div>
            <h1 className="text-xl font-medium mb-6">Overview</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
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
                        <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                        {requestsUsed.toLocaleString()} / {requestsLimit.toLocaleString()} requests
                    </p>
                </div>
            )}
        </div>
    )
}