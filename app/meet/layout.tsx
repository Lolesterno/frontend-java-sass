export default function MeetLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body style={{ margin: 0, padding: 0, background: '#111827' }}>
                {children}
            </body>
        </html>
    )
}