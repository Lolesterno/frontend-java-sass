'use client'

type Props = {
    cardNumber: string
    cardHolder: string
    expiryMonth: string
    expiryYear: string
    brand: string
}

function maskNumber(number: string) {
    const clean = number.replace(/\s/g, '');
    const groups = [];
    for (let i = 0; i < 16; i += 4) {
        groups.push(clean.slice(i, i + 4) || '****');
    }
    return groups.join(' ');
}

function BrandLogo({ brand }: { brand: string }) {
    const colors: Record<string, string> = {
        VISA: '#1a1f71',
        MASTERCARD: '#eb001b',
        AMEX: '#007bc1',
        DISCOVER: '#ff6600',
    }
    return (
        <span style={{ color: colors[brand] ?? '#6b7280' }}
            className="text-sm font-bold tracking-widest">
            {brand || 'CARD'}
        </span>
    )
}

export function CardPreview({ cardNumber, cardHolder, expiryMonth, expiryYear, brand }: Props) {
    return (
        <div className="relative w-full max-w-sm h-48 rounded-2xl p-6 text-white select-none overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}>
            {/* Círculos decorativos */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
                style={{ background: 'rgba(255,255,255,0.3)' }} />
            <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full opacity-10"
                style={{ background: 'rgba(255,255,255,0.3)' }} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div className="w-10 h-7 rounded bg-yellow-300 opacity-90" />
                    <BrandLogo brand={brand} />
                </div>

                <div className="font-mono text-lg tracking-widest">
                    {maskNumber(cardNumber)}
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs opacity-60 uppercase tracking-wider">Titular</p>
                        <p className="text-sm font-medium uppercase tracking-wide">
                            {cardHolder || 'NOMBRE APELLIDO'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs opacity-60 uppercase tracking-wider">Vence</p>
                        <p className="text-sm font-medium font-mono">
                            {expiryMonth || 'MM'}/{expiryYear?.slice(-2) || 'AA'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}