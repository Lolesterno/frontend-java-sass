'use client'

import { useEffect, useRef } from "react";

interface Props {
    stream: MediaStream | null;
    name: string;
    audioMuted?: boolean;
    videoMuted?: boolean;
    isLocal?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function VideoTile({ stream, name, audioMuted, videoMuted, isLocal, size = 'md' }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="relative bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center w-full h-full">
            {stream && !videoMuted ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    className="w-full h-full object-cover"
                    style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
                />
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">{initials}</span>
                    </div>
                    {videoMuted && (
                        <p className="text-gray-400 text-xs">Cámara apagada</p>
                    )}
                </div>
            )}

            {/* Nombre */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <span className="bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded-md">
                    {isLocal ? `${name} (Tú)` : name}
                </span>
                {audioMuted && (
                    <span className="bg-red-500 bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded-md">
                        🎤
                    </span>
                )}
            </div>
        </div>

    )
}