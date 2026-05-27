'use client'

import { useConfigureGateway, useGatewayConfig } from "@/lib/hooks/usePayments"
import { useState } from "react";

export default function PaymentSettingsPage() {
    const { data: config, isLoading } = useGatewayConfig();
    const configure = useConfigureGateway();

    const [form, setForm] = useState({
        gatewayType: 'STRIPE',
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
        mode: 'sandbox',
    })

    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    function set(key: string, value: string) {
        setForm(f => ({ ...f, [key]: value }));
    }

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault()
        setError('')
        try {
            await configure.mutateAsync(form);
            setSaved(true)
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error al guardar la configuración');
        }
    }

    const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-mono"

    return (
        <div>
            <h1 className="text-xl font-medium mb-6">Configuración de pagos</h1>

            {/* Estado actual */}
            {!isLoading && (
                <div className={`rounded-xl p-4 mb-6 flex items-center gap-3
          ${config?.configured
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-yellow-50 border border-yellow-200'}`}>
                    <span className="text-lg">{config?.configured ? '✓' : '⚠'}</span>
                    <div>
                        <p className={`text-sm font-medium ${config?.configured ? 'text-green-700' : 'text-yellow-700'}`}>
                            {config?.configured
                                ? `Stripe configurado · Modo ${config.mode}`
                                : 'Sin pasarela de pago configurada'}
                        </p>
                        <p className={`text-xs mt-0.5 ${config?.configured ? 'text-green-600' : 'text-yellow-600'}`}>
                            {config?.configured
                                ? 'Los pagos están habilitados para este tenant'
                                : 'Ingresa tus credenciales para habilitar los pagos'}
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-lg">
                <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
                    <p className="text-sm font-medium text-gray-700">Credenciales de Stripe</p>

                    <div>
                        <label className="text-sm font-medium block mb-1">Modo</label>
                        <div className="flex gap-2">
                            {['sandbox', 'production'].map(m => (
                                <button key={m} type="button"
                                    onClick={() => set('mode', m)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors
                          ${form.mode === m
                                            ? 'bg-indigo-500 text-white border-indigo-500'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                    {m === 'sandbox' ? '🧪 Sandbox' : '🚀 Producción'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">
                            Publishable Key
                            <span className="text-xs text-gray-400 font-normal ml-1">(pk_test_... o pk_live_...)</span>
                        </label>
                        <input
                            type="text"
                            value={form.publicKey}
                            onChange={e => set('publicKey', e.target.value)}
                            placeholder="pk_test_..."
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">
                            Secret Key
                            <span className="text-xs text-gray-400 font-normal ml-1">(sk_test_... o sk_live_...)</span>
                        </label>
                        <input
                            type="password"
                            value={form.secretKey}
                            onChange={e => set('secretKey', e.target.value)}
                            placeholder="sk_test_..."
                            required
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Se cifra con AES-256 antes de guardarse
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium block mb-1">
                            Webhook Secret
                            <span className="text-xs text-gray-400 font-normal ml-1">(opcional)</span>
                        </label>
                        <input
                            type="password"
                            value={form.webhookSecret}
                            onChange={e => set('webhookSecret', e.target.value)}
                            placeholder="whsec_..."
                            className={inputClass}
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    {saved && (
                        <p className="text-sm text-green-600">
                            ✓ Configuración guardada correctamente
                        </p>
                    )}

                    <button type="submit" disabled={configure.isPending}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors">
                        {configure.isPending ? 'Guardando...' : 'Guardar configuración'}
                    </button>
                </div>

                {/* Guía Stripe */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">¿Dónde obtengo las claves?</p>
                    <ol className="text-xs text-gray-500 flex flex-col gap-1 list-decimal list-inside">
                        <li>Ve a <span className="font-mono">dashboard.stripe.com</span></li>
                        <li>Inicia sesión o crea una cuenta</li>
                        <li>Ve a <strong>Developers → API Keys</strong></li>
                        <li>Copia la <strong>Publishable key</strong> y la <strong>Secret key</strong></li>
                        <li>Para sandbox usa las claves que empiezan con <span className="font-mono">pk_test_</span></li>
                    </ol>
                </div>
            </form>
        </div>
    )
}