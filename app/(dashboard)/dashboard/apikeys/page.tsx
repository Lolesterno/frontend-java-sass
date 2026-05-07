'use client'

import { apiRequest } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore"
import { ApiKey } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function ApiKeysPage() {
    const { environment } = useAppStore();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [newKey, setNewKey] = useState<string | null>(null);

    const { data: keys = [], isLoading } = useQuery({
        queryKey: ['apiKeys'],
        queryFn: () => apiRequest<ApiKey[]>('/auth/apikeys/list'),
    })

    const filtered = keys.filter((k) => k.environment === environment);

    const createMutation = useMutation({
        mutationFn: () =>
            apiRequest<ApiKey>(
                `/auth/apikeys/create?name=${encodeURIComponent(name)}&environment=${environment}`,
                { method: 'POST' }
            ),
        onSuccess: (data) => {
            setNewKey(data.key);
            setName('');
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
        },
    });

    const revokeMutation = useMutation({
        mutationFn: (id: string) =>
            apiRequest(`/auth/apikeys/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apikeys'] })
    })

    return (
        <div>
            <h1 className="text-xl font-medium mb-6">API Keys</h1>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <p className="text-sm font-medium mb-3">Nueva API Key</p>
                <div className="flex gap-2">
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre de la key"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={!name || createMutation.isPending}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 rounded-lg transition-colors border-none cursor-pointer"
                    >
                        Crear
                    </button>
                </div>

                {newKey && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-700 mb-1">
                            Guarda esta key — no se mostrará de nuevo
                        </p>
                        <code className="text-xs break-all text-gray-700">{newKey}</code>
                        <button
                            onClick={() => { navigator.clipboard.writeText(newKey); setNewKey(null) }}
                            className="block mt-2 text-xs text-green-700 bg-transparent border-none cursor-pointer p-0 hover:underline"
                        >
                            Copiar y cerrar
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {isLoading && <p className="text-sm text-gray-400">Cargando...</p>}
                {!isLoading && filtered.length === 0 && (
                    <p className="text-sm text-gray-400">
                        No hay API Keys en el ambiente {environment}.
                    </p>
                )}
                {filtered.map((key) => (
                    <div
                        key={key.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-medium mb-0.5">{key.name}</p>
                            <p className="text-xs text-gray-400">
                                Creada {new Date(key.createdAt).toLocaleDateString('es')}
                            </p>
                        </div>
                        <button
                            onClick={() => revokeMutation.mutate(key.id)}
                            disabled={revokeMutation.isPending}
                            className="text-xs text-red-500 border border-red-200 rounded-md px-2.5 py-1 bg-transparent cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                            Revocar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}