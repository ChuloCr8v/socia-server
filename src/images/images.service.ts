// src/images/images.service.ts
import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { bad } from 'src/utils/error.utils';

@Injectable()
export class ImagesService {
    constructor(
        private readonly cloudinary: CloudinaryService,
        private readonly prisma: PrismaService,
    ) { }

    async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
        try {
            const result = await this.cloudinary.uploadImage(file);

            console.log(result)

            const responseData = {
                publicId: result.public_id,
                url: result.secure_url
            }

            const saveToDb = await this.prisma.image.create({
                data: responseData
            })
            return saveToDb
        } catch (error) {
            return bad(error)
        }

    }

    async deleteImage(publicId: string, id: { id: string }) {
        console.log("🛠️ deleteImage called with:", publicId, id);

        try {
            await this.cloudinary.deleteImage(publicId);

            await this.prisma.image.delete({ where: { id: id.id } });

            console.log({ message: "image deleted successfully" })
            return

        } catch (error) {
            console.log(error)
            return bad(error)
        }
    }

    async getImagesForMenuItem(menuItemId: string): Promise<{ url: string, publicId: string }[]> {
        const item = await this.prisma.menu.findUnique({
            where: { id: menuItemId },
            select: { images: true },
        });
        return item?.images || [];
    }
}