'use client'

import { Participant } from "@/types";
import { VideoTile } from "./VideoTile";

interface Props {
    localStream: MediaStream | null;
    localName: string;
    localAudioMuted: boolean;
    localVideoMuted: boolean;
    participants: Map<string, Participant>
}

export function VideoGrid({ localStream, localName, localAudioMuted, localVideoMuted, participants }: Props) {
    const participantList = Array.from(participants.values());
    const total = participantList.length;

    const gridClass = total === 1
        ? 'grid-cols-1'
        : total === 2
            ? 'grid-cols-2'
            : total <= 4
                ? 'grid-cols-2'
                : total <= 6
                    ? 'grid-cols-3'
                    : 'grid-cols-4';

    return (
        <div className={`grid ${gridClass} gap-2 w-full h-full p-2`}
            style={{ gridAutoRows: total === 1 ? '100%' : total === 2 ? '100%' : '50%' }}>

            {/* Video local */}
            <div className={total === 1 ? 'col-span-1 row-span-1' : ''}>
                <VideoTile
                    stream={localStream}
                    name={localName}
                    audioMuted={localAudioMuted}
                    videoMuted={localVideoMuted}
                    isLocal
                />
            </div>

            {/* Videos remotos */}
            {participantList.map(p => (
                <div key={p.sessionId}>
                    <VideoTile
                        stream={p.stream}
                        name={p.name}
                        audioMuted={p.audioMuted}
                        videoMuted={p.videoMuted}
                    />
                </div>
            ))}
        </div>
    )
}