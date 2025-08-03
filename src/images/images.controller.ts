// src/images/images.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, Delete, Param, UsePipes, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { ImageFileValidationPipe } from 'src/common/pipes/image-file-validation.pipe';

@Controller('images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @UploadedFile(ImageFileValidationPipe) file: Express.Multer.File,
    ) {
        console.log(process.env.CLOUDINARY_API_SECRET, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_CLOUD_NAME)
        return this.imagesService.uploadImage(file);
    }

    @Delete(':publicId')
    async deleteImage(@Param('publicId') publicId: string, @Body() id: { id: string }) {
        await this.imagesService.deleteImage(publicId, id);
    }
}