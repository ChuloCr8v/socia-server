import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { CreateVendorDto, OtpTypes } from 'src/auth/auth.types';
import { EmailQueue } from 'src/email/email.queue';
import { EmailService } from 'src/email/email.service';
import { OtpService } from 'src/otp/otp.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { bad } from 'src/utils/error.utils';
import { generateOtp, generateShortId, isEmailTaken, isPhoneTaken } from 'src/utils/helpers.utils';

@Injectable()
export class VendorsService {
    constructor(private prisma: PrismaService, private emailQueue: EmailQueue, private otp: OtpService
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
        const user = await this.prisma.user.findUnique({ where: { email: email } })
        console.log(otp, user.id)
        if (!user) return bad("Account does not exist!");

        await this.otp.verifyOtp(user.id, otp)

        const { name } = user

        await this.prisma.user.update({
            where: { email: email },
            data: {
                isVerified: true
            }
        })

        await this.emailQueue.enqueueVerifyAccount(email, name);

    }
}
