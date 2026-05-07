'use client'

import { apiRequest } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore"
import { Plan, Subscription, Usage } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function BillingPage() {
    const { user } = useAppStore();
    const queryClient = useQueryClient();

    const { data: plans = [] } = useQuery({
        queryKey: ['plans'],
        queryFn: () => apiRequest<Plan[]>('/billing/plans'),
    });

    const { data: subscription } = useQuery({
        queryKey: ['subscription', user?.tenantId],
        queryFn: () => apiRequest<Subscription>(`/billing/subscriptions/${user?.tenantId}`),
        enabled: !!user?.tenantId,
    });

    const { data: usage } = useQuery({
        queryKey: ['usage', user?.tenantId],
        queryFn: () => apiRequest<Usage>(`/billing/usage/${user?.tenantId}`),
        enabled: !!user?.tenantId,
    });

    const changePlan = useMutation({
        mutationFn: (planName: string) =>
            apiRequest(`/billing/subscriptions/${user?.tenantId}`, {
                method: 'PUT',
                body: JSON.stringify({ planName }),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
    });

    return (
        <div>
            <h1 className="text-xl font-medium mb-6">Billing</h1>

            {subscription && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <p className="text-sm text-gray-500 mb-1">Plan actual</p>
                    <p className="text-xl font-medium mb-2">{subscription.plan.displayName}</p>
                    <p className="text-sm text-gray-500">
                        Período:{' '}
                        {new Date(subscription.currentPeriodStart).toLocaleDateString('es')} —{' '}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString('es')}
                    </p>
                    {usage && (
                        <p className="text-sm text-gray-500 mt-1">
                            Requests: {usage.requestsUsed.toLocaleString()} /{' '}
                            {usage.requestsLimit === -1 ? '∞' : usage.requestsLimit.toLocaleString()}
                        </p>
                    )}
                </div>
            )}

            <h2 className="text-base font-medium mb-4">Planes disponibles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plans.map((plan) => {
                    const isCurrent = subscription?.plan.name === plan.name
                    return (
                        <div
                            key={plan.id}
                            className={`bg-white rounded-xl p-5 ${isCurrent ? 'border-2 border-indigo-500' : 'border border-gray-200'}`}
                        >
                            {isCurrent && (
                                <span className="inline-block text-xs font-medium bg-indigo-50 text-indigo-500 rounded-md px-2 py-0.5 mb-2">
                                    Plan actual
                                </span>
                            )}
                            <p className="text-base font-medium mb-1">{plan.displayName}</p>
                            <p className="text-2xl font-medium mb-2">
                                ${plan.priceMonthly}
                                <span className="text-sm font-normal text-gray-500">/mes</span>
                            </p>
                            <ul className="text-sm text-gray-500 list-disc pl-4 mb-4 space-y-1">
                                <li>
                                    {plan.maxRequests === -1
                                        ? 'Requests ilimitadas'
                                        : `${plan.maxRequests.toLocaleString()} requests/mes`}
                                </li>
                                <li>{plan.maxMembers} miembro{plan.maxMembers !== 1 ? 's' : ''}</li>
                                <li>{plan.maxApiKeys} API Keys</li>
                                {plan.features.map((f) => <li key={f}>{f}</li>)}
                            </ul>
                            {!isCurrent && (
                                <button
                                    onClick={() => changePlan.mutate(plan.name)}
                                    disabled={changePlan.isPending}
                                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg border-none cursor-pointer transition-colors"
                                >
                                    Cambiar a {plan.displayName}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}