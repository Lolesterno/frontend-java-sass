import { WaitingParticipant } from "@/types";

interface Props {
    waitingList: WaitingParticipant[];
    onAdmit: (sessionId: string) => void;
    onReject: (sessionId: string) => void;
}

export function WaitingRoomPanel({ waitingList, onAdmit, onReject }: Props) {
    if (waitingList.length === 0) return null;

    return (
        <div className="absolute top-4 right-4 bg-gray-800 border border-gray-600 rounded-xl p-4 w-72 z-50 shadow-xl">
            <p className="text-white text-sm font-medium mb-3">
                Sala de espera ({waitingList.length})
            </p>
            <div className="flex flex-col gap-2">
                {waitingList.map(p => (
                    <div key={p.sessionId}
                        className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    {p.name[0].toUpperCase()}
                                </span>
                            </div>
                            <span className="text-white text-sm">{p.name}</span>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => onAdmit(p.sessionId)}
                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded-lg border-none cursor-pointer transition-colors">
                                ✓
                            </button>
                            <button
                                onClick={() => onReject(p.sessionId)}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-lg border-none cursor-pointer transition-colors">
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}