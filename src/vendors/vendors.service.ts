import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthService } from '../auth/auth.service.js';
import { CreateVendorDto } from '../auth/auth.types.js';
import { EmailQueue } from '../email/email.queue.js';
import { OtpService } from '../otp/otp.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { bad } from '../utils/error.utils.js';
import { isEmailTaken, isPhoneTaken, generateOtp, generateShortId } from '../utils/helpers.utils.js';
@Injectable()
export class VendorsService {
    constructor(private prisma: PrismaService, private emailQueue: EmailQueue, private otp: OtpService, private auth: AuthService
    ) { }

    async listVendors() {
        return await this.prisma.vendor.findMany({
            include: {
                user: {
                    include: {
                        otps: true
                    }
                },
            }
        })
    }

    async createVendor(dto: CreateVendorDto) {
        const { email, phone, password, name, businessName, ...rest } = dto;

        if (await isEmailTaken(email)) bad('Email already exists');
        if (await isPhoneTaken(phone)) bad('Phone number already exists');

        const passHash = await hash(password);

        const { otp, hashedOtp } = await generateOtp();

        const vendorUser = await this.prisma.user.create({
            data: {
                email,
                isVerified: dto.isVerified ?? false,
                name: name || businessName,
                auth: {
                    create: {
                        passHash,
                    },
                },
                vendor: {
                    create: {
                        businessName: name || businessName,
                        phone: phone || '',
                        email,
                        vendorId: `VEN${generateShortId(4)}`,
                        ...rest,
                    },
                },
            },
        });

        await this.prisma.otp.create({
            data: {
                otp: hashedOtp,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                type: 'EMAIL_VERIFICATION',
                user: {
                    connect: {
                        email,
                    },
                },
            },
        });

        // Send OTP email
        await this.emailQueue.enqueueOtpEmail(email, otp, name || businessName);

        return vendorUser;
    }


    async verifyVendor(email: string, otp: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { vendor: true }, // Optional, include vendor data if needed
        });

        if (!user) return bad("Account does not exist!");

        const otpToString = otp.toString()
        console.log("otp type", typeof otp)
        await this.otp.verifyOtp(user.id, otp);

        await this.prisma.user.update({
            where: { email },
            data: { isVerified: true },
        });

        // await this.emailQueue.enqueueVerifyAccount(email, user.name);

        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.auth.generateToken(payload);

        // ✅ Return both user and token
        return {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                vendor: user.vendor,
            },
        };
    }


    async updateBusinessCategory(id: string, businessCategory: string) {

        try {
            const updatedVendor = await this.prisma.vendor.update({
                where: { id },
                data: { businessCategory },
            });

            return {
                message: "Business category updated successfully",
                data: updatedVendor,
            };
        } catch (error) {
            console.log(error);
            return bad(error.message);
        }
    }
}
