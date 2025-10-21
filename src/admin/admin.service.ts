import { Injectable } from '@nestjs/common';
import { AddUserDTO } from './types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { bad } from '../utils/error.utils.js';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async addUser(dto: AddUserDTO, _addedBy: string) {
        const password = crypto.randomUUID()
        const userId = "UO" + Math.floor(Math.random() * 1000)
        try {
            return await this.prisma.$transaction(async (trx) => {
                await trx.user.create(
                    {
                        data: {
                            userName: dto.name,
                            email: dto.email,
                            role: dto.role,
                            userId,
                            auth: {
                                create: {
                                    passHash: password
                                }
                            },

                        }
                    }
                )
            })
        } catch (error) {
            console.log(error)
            bad(error)
        }
    }

    async updateUser(dto: AddUserDTO, id: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id }
            })

            if (!user) bad("User not found")

            return await this.prisma.$transaction(async (trx) => {
                await trx.user.update(
                    {
                        where: { id },
                        data: {
                            userName: dto.name,
                            email: dto.email,
                            role: dto.role,
                        }
                    }
                )
            })
        } catch (error) {
            console.log(error)
            bad(error)
        }
    }


    async listUsers() {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: {
                    createdAt: "desc"
                }
            })
            return users ?? []
        } catch (error) {
            bad(error)
        }
    }

    async getUser(id: string) {
        try {

            const user = await this.prisma.user.findUnique({
                where: {
                    id
                }
            })

            return user ? user : bad("User not found")
        } catch (error) {
            bad(error)
        }
    }

    async suspendUser(id: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id,

                },

            })

            !user && bad("User not found")

            await this.prisma.user.update({
                where: {
                    id,
                },
                data: {
                    status: user.status === "SUSPENDED" ? UserStatus.ACTIVE : UserStatus.SUSPENDED
                }
            })

            return {
                message: "User suspended",
                user
            }

        } catch (error) {
            bad(error)
        }
    }



    async deleteUser(dto: { id: string }) {

        try {
            !dto.id && bad("Id is required")
            return await this.prisma.user.delete({
                where: {
                    id: dto.id
                }
            })
        } catch (error) {
            console.log(error)
            bad(error)
        }

    }

}
