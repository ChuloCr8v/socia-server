// src/images/images.module.ts
import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ImagesService } from './images.service';

@Module({
    imports: [CloudinaryModule, PrismaModule],
    controllers: [ImagesController],
    providers: [ImagesService],
    exports: [ImagesService],
})
export class ImagesModule { }