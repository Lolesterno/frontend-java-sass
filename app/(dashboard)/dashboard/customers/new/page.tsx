'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateCustomer } from '@/lib/hooks/useCustomers'

const DOCUMENT_TYPES = ['CC', 'CE', 'PASSPORT', 'NIT']

export default function NewCustomerPage() {
  const router = useRouter()
  const createCustomer = useCreateCustomer()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    documentType: 'CC', documentNumber: '',
    licenseNumber: '', licenseExpiry: '',
    address: '', notes: '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const customer = await createCustomer.mutateAsync({
        ...form,
        licenseExpiry: form.licenseExpiry ? form.licenseExpiry : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      router.push(`/dashboard/customers/${customer.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
                className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-sm">←</button>
        <h1 className="text-xl font-medium">Nuevo cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">Información personal</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Nombre</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                     placeholder="Juan" required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Apellido</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                     placeholder="Pérez" required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input type="email" value={form.email}
                     onChange={e => set('email', e.target.value)}
                     placeholder="juan@email.com" required className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Teléfono</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                     placeholder="+57 300 000 0000" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Tipo documento</label>
              <select value={form.documentType}
                      onChange={e => set('documentType', e.target.value)}
                      className={inputClass}>
                {DOCUMENT_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Número documento</label>
              <input value={form.documentNumber}
                     onChange={e => set('documentNumber', e.target.value)}
                     placeholder="1234567890" required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Dirección</label>
            <input value={form.address} onChange={e => set('address', e.target.value)}
                   placeholder="Calle 123 #45-67" className={inputClass} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <p className="text-sm font-medium text-gray-700">Licencia de conducción</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Número de licencia</label>
              <input value={form.licenseNumber}
                     onChange={e => set('licenseNumber', e.target.value)}
                     placeholder="LIC-123456" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Fecha de vencimiento</label>
              <input type="date" value={form.licenseExpiry}
                     onChange={e => set('licenseExpiry', e.target.value)}
                     className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Notas internas</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                      rows={2} placeholder="Observaciones sobre el cliente..."
                      className={inputClass} />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={createCustomer.isPending}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm border-none cursor-pointer transition-colors">
          {createCustomer.isPending ? 'Guardando...' : 'Crear cliente'}
        </button>
      </form>
    </div>
  )
}