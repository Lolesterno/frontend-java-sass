'use client'

import { apiRequest } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore"
import { Plan, Subscription, Usage } from "@/types";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function PlanCard({
    plan,
    current,
    onSelect,
    loading
}: {
    plan: Plan;
    current: boolean;
    onSelect: () => void;
    loading: boolean
}) {
    const features = plan.features ?? [];

    return (
        <div className={`bg-white border-2 rounded-2xl p-6 flex flex-col gap-4 transition-all
      ${current ? 'border-indigo-500' : 'border-gray-200 hover:border-indigo-200'}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-base font-medium">{plan.displayName}</p>
                    <p className="text-2xl font-bold mt-1">
                        {plan.priceMonthly === 0
                            ? 'Gratis'
                            : `$${plan.priceMonthly}/mes`}
                    </p>
                </div>
                {current && (
                    <span className="text-xs bg-indigo-100 text-indigo-600 font-medium px-2 py-1 rounded-full">
                        Plan actual
                    </span>
                )}
            </div>

            <ul className="flex flex-col gap-1.5">
                {features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-green-500 text-xs">✓</span>
                        {f.replace(':', ': ').replace(/_/g, ' ')}
                    </li>
                ))}
            </ul>

            {!current && plan.priceMonthly > 0 && (
                <button
                    onClick={onSelect}
                    disabled={loading}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm border-none cursor-pointer transition-colors mt-auto">
                    {loading ? 'Procesando...' : `Cambiar a ${plan.displayName}`}
                </button>
            )}
        </div>
    )
}

function CheckoutModal({
    clientSecret,
    publicKey,
    planName,
    amount,
    onClose,
    onSuccess
}: {
    clientSecret: string;
    publicKey: string;
    planName: string;
    amount: number;
    onClose: () => void;
    onSuccess: (paymentIntentId: string) => void
}) {
    const stripe = loadStripe(publicKey);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState('');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm font-medium">Activar plan {planName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            ${(amount / 100).toFixed(2)} USD / mes
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="text-gray-400 bg-transparent border-none cursor-pointer text-xl">✕</button>
                </div>

                <Elements stripe={stripe} options={{ clientSecret }}>
                    <BillingPaymentForm
                        clientSecret={clientSecret}
                        amount={amount}
                        onSuccess={onSuccess}
                        onError={setError}
                    />
                </Elements>

                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
        </div>
    )
}

function BillingPaymentForm({
    clientSecret,
    amount,
    onSuccess,
    onError
}: {
    clientSecret: string;
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    onError: (e: string) => void
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required"
        })

        if (error) {
            onError(error.message ?? 'Error al procesar la compra')
        } else if (paymentIntent?.status === 'succeeded') {
            onSuccess(paymentIntent.id)
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <PaymentElement />
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm border-none cursor-pointer">
                {loading ? 'Procesando...' : `Pagar $${(amount / 100).toFixed(2)} USD`}
            </button>
        </form>
    )
}

export default function BillingPage() {
    const { user } = useAppStore();
    const queryClient = useQueryClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [checkout, setCheckout] = useState<any>(null)
    const [success, setSuccess] = useState(false);

    const { data: plans = [] } = useQuery({
        queryKey: ['plans'],
        queryFn: () => apiRequest<Plan[]>('/billing/plans'),
    });

    const { data: subscription } = useQuery({
        queryKey: ['subscription', user?.tenantId],
        queryFn: () => apiRequest<Subscription>(`/billing/subscriptions/${user?.tenantId}`),
        enabled: !!user?.tenantId,
    });

    const createCheckout = useMutation({
        mutationFn: (planName: string) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiRequest<any>('/billing/checkout', {
                method: 'POST',
                body: JSON.stringify({ planName })
            }),
    })

    const activatePlan = useMutation({
        mutationFn: ({ paymentIntentId, planName }: { paymentIntentId: string; planName: string }) =>
            apiRequest<Subscription>(
                `/billing/activate?paymentIntentId=${paymentIntentId}&planName=${planName}`,
                { method: 'POST' }
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        }
    })

    async function handleSelectPlan(planName: string) {
        try {
            const response = await createCheckout.mutateAsync(planName);
            setCheckout(response);
        } catch (error) {
            console.error(error)
        }
    }

    async function handlePaymentSuccess(paymentIntentId: string) {
        if (!checkout) return;
        await activatePlan.mutateAsync({
            paymentIntentId,
            planName: checkout.planName
        });
        setCheckout(null)
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
    }

    const currentPlanName = subscription?.plan?.name ?? 'Free'

    return (
        <div>
            <h1 className="text-xl font-medium mb-2">Billing</h1>
            <p className="text-sm text-gray-400 mb-6">
                Gestiona tu suscripción a la plataforma
            </p>

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <span className="text-green-500">✓</span>
                    <p className="text-green-700 text-sm font-medium">Plan activado correctamente</p>
                </div>
            )}

            {/* Plan actual */}
            {subscription && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-indigo-800">Plan activo</p>
                            <p className="text-xs text-indigo-600 mt-0.5">
                                {subscription.plan.displayName} ·{' '}
                                {subscription.plan.priceMonthly === 0
                                    ? 'Gratis'
                                    : `$${subscription.plan.priceMonthly}/mes`}
                            </p>
                        </div>
                        <p className="text-xs text-indigo-500">
                            Renueva: {subscription.currentPeriodEnd
                                ? new Date(subscription.currentPeriodEnd).toLocaleDateString('es-CO')
                                : '—'}
                        </p>
                    </div>
                </div>
            )}

            {/* Grid de planes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan: Plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        current={plan.name === currentPlanName}
                        onSelect={() => handleSelectPlan(plan.name)}
                        loading={createCheckout.isPending}
                    />
                ))}
            </div>

            {/* Modal de pago */}
            {checkout && (
                <CheckoutModal
                    clientSecret={checkout.clientSecret}
                    publicKey={checkout.publicKey}
                    planName={checkout.planName}
                    amount={checkout.amount}
                    onClose={() => setCheckout(null)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    )
}