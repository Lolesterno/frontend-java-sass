'use client'

import { useAdminUsers, useCreateAdmin } from "@/lib/hooks/useAdmin"
import { useAdminStore } from "@/store/useAdminStore";
import { AdminUser } from "@/types";
import { useState } from "react";

export default function AdminUsersPage() {
    const { data: admins = [], isLoading } = useAdminUsers();
    const createAdmin = useCreateAdmin();
    const { admin: currentAdmin } = useAdminStore();
    const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN'
    })
    const [error, setError] = useState('');

    async function handleCreate(e: React.SubmitEvent) {
        e.preventDefault();
        setError('')
        try {
            await createAdmin.mutateAsync(form);
            setShowForm(false);
            setForm({ name: '', email: '', password: '', role: 'ADMIN' })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear un admin')
        }
    }

    const inputClass = "w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 outline-none focus:border-indigo-500"

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-white">Administradores</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{admins.length} registrados</p>
                </div>
                {isSuperAdmin && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg border-none cursor-pointer transition-colors">
                        + Nuevo admin
                    </button>
                )}
            </div>

            {showForm && isSuperAdmin && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 max-w-md">
                    <p className="text-sm font-medium text-white mb-4">Nuevo administrador</p>
                    <form onSubmit={handleCreate} className="flex flex-col gap-3">
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Nombre completo" required className={inputClass} />
                        <input type="email" value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="Email" required className={inputClass} />
                        <input type="password" value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            placeholder="Contraseña" required className={inputClass} />
                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                            className={inputClass}>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <div className="flex gap-2">
                            <button type="submit" disabled={createAdmin.isPending}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg border-none cursor-pointer transition-colors">
                                {createAdmin.isPending ? 'Creando...' : 'Crear'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-4 text-sm text-gray-400 bg-transparent border border-gray-700 rounded-lg cursor-pointer">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {isLoading && <p className="text-sm text-gray-400 p-5">Cargando...</p>}
                {admins.length > 0 && (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-800">
                                <th className="text-left px-5 py-3 font-medium">Nombre</th>
                                <th className="text-left px-5 py-3 font-medium">Email</th>
                                <th className="text-left px-5 py-3 font-medium">Rol</th>
                                <th className="text-left px-5 py-3 font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(admins as AdminUser[]).map(a => (
                                <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                                    <td className="px-5 py-3 text-sm text-white">{a.name}</td>
                                    <td className="px-5 py-3 text-sm text-gray-400">{a.email}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full
                      ${a.role === 'SUPER_ADMIN'
                                                ? 'bg-yellow-900 text-yellow-400'
                                                : 'bg-indigo-900 text-indigo-400'}`}>
                                            {a.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full
                      ${a.active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                            {a.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}