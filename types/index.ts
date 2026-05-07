export interface User {
    id: string;
    email: string;
    tenantId: string;
    role: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    plan: string;
    active: boolean;
    ownerId: string;
    createdAt: string;
}

export interface Branding {
    tenantId: string;
    displayName: string | null;
    logoUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    faviconUrl: string | null;
    customDomain: string | null;
}

export interface ApiKey {
    id: string;
    name: string;
    environment: Environment;
    key: string | null;
    createdAt: string;
}

export interface Plan {
    id: string;
    name: string;
    displayName: string;
    priceMonthly: number;
    priceYearly: number;
    maxRequests: number;
    maxMembers: number;
    maxApiKeys: number;
    features: string[];
}

export interface Subscription {
    id: string;
    tenantId: string;
    plan: Plan;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: string;
}

export interface Usage {
    tenantId: string;
    period: string;
    requestsUsed: number;
    requestsLimit: number;
    usagePercent: number;
}

export interface Member {
    id: string;
    userId: string;
    role: string;
    invitedAt: string;
    joinedAt: string | null;
}

export type Environment = 'live' | 'sandbox'

export interface CardToken {
    token: string;
    lastFour: string;
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    cardHolder: string;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: 'APPROVED' | 'DECLINED' | 'REVERSED' | 'PENDING';
    cardLastFour: string;
    cardBrand: string;
    responseCode: string;
    responseMessage: string;
    description: string;
    createdAt: string;
}