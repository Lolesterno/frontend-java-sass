'use client'

import { CardPreview } from "@/components/payments/CardPreview";
import { useCharge, useTokenize } from "@/lib/hooks/usePayments";
import { CardToken } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1').trim();
}

function detectedBrand(number: string) {
    const n = number.replace(/\s/g, '')
    if (n.startsWith('4')) return 'VISA'
    if (n.startsWith('5') || n.startsWith('2')) return 'MASTERCARD'
    if (n.startsWith('34') || n.startsWith('37')) return 'AMEX'
    return ''
}

export default function NewPaymentPage() {
    const router = useRouter();
    const tokenize = useTokenize();
    const charge = useCharge();

    const [step, setStep] = useState<1 | 2>(1);
    const [cardToken, setCardToken] = useState<CardToken | null>(null);
    const [error, setError] = useState('');

    const [cardNumber, setCardNumber] = useState('')
    const [expiryMonth, setExpiryMonth] = useState('')
    const [expiryYear, setExpiryYear] = useState('')
    const [cvv, setCvv] = useState('')
    const [cardHolder, setCardHolder] = useState('')

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const brand = detectedBrand(cardNumber);

    async function handleTokenize(e: React.SubmitEvent) {
        e.preventDefault();
        setError('')
        try {
            const token = await tokenize.mutateAsync({
                cardNumber: cardNumber.replace(/\s/g, ''),
                expiryMonth,
                expiryYear,
                cvv,
                cardHolder,
            })
            setCardToken(token)
            setStep(2)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al tokenizar tarjeta')
        }
    }

    async function handleCharge(e: React.SubmitEvent) {
        e.preventDefault()
        if (!cardToken) return
        setError('')
        try {
            const tx = await charge.mutateAsync({
                cardToken: cardToken.token,
                amount: parseFloat(amount),
                currency: 'COP',
                description,
                idempotencyKey: `${cardToken.token}-${Date.now()}`,
            })
            router.push(`/dashboard/payments/${tx.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar pago')
        }
    }

    return (
        <div>
      <h1 className="text-xl font-medium mb-6">Nuevo cobro</h1>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors
              ${step === s ? 'bg-indigo-500 text-white' : step > s ? 'bg-indigo-100 text-indigo-500' : 'bg-gray-100 text-gray-400'}`}>
              {step > s ? '✓' : s}
            </div>
            <span className={`text-xs font-medium ${step >= s ? 'text-gray-700' : 'text-gray-400'}`}>
              {s === 1 ? 'Datos de tarjeta' : 'Monto y descripción'}
            </span>
            {s < 2 && <div className={`w-8 h-px ${step > s ? 'bg-indigo-300' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">

        {/* Vista previa de tarjeta */}
        <div className="flex flex-col gap-4">
          <CardPreview
            cardNumber={cardNumber}
            cardHolder={cardHolder}
            expiryMonth={expiryMonth}
            expiryYear={expiryYear}
            brand={brand}
          />

          {/* Tarjetas de prueba */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Tarjetas de prueba</p>
            <div className="flex flex-col gap-1">
              {[
                ['4111 1111 1111 1111', 'Aprobada'],
                ['4000 0000 0000 0002', 'Fondos insuficientes'],
                ['4000 0000 0000 0069', 'Tarjeta expirada'],
                ['4000 0000 0000 9995', 'Antifraude'],
              ].map(([num, label]) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCardNumber(num)}
                  className="flex justify-between items-center text-left hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                >
                  <span className="text-xs font-mono text-gray-600">{num}</span>
                  <span className="text-xs text-gray-400">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {step === 1 && (
            <form onSubmit={handleTokenize} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Número de tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Mes</label>
                  <input
                    type="text"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="MM"
                    maxLength={2}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Año</label>
                  <input
                    type="text"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="AAAA"
                    maxLength={4}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="···"
                  maxLength={4}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Nombre del titular</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="NOMBRE APELLIDO"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={tokenize.isPending}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors"
              >
                {tokenize.isPending ? 'Tokenizando...' : 'Continuar →'}
              </button>
            </form>
          )}

          {step === 2 && cardToken && (
            <form onSubmit={handleCharge} className="flex flex-col gap-4">
              <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600">{cardToken.brand[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{cardToken.brand} ···· {cardToken.lastFour}</p>
                  <p className="text-xs text-gray-400">{cardToken.cardHolder} · {cardToken.expiryMonth}/{cardToken.expiryYear.slice(-2)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="ml-auto text-xs text-indigo-500 bg-transparent border-none cursor-pointer hover:underline"
                >
                  Cambiar
                </button>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Monto (COP)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  min="100"
                  step="100"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Suscripción plan Pro"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={charge.isPending}
                className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors"
              >
                {charge.isPending ? 'Procesando...' : `Cobrar ${amount ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(parseFloat(amount)) : ''}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
    )
}