'use client'

import { apiRequest } from "@/lib/api";
import { parseToken } from "@/lib/auth";
import { useAppStore } from "@/store/useAppStore";
import { AuthTokens } from "@/types";
import { useRouter } from "next/navigation"
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAppStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.SubmitEvent) {

        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiRequest<AuthTokens>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            })

            const user = parseToken(data.accessToken);
            if (!user) throw new Error('Token inválido');

            setAuth(user, data.accessToken, data.refreshToken);
            router.push('/dashboard');

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error al iniciar Sesion')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8">

                <h1 className="text-xl font-medium mb-1">Iniciar sesión</h1>
                <p className="text-sm text-gray-500 mb-6">Ingresa a tu dashboard</p>

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
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm text-gray-500">
                    ¿No tienes cuenta?{' '}
                    <a href="/register" className="text-indigo-500 hover:text-indigo-600">
                        Regístrate
                    </a>
                </p>
            </div>
        </div>
    )
}