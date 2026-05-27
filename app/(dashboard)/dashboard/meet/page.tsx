'use client'

import { useCreateMeetRoom, useMeetRooms } from "@/lib/hooks/useMeet";
import { useAppStore } from "@/store/useAppStore";
import { MeetRoom } from "@/types";
import { useRouter } from "next/navigation"
import React, { useState } from "react";

export default function MeetDashboardPage() {
    const router = useRouter();
    const { user } = useAppStore();
    const { data: rooms = [], isLoading } = useMeetRooms();
    const createRoom = useCreateMeetRoom();

    const [showForm, setShowForm] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [error, setError] = useState('');

    async function handleCreate(e: React.SubmitEvent) {
        e.preventDefault();
        setError('')
        try {
            const room = await createRoom.mutateAsync({
                name: roomName,
                hostname: user?.email?.split('@')[0] ?? 'Host',
            })
            router.push(`/meet/${room.id}?host=true`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear la Sala');
        }
    }

    function copyInviteLink(roomId: string) {
        const link = `${window.location.origin}/meet/${roomId}/join?tenantId=${user?.tenantId}`;
        navigator.clipboard.writeText(link)
    }

    const activeRooms = rooms.filter(r => r.status === 'ACTIVE')
    const closedRooms = rooms.filter(r => r.status === 'CLOSE')

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-medium">Reuniones</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors border-none cursor-pointer">
                    + Nueva reunión
                </button>
            </div>

            {/* Formulario nueva sala */}
            {showForm && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 max-w-md">
                    <p className="text-sm font-medium mb-3">Nueva reunión</p>
                    <form onSubmit={handleCreate} className="flex flex-col gap-3">
                        <input
                            type="text"
                            value={roomName}
                            onChange={e => setRoomName(e.target.value)}
                            placeholder="Nombre de la reunión"
                            required
                            autoFocus
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex gap-2">
                            <button type="submit"
                                disabled={createRoom.isPending}
                                className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg border-none cursor-pointer transition-colors">
                                {createRoom.isPending ? 'Creando...' : 'Crear e iniciar'}
                            </button>
                            <button type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 text-sm text-gray-500 hover:text-gray-700 bg-transparent border border-gray-200 rounded-lg cursor-pointer">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Salas activas */}
            {activeRooms.length > 0 && (
                <div className="mb-6">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                        En curso
                    </p>
                    <div className="flex flex-col gap-2">
                        {activeRooms.map((room: MeetRoom) => (
                            <div key={room.id}
                                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <div>
                                        <p className="text-sm font-medium">{room.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {room.participantCount} participante{room.participantCount !== 1 ? 's' : ''} ·
                                            Iniciada {new Date(room.startedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyInviteLink(room.id)}
                                        className="text-xs text-gray-500 hover:text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer">
                                        Copiar link
                                    </button>
                                    <button
                                        onClick={() => router.push(`/meet/${room.id}?host=true`)}
                                        className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-3 py-1.5 border-none cursor-pointer transition-colors">
                                        Entrar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Historial */}
            <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                    Historial
                </p>

                {isLoading && <p className="text-sm text-gray-400">Cargando...</p>}

                {!isLoading && rooms.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                        <p className="text-gray-400 text-sm mb-2">Sin reuniones aún</p>
                        <button onClick={() => setShowForm(true)}
                            className="text-indigo-500 text-sm hover:underline bg-transparent border-none cursor-pointer">
                            Crear primera reunión →
                        </button>
                    </div>
                )}

                {closedRooms.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-gray-400 border-b border-gray-100">
                                    <th className="text-left px-5 py-3 font-medium">Reunión</th>
                                    <th className="text-left px-5 py-3 font-medium">Participantes</th>
                                    <th className="text-left px-5 py-3 font-medium">Duración</th>
                                    <th className="text-left px-5 py-3 font-medium">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {closedRooms.map((room: MeetRoom) => {
                                    const duration = room.endedAt
                                        ? Math.round((new Date(room.endedAt).getTime() - new Date(room.startedAt).getTime()) / 60000)
                                        : null
                                    return (
                                        <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="px-5 py-3 text-sm font-medium">{room.name}</td>
                                            <td className="px-5 py-3 text-sm text-gray-500">{room.participantCount}</td>
                                            <td className="px-5 py-3 text-sm text-gray-500">
                                                {duration != null ? `${duration} min` : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-gray-400">
                                                {new Date(room.startedAt).toLocaleString('es-CO')}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}