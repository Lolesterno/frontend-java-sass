'use client'

import { apiRequest } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore"
import { Member } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function MembersPage() {
    const { user } = useAppStore();
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('MEMBER');

    const { data: members = [], isLoading } = useQuery({
        queryKey: ['members', user?.tenantId],
        queryFn: () => apiRequest<Member[]>(`/tenants/${user?.tenantId}/members`),
        enabled: !!user?.tenantId,
    });

    const addMutation = useMutation({
        mutationFn: () =>
            apiRequest(`/tenants/${user?.tenantId}/members`, {
                method: 'POST',
                body: JSON.stringify({ userId, role }),
            }),
        onSuccess: () => {
            setUserId('')
            queryClient.invalidateQueries({ queryKey: ['members'] })
        },
    });

    const removeMutation = useMutation({
        mutationFn: (memberId: string) =>
            apiRequest(`/tenants/${user?.tenantId}/members/${memberId}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
    })

    return (
        <div>
            <h1 className="text-xl font-medium mb-6">Miembros</h1>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <p className="text-sm font-medium mb-3">Agregar miembro</p>
                <div className="flex gap-2">
                    <input
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="UUID del usuario"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <button
                        onClick={() => addMutation.mutate()}
                        disabled={!userId || addMutation.isPending}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 rounded-lg border-none cursor-pointer transition-colors"
                    >
                        Agregar
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {isLoading && <p className="text-sm text-gray-400">Cargando...</p>}
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm font-medium mb-1">{member.userId}</p>
                            <span className={`text-xs rounded px-1.5 py-0.5 font-medium
                ${member.role === 'OWNER'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                            >
                                {member.role}
                            </span>
                        </div>
                        {member.role !== 'OWNER' && (
                            <button
                                onClick={() => removeMutation.mutate(member.userId)}
                                disabled={removeMutation.isPending}
                                className="text-xs text-red-500 border border-red-200 rounded-md px-2.5 py-1 bg-transparent cursor-pointer hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                                Remover
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}