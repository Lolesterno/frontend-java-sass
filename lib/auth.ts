import { User } from "@/types";

export function parseToken(token: string): User | null {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        )

        return {
            id: payload.sub,
            email: payload.email,
            tenantId: payload.tenantId,
            role: payload.role,
        }

    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        )
        return Date.now() >= payload.exp * 1000
    } catch {
        return true
    }
}