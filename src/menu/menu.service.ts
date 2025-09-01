import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { bad } from 'src/utils/error.utils';
import { CreateMenuDto } from 'src/vendors/types/menu';


@Injectable()
export class MenuService {
    constructor(private prisma: PrismaService) { }

    async listMenu(id: string) {

        try {
            return await this.prisma.menu.findMany({
                where: {
                    vendorId: id,
                },
                include: {
                    images: true,
                    addons: true,
                    variants: true,
                    vendor: true,
                    categories: true
                }
            })
        } catch (error) {
            return bad(error)
        }
    }

    async getMenu(id: string) {
        try {
            const res = await this.prisma.menu.findUnique({
                where: { id }, include: {
                    images: true,
                    variants: true,
                    categories: true,
                    addons: true
                }
            })

            if (!res) bad("Menu not found")
            return res
        } catch (error) {
            bad(error)
        }
    }

    async createMenu(id: string, dto: CreateMenuDto) {

        const { variants, addons } = dto

        try {
            const res = await this.prisma.menu.create({
                data: {
                    vendor: { connect: { id } },
                    ...dto,
                    preparationTime: Number(dto.preparationTime),
                    stockQuantity: Number(dto.stockQuantity) === 0 || !Number(dto.stockQuantity) ? "Unlimited" : dto.stockQuantity,
                    categories: {
                        connect: dto.categories.map(id => ({ id }))
                    },
                    variants: {
                        create: variants ? variants.map(a => ({ ...a, qty: a.qty ? Number(a.qty) : 0 })) : []
                    },
                    addons: {
                        create: addons ? addons.map(a => ({ ...a, qty: a.qty ? Number(a.qty) : 0 })) : []
                    },
                    images: { connect: dto.images.map(image => ({ id: image.id })) }
                }
            })

            return {
                message: "Menu created successfully",
                data: res
            }

        } catch (error) {
            console.log("error", error)
            return bad("Error creating menu", error)
        }
    }

    async createCategory(dto: { name: string, description: string, image?: string }) {
        try {
            const res = await this.prisma.category.create({
                data: {
                    ...dto,
                    image: dto.image ? { connect: { id: dto.image } } : undefined
                }
            })

            return {
                message: "Category created successfully",
                data: res
            }

        } catch (error) {
            console.log("error", error)
            return bad("Error creating category", error)
        }
    }

    async getCategories() {
        try {
            return await this.prisma.category.findMany({
                include: {
                    image: true
                }
            })

        } catch (error) {
            console.log("error", error)
            return bad("Error fetching categories", error)
        }
    }

    async toggleMenuAvailability(id: string) {

        try {
            const menu = await this.prisma.menu.findUnique({ where: { id } })
            if (!menu) bad("Menu does not exits")

            const res = await this.prisma.menu.update({
                where: { id },
                data: {
                    availability: menu.availability === "UNAVAILABLE" ? "AVAILABLE" : "UNAVAILABLE"
                }
            })

            return res
        } catch (error) {
            console.log("failed to toggle availability", error)
            bad(error)
        }
    }

    async deleteMenu(id: string) {
        try {
            await this.prisma.menu.delete({
                where: {
                    id
                }
            })

            return { message: "Menu Deleted successfully" }
        } catch (error) {
            bad(error)
        }
    }

    async updateMenu(id: string, dto: CreateMenuDto) {
        try {
            const menuItem = await this.prisma.menu.findUnique({ where: { id } });
            if (!menuItem) bad("Menu item not found");

            const updatedMenu = await this.prisma.menu.update({
                where: { id },
                data: {
                    ...dto,
                    preparationTime: Number(dto.preparationTime),
                    stockQuantity: dto.stockQuantity,

                    // Replace all categories
                    categories: {
                        set: dto.categories.map(categoryId => ({ id: categoryId })),
                    },

                    // Replace all images
                    images: {
                        set: dto.images.map(img => ({ id: img.id })),
                    },

                    // VARIANTS
                    variants: {
                        // Remove variants not in incoming list
                        deleteMany: {
                            id: { notIn: dto.variants.filter(v => v.id).map(v => v.id) },
                        },
                        // Create new variants (no ID provided)
                        create: dto.variants
                            .filter(v => !v.id)
                            .map(v => ({
                                name: v.name,
                                price: v.price,
                                isDefault: v.isDefault,
                                description: v.description || null,
                                qty: v.qty || 0
                            })),
                        // Update existing variants (ID provided)
                        update: dto.variants
                            .filter(v => v.id)
                            .map(v => ({
                                where: { id: v.id },
                                data: {
                                    name: v.name,
                                    price: v.price,
                                    isDefault: v.isDefault,
                                    description: v.description || null,
                                },
                            })),
                    },

                    // ADDONS
                    addons: {
                        // Remove addons not in incoming list
                        deleteMany: {
                            id: { notIn: dto.addons.filter(a => a.id).map(a => a.id) },
                        },
                        // Create new addons
                        create: dto.addons
                            .filter(a => !a.id)
                            .map(a => ({
                                name: a.name,
                                price: a.price,
                                description: a.description || null,
                                isRequired: a.isRequired || false,
                                qty: a.qty || 0

                            })),
                        // Update existing addons
                        update: dto.addons
                            .filter(a => a.id)
                            .map(a => ({
                                where: { id: a.id },
                                data: {
                                    name: a.name,
                                    price: a.price,
                                    description: a.description || null,
                                    isRequired: a.isRequired || false,
                                },
                            })),
                    },
                },
            });

            return {
                message: "Menu updated successfully",
                data: updatedMenu,
            };
        } catch (error) {
            console.log(error);
            bad(error);
        }
    }


}
