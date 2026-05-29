'use client'

import { useAdminStore } from "@/store/useAdminStore";
import { useRouter } from "next/navigation"
import { useState } from "react";

export default function AdminLoginPage() {
    const router = useRouter();
    const { setAdmin } = useAdminStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.SubmitEvent) {
        e.preventDefault();
        setError('')
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) throw new Error('Credenciales incorrectas');

            const data = await res.json();

            setAdmin(
                {
                    id: data.adminId, name: data.name, email: data.email, role: data.role, active: true
                },
                data.accessToken,
                data.refreshToken
            )

            router.push('/admin/dashboard')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error en autenticacion')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl">⚡</span>
                    </div>
                    <h1 className="text-white text-xl font-semibold">Panel de Administración</h1>
                    <p className="text-gray-400 text-sm mt-1">Acceso restringido a administradores</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@platform.com"
                            required
                            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2.5 text-sm outline-none border border-gray-700 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2.5 text-sm outline-none border border-gray-700 focus:border-indigo-500"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900 bg-opacity-40 border border-red-700 rounded-lg px-3 py-2">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors">
                        {loading ? 'Verificando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Plataforma SaaS © 2024 — Acceso solo para administradores autorizados
                </p>
            </div>
        </div>
    )
}