'use client'

import { useRouter, useSearchParams } from "next/navigation";
import React, { use, useState } from "react"

export default function JoinMeetPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const tenantId = searchParams.get('tenantId') ?? '';
    const [name, setName] = useState('');

    function handleJoin(e: React.SubmitEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        router.push(`/meet/${roomId}?name=${encodeURIComponent(name.trim())}&tenantId=${tenantId}`)
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl">📹</span>
                    </div>
                    <h1 className="text-white text-xl font-medium">Unirse a la reunión</h1>
                    <p className="text-gray-400 text-sm mt-1">Ingresa tu nombre para continuar</p>
                </div>

                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-1">Tu nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Juan Pérez"
                            required
                            autoFocus
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2.5 text-sm outline-none border border-gray-600 focus:border-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors">
                        Entrar a la sala
                    </button>
                </form>
            </div>
        </div>
    )
}