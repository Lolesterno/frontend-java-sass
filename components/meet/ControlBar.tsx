'use client'

import { ReactNode } from 'react'
import { Camera, CameraOff, DoorClosed, MessageSquare, Mic, MicOff } from "lucide-react";

interface Props {
    audioMuted: boolean;
    videoMuted: boolean;
    chatOpen: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onToggleChat: () => void;
    onLeave: () => void;
}

interface ControlButtonProps {
    onClick: () => void;
    active?: boolean;
    danger?: boolean;
    label: string;
    icon: ReactNode;
}

function ControlButton({ onClick, active, danger, label, icon }: ControlButtonProps) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors border-none cursor-pointer
        ${danger
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : active
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}>
            <span className="text-xl">{icon}</span>
            <span className="text-xs opacity-80">{label}</span>
        </button>
    )
}

export function ControlBar({ audioMuted, videoMuted, chatOpen, onToggleAudio, onToggleVideo, onToggleChat, onLeave }: Props) {
    return (
        <div className="flex items-center justify-center gap-3 py-4 px-6 bg-gray-800 border-t border-gray-700">
            <ControlButton
                onClick={onToggleAudio}
                active={audioMuted}
                label={audioMuted ? 'Activar mic' : 'Silenciar'}
                icon={audioMuted ? <Mic /> : <MicOff />}
            />
            <ControlButton
                onClick={onToggleVideo}
                active={videoMuted}
                label={videoMuted ? 'Activar cam' : 'Apagar cam'}
                icon={videoMuted ? <Camera /> : <CameraOff />}
            />
            <ControlButton
                onClick={onToggleChat}
                active={chatOpen}
                label="Chat"
                icon={<MessageSquare />}
            />
            <ControlButton
                onClick={onLeave}
                danger
                label="Salir"
                icon={<DoorClosed />}
            />
        </div>
    )
}