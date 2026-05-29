export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body style={{ margin: 0, padding: 0 }}>
                {children}
            </body>
        </html>
    )
}