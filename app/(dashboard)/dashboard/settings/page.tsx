import Link from 'next/link'

const SETTINGS = [
  {
    href: '/dashboard/settings/branding',
    title: 'Marca blanca',
    desc: 'Logo, colores y dominio personalizado',
  },
]

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-medium mb-6">Configuración</h1>
      <div className="flex flex-col gap-2 max-w-lg">
        {SETTINGS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4 no-underline hover:bg-gray-50 transition-colors block"
          >
            <p className="text-sm font-medium text-gray-900 mb-0.5">{s.title}</p>
            <p className="text-sm text-gray-500">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}