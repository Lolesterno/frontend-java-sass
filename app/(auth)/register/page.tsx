'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { apiRequest } from '@/lib/api'
import { parseToken } from '@/lib/auth'
import type { AuthTokens, Branding } from '@/types'

type Step1Data = { email: string; password: string; };
type Step2Data = {
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors
            ${current === step
              ? 'bg-indigo-500 text-white'
              : current > step
                ? 'bg-indigo-100 text-indigo-500'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {current > step ? '✓' : step}
          </div>
          <span className={`text-xs font-medium ${current >= step ? 'text-gray-700' : 'text-gray-400'}`}>
            {step === 1 ? 'Tu cuenta' : 'Tu empresa'}
          </span>
          {step < 2 && <div className={`w-8 h-px ${current > step ? 'bg-indigo-300' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

function Step1({ onNext }: { onNext: (data: Step1Data) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAppStore();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest<AuthTokens>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const user = parseToken(data.accessToken);
      if (!user) throw new Error('Token invalido');

      setAuth(user, data.accessToken, data.refreshToken);
      onNext({ email, password });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@empresa.com"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors border-none cursor-pointer"
      >
        {loading ? 'Creando cuenta...' : 'Continuar →'}
      </button>
    </form>
  )
}

function Step2({ onFinish }: { onFinish: () => void }) {
  const { user } = useAppStore();
  const [form, setForm] = useState<Step2Data>({
    displayName: '',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    logoUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiRequest<Branding>(`/tenants/${user?.tenantId}/branding`, {
        method: 'PUT',
        body: JSON.stringify(form),
      })
      onFinish()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    onFinish();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium block mb-1">Nombre de la empresa</label>
        <input
          type="text"
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          required
          placeholder="Acme Inc."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">URL del logo</label>
        <input
          type="url"
          value={form.logoUrl}
          onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
          placeholder="https://ejemplo.com/logo.png (opcional)"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Color primario</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={form.primaryColor}
            onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
            className="w-10 h-9 p-0.5 rounded-md border border-gray-200 cursor-pointer"
          />
          <input
            type="text"
            value={form.primaryColor}
            onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Color secundario</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={form.secondaryColor}
            onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
            className="w-10 h-9 p-0.5 rounded-md border border-gray-200 cursor-pointer"
          />
          <input
            type="text"
            value={form.secondaryColor}
            onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-gray-200 p-3 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
          style={{ background: form.primaryColor }}
        >
          {form.displayName.charAt(0).toUpperCase() || 'A'}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: form.primaryColor }}>
            {form.displayName || 'Tu empresa'}
          </p>
          <p className="text-xs text-gray-400">Vista previa del branding</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full text-white font-medium py-2.5 rounded-lg text-sm transition-colors border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: form.primaryColor }}
      >
        {loading ? 'Guardando...' : 'Ir al dashboard →'}
      </button>

      <button
        type="button"
        onClick={handleSkip}
        className="w-full text-gray-400 text-sm bg-transparent border-none cursor-pointer hover:text-gray-600 transition-colors"
      >
        Omitir por ahora
      </button>
    </form>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1);

  const TITLES = {
    1: { title: 'Crear cuenta', sub: 'Comienza gratis, sin tarjeta de crédito' },
    2: { title: 'Personaliza tu empresa', sub: 'Configura la apariencia de tu dashboard' },
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8">
        <StepIndicator current={step} />

        <h1 className="text-xl font-medium mb-1">{TITLES[step].title}</h1>
        <p className="text-sm text-gray-500 mb-6">{TITLES[step].sub}</p>

        {step === 1 && (
          <Step1 onNext={() => setStep(2)} />
        )}

        {step === 2 && (
          <Step2 onFinish={() => router.push('/dashboard')} />
        )}

        {step === 1 && (
          <p className="text-center mt-4 text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-indigo-500 hover:text-indigo-600">
              Inicia sesión
            </a>
          </p>
        )}
      </div>
    </div>
  )
}