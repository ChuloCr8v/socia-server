import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient()

export async function isEmailTaken(email: string) {
    const exists = await prisma.user.findUnique({ where: { email } });
    return !!exists;
}

export async function isPhoneTaken(phone: string) {
    const exists = await prisma.vendor.findUnique({ where: { phone } });
    return !!exists;
}

export async function generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOtp = await hash(otp)

    return { otp, hashedOtp }
}

export function generateShortId(length: number = 10) {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export enum OrderStatus {
    PLACED = "PLACED",
    CONFIRMED = "CONFIRMED",
    PREPARING = "PREPARING",
    READY = "READY",
    PICKED_UP = "PICKED_UP",
    ON_THE_WAY = "ON_THE_WAY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    PENDING = "PENDING",
    RECEIVED = "RECEIVED",
    REJECTED = "REJECTED",
}

export enum OrderRejectionReason {
    OUT_OF_STOCK = "OUT_OF_STOCK",
    TEMP_UNAVAILABLE = "TEMP_UNAVAILABLE",
    CLOSED = "CLOSED",
    NONE = "NONE",
    OTHERS = "OTHERS",
}

export const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.PLACED]: "#9e9e9e",
    [OrderStatus.CONFIRMED]: "#2196f3",
    [OrderStatus.PREPARING]: "#ff9800",
    [OrderStatus.READY]: "#673ab7",
    [OrderStatus.PICKED_UP]: "#009688",
    [OrderStatus.ON_THE_WAY]: "#3f51b5",
    [OrderStatus.DELIVERED]: "#4caf50",
    [OrderStatus.CANCELLED]: "#f44336",
    [OrderStatus.PENDING]: "#9c27b0",
    [OrderStatus.RECEIVED]: "#795548",
    [OrderStatus.REJECTED]: "#e53935",
};

export const statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.PLACED]: "Order Placed",
    [OrderStatus.CONFIRMED]: "Order Confirmed",
    [OrderStatus.PREPARING]: "Preparing",
    [OrderStatus.READY]: "Ready for Pickup",
    [OrderStatus.PICKED_UP]: "Picked Up",
    [OrderStatus.ON_THE_WAY]: "On The Way",
    [OrderStatus.DELIVERED]: "Delivered",
    [OrderStatus.CANCELLED]: "Cancelled",
    [OrderStatus.PENDING]: "Pending",
    [OrderStatus.RECEIVED]: "Received",
    [OrderStatus.REJECTED]: "Rejected",
};

export const rejectionReasons: Record<OrderRejectionReason, string> = {
    [OrderRejectionReason.OUT_OF_STOCK]: "Out of Stock",
    [OrderRejectionReason.TEMP_UNAVAILABLE]: "Temporarily Unavailable",
    [OrderRejectionReason.CLOSED]: "Closed for the Day",
    [OrderRejectionReason.NONE]: "No Reason Provided",
    [OrderRejectionReason.OTHERS]: "Other Reason",
};
