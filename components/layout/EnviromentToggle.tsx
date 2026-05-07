'use client'

import { useAppStore } from "@/store/useAppStore"
import { Environment } from "@/types";

export function EnvironmentToggle() {

    const { environment, setEnvironment } = useAppStore();

    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['sandbox', 'live'] as Environment[]).map((env) => (
                <button
                    key={env}
                    onClick={() => setEnvironment(env)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border-none
                        ${environment === env
                            ? `bg-white shadow-sm ${env === 'live' ? 'text-green-600' : 'text-indigo-500'}`
                            : 'bg-transparent text-gray-500'
                        }`}
                >
                    {env === 'live' ? 'Live' : 'Sandbox'} 
                </button>
            ))}
        </div>
    )

}