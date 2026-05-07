'use client'

import { apiRequest } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore"
import { Branding } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type FormState = {
    displayName: string
    logoUrl: string
    primaryColor: string
    secondaryColor: string
    faviconUrl: string
    customDomain: string
};

type FormKey = keyof FormState;

function Field({ label, fieldKey, type = 'text', value, onChange }: { label: string; fieldKey: FormKey; type?: string, value: string, onChange: (key: FormKey, value: string) => void }) {
    return (
        <div>
            <label className="text-sm font-medium block mb-1">{label}</label>
            {type === 'color' ? (
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(fieldKey, e.target.value)}
                        className="w-10 h-9 p-0.5 rounded-md border border-gray-200 cursor-pointer"
                    />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(fieldKey, e.target.value)}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(fieldKey, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            )}
        </div>
    )
}

const DEFAULT_FORM: FormState = {
    displayName: '',
    logoUrl: '',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    faviconUrl: '',
    customDomain: '',
}

export default function BrandingPage() {
    const { user } = useAppStore();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<FormState | null>(null);

    const { data: branding } = useQuery({
        queryKey: ['branding', user?.tenantId],
        queryFn: () => apiRequest<Branding>(`/tenants/${user?.tenantId}/branding`),
        enabled: !!user?.tenantId,
    })


    const initialForm: FormState = branding ? {
        displayName: branding.displayName ?? '',
        logoUrl: branding.logoUrl ?? '',
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        faviconUrl: branding.faviconUrl ?? '',
        customDomain: branding.customDomain ?? '',
    } : DEFAULT_FORM

    const currentForm = form ?? initialForm;

    function handleChange(key: FormKey, value: string) {
        setForm((f) => ({ ...(f ?? currentForm), [key]: value }))
    }

    const updateMutation = useMutation({
        mutationFn: () =>
            apiRequest(`/tenants/${user?.tenantId}/branding`, {
                method: 'PUT',
                body: JSON.stringify(currentForm),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['branding'] })
            document.documentElement.style.setProperty('--primary', currentForm.primaryColor)
            document.documentElement.style.setProperty('--secondary', currentForm.secondaryColor)
        },
    });

    type FormKey = keyof typeof currentForm;



    return (
        <div>
            <h1 className="text-xl font-medium mb-6">Marca blanca</h1>

            <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg flex flex-col gap-4">
                <Field label="Nombre de la empresa" fieldKey="displayName" type="text" value={currentForm.displayName} onChange={handleChange} />
                <Field label="URL del logo" fieldKey="logoUrl" type="url" value={currentForm.logoUrl} onChange={handleChange} />
                <Field label="Color primario" fieldKey="primaryColor" type="color" value={currentForm.primaryColor} onChange={handleChange} />
                <Field label="Color secundario" fieldKey="secondaryColor" type="color" value={currentForm.secondaryColor} onChange={handleChange} />
                <Field label="URL del favicon" fieldKey="faviconUrl" type="url" value={currentForm.faviconUrl} onChange={handleChange} />
                <Field label="Dominio personalizado" fieldKey="customDomain" type="text" value={currentForm.customDomain} onChange={handleChange} />

                <button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors mt-1"
                >
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                </button>

                {updateMutation.isSuccess && (
                    <p className="text-sm text-green-600 text-center">
                        Cambios guardados correctamente
                    </p>
                )}
            </div>
        </div>
    )
}