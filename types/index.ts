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
    stripeCustomerId: string | null
    stripePaymentIntentId: string | null
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

export type VehicleStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'INACTIVE';
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'VAN' | 'BUS' | 'BICYCLE' | 'SCOOTER' | 'OTHER';
export type RateType = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type BookingSource = 'DASHBOARD' | 'PORTAL';

export interface Vehicle {
    id: string;
    type: VehicleType;
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string | null;
    vin: string | null;
    seats: number | null;
    transmission: string;
    fuelType: string;
    dailyRate: number | null;
    hourlyRate: number | null;
    weeklyRate: number | null;
    monthlyRate: number | null;
    status: VehicleStatus;
    description: string | null;
    images: string[];
    features: string[];
    createdAt: string;
}

export interface VehiclePrice {
    id: string;
    rateType: string;
    amount: number;
    currency: string;
}

export interface PricingSeason {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    multiplier: number;
    active: boolean;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    documentType: string;
    documentNumber: string;
    licenseNumber: string | null;
    licenseExpiry: string | null;
    licenseVerified: boolean;
    address: string | null;
    notes: string | null;
    active: boolean;
    createdAt: string;
}

export interface Booking {
    id: string;
    vehicleId: string;
    customerId: string;
    status: BookingStatus;
    startDate: string;
    endDate: string;
    pickupLocation: string | null;
    returnLocation: string | null;
    rateType: string;
    rateAmount: number;
    totalAmount: number;
    currency: string;
    depositAmount: number;
    notes: string | null;
    internalNotes: string | null;
    source: BookingSource;
    paymentStatus: string;
    transactionId: string | null;
    createdAt: string;
}

export interface AvailabilityResponse {
    vehicleId: string;
    available: boolean;
    reason: string | null;
    nextAvailableFrom: string | null;
}

export interface MeetRoom {
    id: string;
    name: string;
    hostname: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    participantCount: number;
}

export interface ChatMessage {
    id: string;
    senderName: string;
    message: string;
    sendAt: string;
}

export interface Participant {
    sessionId: string;
    name: string;
    stream: MediaStream | null;
    audioMuted: boolean;
    videoMuted: boolean;
}

export interface ChatMsg {
    senderId: string;
    senderName: string;
    message: string;
    timestamp: number;
    isLocal?: boolean;
}

export interface WaitingParticipant {
    sessionId: string;
    name: string;
}

type MessageType =
    | 'JOIN_ROOM' | 'ROOM_STATE' | 'PARTICIPANT_JOINED' | 'PARTICIPANT_LEFT' | 'ROOM_CLOSED'
    | 'WAITING' | 'ADMIT' | 'REJECT' | 'KNOCK'
    | 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE'
    | 'CHAT_MESSAGE' | 'MUTE_AUDIO' | 'UNMUTE_AUDIO' | 'MUTE_VIDEO' | 'UNMUTE_VIDEO'
    | 'ERROR'

export interface MeetMessage {
    type: MessageType;
    roomId?: string;
    senderId?: string;
    senderName?: string;
    targetId?: string;
    tenantId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
    message?: string;
    timestamp?: number;
}

export interface PaymentIntentResponse {
    paymentIntentId: string;
    clientSecret: string;
    status: string;
    amount: number;
    currency: string;
}

export interface GatewayConfig {
    gatewayType: string;
    publicKey: string;
    mode: string;
    active: boolean;
    configured: boolean;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
    active: boolean;
}

export interface AdminLoginResponse {
    accessToken: string;
    refreshToken: string;
    adminId: string;
    name: string;
    email: string;
    role: string;
}

export interface TenantAdmin {
    id: string;
    name: string;
    slug: string;
    plan: string;
    active: boolean;
    ownerId: string;
    createdAt: string;
}

export interface AdminMetrics {
    totalTenants: number;
    activeTenants: number;
    totalRevenueMtd: number;
    newTenantsThisWeek: number;
    planDistribution: Record<string, number>;
    mrr: number;
}