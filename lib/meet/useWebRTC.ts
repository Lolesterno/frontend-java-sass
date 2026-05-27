import { ChatMsg, MeetMessage, Participant, WaitingParticipant } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

const MEET_WS_URL = process.env.NEXT_PUBLIC_MEET_WS_URL ?? 'ws://localhost:8008';

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
}

interface UseWebRTCOptions {
    roomId: string;
    participantName: string;
    tenantId: string;
    isHost: boolean;
    onRejected?: () => void
    onRoomClosed?: () => void;
}

export function useWebRTC({ roomId, participantName, tenantId, isHost, onRejected, onRoomClosed }: UseWebRTCOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const mySessionIdRef = useRef<string>('');

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
    const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
    const [waitingList, setWaitingList] = useState<WaitingParticipant[]>([]);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Media Local initializer

    const initLocalStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
                audio: { echoCancellation: true, noiseSuppression: true },
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                localStreamRef.current = stream;
                setLocalStream(stream);
                return stream
            } catch {
                setError('No se pudo acceder a la camara o microfono')
                console.error(err)
                return null
            }
        }
    }, []);


    // Websocket Message send
    const send = (msg: MeetMessage) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(msg));
        }
    }

    // Peer connection with other participant

    const createPeerConnection = useCallback((targetSessionId: string) => {
        const pc = new RTCPeerConnection(STUN_SERVERS);

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!)
            })
        }

        // Track remote incoming

        pc.ontrack = (event) => {
            const [remoteStream] = event.streams
            setParticipants(prev => {
                const updated = new Map(prev);
                const existing = updated.get(targetSessionId);
                if (existing) {
                    updated.set(targetSessionId, { ...existing, stream: remoteStream })
                }
                return updated;
            })
        }

        // Generate ICE candidate

        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                send({
                    type: 'ICE_CANDIDATE',
                    roomId,
                    targetId: targetSessionId,
                    payload: event.candidate
                })
            }
        }

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed') {
                pc.restartIce()
            }
        }

        peerConectionsRef.current.set(targetSessionId, pc)
        return pc

    }, [roomId]);

    // Initialize WebRTC offer to participant

    const initiateOffer = useCallback(async (targetSessionId: string) => {
        const pc = createPeerConnection(targetSessionId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        send({
            type: 'OFFER',
            roomId,
            targetId: targetSessionId,
            payload: offer
        })
    }, [createPeerConnection, roomId]);

    const handleMessage = useCallback(async (msg: MeetMessage) => {
        switch (msg.type) {
            case 'ROOM_STATE': {
                setIsConnected(true)
                setIsWaiting(false)
                const participants = msg.payload?.participants ?? [];
                const mySessionId = msg.payload?.yourSessionId ?? mySessionIdRef.current;
                if (mySessionId) mySessionIdRef.current = mySessionId;

                // Register existing participants

                participants.forEach((p: { sessionId: string, name: string }) => {
                    if (p.sessionId !== mySessionIdRef.current) {
                        setParticipants(prev => {
                            const updated = new Map(prev);
                            if (!updated.has(p.sessionId)) {
                                updated.set(p.sessionId, {
                                    sessionId: p.sessionId,
                                    name: p.name,
                                    stream: null,
                                    audioMuted: false,
                                    videoMuted: false
                                })
                            }
                            return updated
                        })
                    }
                })
                break
            }

            case 'WAITING':
                setIsWaiting(true);
                break;

            case 'REJECT':
                onRejected?.();
                break;

            case 'ADMIT': {
                setIsWaiting(false);
                setIsConnected(true);
                const mySessionId = msg.payload?.yourSessionId;
                if (mySessionId) mySessionIdRef.current = mySessionId

                const existingParticipants = msg.payload?.participants ?? [];
                existingParticipants.forEach((p: { sessionId: string, name: string }) => {
                    if (p.sessionId !== mySessionIdRef.current) {
                        setParticipants(prev => {
                            const updated = new Map(prev)
                            updated.set(p.sessionId, {
                                sessionId: p.sessionId,
                                name: p.name,
                                stream: null,
                                audioMuted: false,
                                videoMuted: false
                            })
                            return updated
                        })
                        // Initialize connection p2p with other participants
                        initiateOffer(p.sessionId)
                    }
                })
                break;
            }

            case 'PARTICIPANT_JOINED': {
                if (msg.senderId === mySessionIdRef.current) break
                setParticipants(prev => {
                    const updated = new Map(prev);
                    updated.set(msg.senderId!, {
                        sessionId: msg.senderId!,
                        name: msg.senderName ?? 'Participante',
                        stream: null,
                        audioMuted: false,
                        videoMuted: false
                    })
                    return updated;
                })
                break;
            }

            case 'PARTICIPANT_LEFT': {
                peerConectionsRef.current.get(msg.senderId!)?.close();
                peerConectionsRef.current.delete(msg.senderId!);
                setParticipants(prev => {
                    const updated = new Map(prev);
                    updated.delete(msg.senderId!);
                    return updated;
                })
                break;
            }

            case 'KNOCK': {
                setWaitingList(prev => {
                    if (prev.find(p => p.sessionId === msg.senderId)) return prev
                    return [...prev, { sessionId: msg.senderId!, name: msg.senderName ?? 'Invitado' }];
                })
                break;
            }

            case 'OFFER': {
                const pc = createPeerConnection(msg.senderId!);
                await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                send({
                    type: 'ANSWER',
                    roomId,
                    targetId: msg.senderId,
                    payload: answer
                })
                break
            }

            case 'ANSWER': {
                const pc = peerConectionsRef.current.get(msg.senderId!);
                if (pc) {
                    await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
                }
                break;
            }

            case 'ICE_CANDIDATE': {
                const pc = peerConectionsRef.current.get(msg.senderId!);
                if (pc && msg.payload) {
                    await pc.addIceCandidate(new RTCIceCandidate(msg.payload))
                }
                break;
            }

            case 'CHAT_MESSAGE': {
                setChatMessages(prev => [...prev, {
                    senderId: msg.senderId ?? '',
                    senderName: msg.senderName ?? 'Anonimo',
                    message: msg.message ?? '',
                    timestamp: msg.timestamp ?? Date.now(),
                }]);
                break;
            }

            case 'MUTE_AUDIO':
            case 'UNMUTE_AUDIO': {
                setParticipants(prev => {
                    const updated = new Map(prev);
                    const p = updated.get(msg.senderId!);
                    if (p) updated.set(msg.senderId!, { ...p, audioMuted: msg.type === 'MUTE_AUDIO' });
                    return updated;
                })
                break;
            }

            case 'MUTE_VIDEO':
            case 'UNMUTE_VIDEO': {
                setParticipants(prev => {
                    const updated = new Map(prev);
                    const p = updated.get(msg.senderId!);
                    if (p) updated.set(msg.senderId!, { ...p, videoMuted: msg.type === 'MUTE_VIDEO' });
                    return updated;
                })
                break;
            }

            case 'ROOM_CLOSED':
                onRoomClosed?.();
                break;

            case 'ERROR':
                setError(msg.message ?? 'Error desconocido');
                break;
        }
    }, [createPeerConnection, initiateOffer, onRejected, onRoomClosed, roomId]);

    // Connect WebSocket

    const connect = useCallback(async () => {
        const stream = await initLocalStream();
        if (!stream && !isHost) return;

        const ws = new WebSocket(`${MEET_WS_URL}/ws/meet/${roomId}`);
        wsRef.current = ws;

        ws.onopen = () => {
            send({
                type: 'JOIN_ROOM',
                roomId,
                senderName: participantName,
                tenantId,
                payload: { isHost }
            })
        }

        ws.onmessage = (event) => {
            try {
                const msg: MeetMessage = JSON.parse(event.data)
                handleMessage(msg)
            } catch (error) {
                console.error('Failed to parse message: ', error)
            }
        }

        ws.onclose = () => {
            setIsConnected(false);
        }

        ws.onerror = () => {
            setError('Error en la conexion del servidor')
        }
    }, [roomId, participantName, tenantId, isHost, initLocalStream, handleMessage])

    // A/V controllers

    const toggleAudio = useCallback(() => {
        if (!localStreamRef.current) return;
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (!audioTrack) return;

        audioTrack.enabled = !audioTrack.enabled
        const muted = !audioTrack.enabled
        setAudioMuted(muted);
        send({ type: muted ? 'MUTE_AUDIO' : 'UNMUTE_AUDIO', roomId })
    }, [roomId])

    const toggleVideo = useCallback(() => {
        if (!localStreamRef.current) return;
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (!videoTrack) return;
        videoTrack.enabled = !videoTrack.enabled;
        const muted = !videoTrack.enabled;
        setVideoMuted(muted);
        send({ type: muted ? 'MUTE_VIDEO' : 'UNMUTE_VIDEO', roomId })
    }, [roomId]);

    // Chat

    const sendMessage = useCallback((text: string) => {
        if (!text.trim()) return;
        send({ type: 'CHAT_MESSAGE', roomId, message: text });
        setChatMessages(prev => [...prev, {
            senderId: mySessionIdRef.current,
            senderName: participantName,
            message: text,
            timestamp: Date.now(),
            isLocal: true
        }])
    }, [roomId, participantName])

    // Room Waiting

    const admitParticipant = useCallback((sessionId: string) => {
        send({ type: 'ADMIT', roomId, targetId: sessionId });
        setWaitingList(prev => prev.filter(p => p.sessionId !== sessionId));
    }, [roomId]);

    const rejectParticipant = useCallback((sessionId: string) => {
        send({ type: 'REJECT', roomId, targetId: sessionId })
        setWaitingList(prev => prev.filter(p => p.sessionId !== sessionId));
    }, [roomId]);

    const leave = useCallback(() => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        peerConectionsRef.current.forEach(pc => pc.close());
        peerConectionsRef.current.clear();
        wsRef.current?.close()
    }, [])

    // Connect to mount

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            if (cancelled) return
            await connect()
        }

        init();

        return () => {
            cancelled = true;
            leave();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, []);

    return {
        localStream,
        participants,
        chatMessages,
        waitingList,
        isWaiting,
        isConnected,
        audioMuted,
        videoMuted,
        error,
        toggleAudio,
        toggleVideo,
        sendMessage,
        admitParticipant,
        rejectParticipant,
        leave,
    }

}