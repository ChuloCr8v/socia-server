import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthService } from '../auth/auth.service.js';
import { CreateVendorDto, UpdateVendorDto } from '../auth/auth.types.js';
import { EmailQueue } from '../email/email.queue.js';
import { OtpService } from '../otp/otp.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { bad } from '../utils/error.utils.js';
import { isEmailTaken, isPhoneTaken, generateOtp, generateShortId } from '../utils/helpers.utils.js';
@Injectable()
export class VendorsService {
    constructor(private prisma: PrismaService, private emailQueue: EmailQueue, private otp: OtpService, private auth: AuthService
    ) { }

    async getVendor(id: string) {
        try {
            const vendor = await this.prisma.vendor.findUnique({
                where: { id },
                include: {
                    user: { include: { otps: true } },
                    operatingHour: true,
                    menu: true,
                    profileImage: true,
                },
            });

            if (!vendor) {
                throw new Error(`Vendor with id ${id} not found`);
            }

            return vendor;
        } catch (error) {
            console.error(error);
            bad(error);
        }
    }


    async listVendors() {
        try {
            return await this.prisma.vendor.findMany({
                include: {
                    user: {
                        include: {
                            otps: true
                        }
                    },
                    operatingHour: true,
                    menu: true,
                    profileImage: true,
                }
            })
        } catch (error) {
            console.log(error)
            bad(error)
        }

    }

    async createVendor(dto: CreateVendorDto) {
        const { email, phone, password, name, businessName, deliveryFee, ...rest } = dto;

        if (await isEmailTaken(email)) bad('Email already exists');
        if (await isPhoneTaken(phone)) bad('Phone number already exists');

        const passHash = await hash(password);

        const { otp, hashedOtp } = await generateOtp();

        const vendorUser = await this.prisma.user.create({
            data: {
                email,
                isVerified: dto.isVerified ?? false,
                name: name || businessName,
                phone: phone || '',
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
                        deliveryFee: deliveryFee || 0,
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

        await this.otp.verifyOtp(user.id, otp);

        await this.prisma.user.update({
            where: { email },
            data: { isVerified: true },
        });

        await this.emailQueue.enqueueVerifyAccount(email, user.name);

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

    async updateBusinessProfilePicture(id: string, imageId: string) {
        console.log(imageId)
        try {
            const vendor = await this.prisma.vendor.findUnique({ where: { id } })

            if (!vendor) bad("Account not found!")

            await this.prisma.vendor.update({
                where: { id },
                data: {
                    profileImage: {
                        connect: { id: imageId }
                    }
                },
            })
        } catch (error) {
            console.log(error)
            bad(error)
        }
    }

    async updateVendor(id: string, dto: UpdateVendorDto) {
        try {
            const vendor = await this.prisma.vendor.findUnique({ where: { id } });

            if (!vendor) {
                bad("Vendor not found");
            }

            const { operatingHour, ...rest } = dto;

            const updatedVendor = await this.prisma.vendor.update({
                where: { id },
                data: {
                    ...rest,
                    ...(dto.operatingHour && {
                        operatingHour: {
                            deleteMany: {},
                            create: dto.operatingHour.map((o) => ({
                                day: o.day,
                                opening: o.opening ? new Date(o.opening) : null,
                                closing: o.closing ? new Date(o.closing) : null,
                                isOpen: o.isOpen,
                            })),
                        },
                    }),
                },

            });


            return updatedVendor;
        } catch (error) {
            console.log(error);
            bad(error);
        }
    }

}
