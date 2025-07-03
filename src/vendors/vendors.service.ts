import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { CreateVendorDto, OtpTypes } from 'src/auth/auth.types';
import { EmailQueue } from 'src/email/email.queue';
import { EmailService } from 'src/email/email.service';
import { OtpService } from 'src/otp/otp.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { bad } from 'src/utils/error.utils';
import { generateOtp, isEmailTaken, isPhoneTaken } from 'src/utils/helpers.utils';

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
        const otp = generateOtp();

        const [vendor] = await this.prisma.$transaction([
            this.prisma.user.create({
                data: {
                    email,
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
                            phone,
                            ...rest,
                        },
                    },
                },
            }),

            this.prisma.otp.create({
                data: {
                    otp: await hash(otp.toString()),
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                    type: "EMAIL_VERIFICATION",
                    user: {
                        connect: {
                            email,
                        },
                    },
                },
            }),
        ]);

        await this.emailQueue.enqueueOtpEmail(email, otp.toString(), name || businessName);

        // await this.email.sendOtpEmail(email, otp.toString(), name || businessName);

        return vendor;
    }

    async verifyVendor(userId: string, otp: string) {
        await this.otp.verifyOtp(userId)

        const user = await this.prisma.user.findUnique({ where: { id: userId } })

        const { email, name } = user

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true
            }
        })

        await this.emailQueue.enqueueVerifyAccount(email, name);

    }
}
