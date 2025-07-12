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
