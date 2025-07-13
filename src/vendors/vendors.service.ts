import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthService } from 'src/auth/auth.service';
import { CreateVendorDto } from 'src/auth/auth.types';
import { EmailQueue } from 'src/email/email.queue';
import { OtpService } from 'src/otp/otp.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { bad } from 'src/utils/error.utils';
import { generateOtp, generateShortId, isEmailTaken, isPhoneTaken } from 'src/utils/helpers.utils';

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
                        name: name || businessName,
                        businessName,
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



}
