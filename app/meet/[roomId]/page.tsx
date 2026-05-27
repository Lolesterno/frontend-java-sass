'use client'

import { useWebRTC } from "@/lib/meet/useWebRTC";
import { useAppStore } from "@/store/useAppStore";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useCallback, useState } from "react"
import { VideoGrid } from "../../../components/meet/VideoGrid";
import { ChatPanel } from "../../../components/meet/ChatPannel";
import { WaitingRoomPanel } from "../../../components/meet/WaitingRoomPanel";
import { ControlBar } from "../../../components/meet/ControlBar";

function WaitingScreen({ name }: { name: string }) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">{name[0]?.toUpperCase()}</span>
                </div>
                <h2 className="text-white text-xl font-medium mb-2">Sala de espera</h2>
                <p className="text-gray-400 text-sm mb-4">
                    Esperando a que el anfitrión te admita...
                </p>
                <div className="flex justify-center gap-1">
                    {[0, 1, 2].map(i => (
                        <div key={i}
                            className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                </div>
            </div>
        </div>
    )
}

function RejectedScreen({ onBack }: { onBack: () => void }) {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">✕</span>
                </div>
                <h2 className="text-white text-xl font-medium mb-2">Acceso denegado</h2>
                <p className="text-gray-400 text-sm mb-6">
                    El anfitrión no admitió tu solicitud de ingreso
                </p>
                <button onClick={onBack}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg border-none cursor-pointer transition-colors">
                    Volver al inicio
                </button>
            </div>
        </div>
    )
}

export default function MeetRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAppStore();

    const isHost = searchParams.get('host') === 'true';
    const nameParam = searchParams.get('name');
    const tenantId = user?.tenantId ?? searchParams.get('tenantId') ?? '';
    const participantName = nameParam ?? user?.email?.split('@')[0] ?? 'Invitado';

    const [chatOpen, setChatOpen] = useState(false);
    const [rejected, setRejected] = useState(false);

    const handleRejected = useCallback(() => setRejected(true), []);
    const handleRoomClosed = useCallback(() => router.push('/dashboard/meet'), [router]);

    const {
        localStream, participants, chatMessages, waitingList,
        isWaiting, audioMuted, videoMuted, error,
        toggleAudio, toggleVideo, sendMessage,
        admitParticipant, rejectParticipant, leave,
    } = useWebRTC({
        roomId,
        participantName,
        tenantId,
        isHost,
        onRejected: handleRejected,
        onRoomClosed: handleRoomClosed
    });

    function handleLeave() {
        leave();
        router.push('/dashboard/meet')
    }

    if (rejected) return <RejectedScreen onBack={() => router.push('/dashboard')} />
    if (isWaiting) return <WaitingScreen name={participantName} />
    if (error) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button onClick={() => router.push('/dashboard')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg border-none cursor-pointer">
                    Volver
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-white text-sm font-medium">
                        {participants.size + 1} participante{participants.size !== 0 ? 's' : ''}
                    </span>
                </div>
                <p className="text-gray-400 text-xs font-mono">{roomId}</p>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(
                            `${window.location.origin}/meet/${roomId}?tenantId=${tenantId}`
                        )
                    }}
                    className="text-indigo-400 text-xs hover:text-indigo-300 bg-transparent border-none cursor-pointer">
                    Copiar link de invitación
                </button>
            </div>

            {/* Contenido principal */}
            <div className="flex flex-1 overflow-hidden">

                {/* Videos */}
                <div className="flex-1 overflow-hidden">
                    <VideoGrid
                        localStream={localStream}
                        localName={participantName}
                        localAudioMuted={audioMuted}
                        localVideoMuted={videoMuted}
                        participants={participants}
                    />
                </div>

                {/* Panel de chat */}
                {chatOpen && (
                    <div className="w-80 shrink-0">
                        <ChatPanel messages={chatMessages} onSend={sendMessage} />
                    </div>
                )}
            </div>

            {/* Sala de espera — solo visible para el host */}
            {isHost && (
                <WaitingRoomPanel
                    waitingList={waitingList}
                    onAdmit={admitParticipant}
                    onReject={rejectParticipant}
                />
            )}

            {/* Barra de controles */}
            <ControlBar
                audioMuted={audioMuted}
                videoMuted={videoMuted}
                chatOpen={chatOpen}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onToggleChat={() => setChatOpen(o => !o)}
                onLeave={handleLeave}
            />
        </div>
    )

}