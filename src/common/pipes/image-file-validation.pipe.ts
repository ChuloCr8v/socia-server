// src/common/pipes/file-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ImageFileValidationPipe implements PipeTransform {
    transform(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('File too large (max 5MB)');
        }

        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            throw new BadRequestException('Only image files are allowed');
        }

        return file;
    }
}