'use client'

import { ChatMsg } from "@/types"
import { useEffect, useRef, useState } from "react";

interface Props {
    messages: ChatMsg[];
    onSend: (text: string) => void;
    mySessionId?: string;
}

export function ChatPanel({ messages, onSend }: Props) {
    const [text, setText] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages]);

    function handleSend(e: React.SubmitEvent) {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim())
        setText('')
    }

    return (
        <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700">
            <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-white text-sm font-medium">Chat</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {messages.length === 0 && (
                    <p className="text-gray-500 text-xs text-center mt-4">
                        Los mensajes aparecerán aquí
                    </p>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-gray-400 mb-0.5">{msg.senderName}</span>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm
              ${msg.isLocal
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-gray-700 text-gray-100 rounded-bl-none'}`}>
                            {msg.message}
                        </div>
                        <span className="text-xs text-gray-500 mt-0.5">
                            {new Date(msg.timestamp).toLocaleTimeString('es-CO', {
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-gray-700 flex gap-2">
                <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none border border-gray-600 focus:border-indigo-500"
                />
                <button type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-lg border-none cursor-pointer transition-colors">
                    →
                </button>
            </form>
        </div>
    )
}