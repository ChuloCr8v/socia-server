import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function isEmailTaken(email: string) {
    const exists = await prisma.user.findUnique({ where: { email } });
    return !!exists;
}

export async function isPhoneTaken(phone: string) {
    const exists = await prisma.vendor.findUnique({ where: { phone } });
    return !!exists;
}

export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000)
}

export function generateShortId(length: number = 10) {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
