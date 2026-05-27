import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { ChatMessage, MeetRoom } from "@/types";

export function useMeetRooms() {
    return useQuery({
        queryKey: ['meet-rooms'],
        queryFn: () => apiRequest<MeetRoom[]>('/meet/rooms')
    })
}

export function useCreateMeetRoom() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { name: string, hostname: string }) => 
            apiRequest<MeetRoom>('/meet/rooms', {
                method: 'POST',
                body: JSON.stringify(data)
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['meet-rooms'] }),
    })
}

export function useChatHistory(roomId: string) {
    return useQuery({
        queryKey: ['meet-chat', roomId],
        queryFn: () => apiRequest<ChatMessage[]>(`/meet/rooms/${roomId}/chat`),
        enabled: !!roomId,
    })
}

export function useValidateRoom(roomId: string) {
    return useQuery({
        queryKey: ['meet-validate', roomId],
        queryFn: () => apiRequest<{ exists: boolean }>(`/meet/rooms/${roomId}/validate`),
        enabled: !!roomId
    })
}