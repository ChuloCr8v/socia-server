import {
    IsString,
    IsUUID,
    IsNumber,
    IsOptional,
    IsArray,
    ValidateNested,
    IsEnum,
    IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { MenuAvailability } from '@prisma/client';


export class CreateMenuItemSizeVariationDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsString()
    menuId?: string;

    @IsString()
    name: string;

    @IsString()
    price: string;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean

    @IsEnum(MenuAvailability)
    availability: MenuAvailability;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    qty?: number;
}

export class CreateAddOnDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsOptional()
    @IsString()
    menuId?: string;

    @IsString()
    name: string;

    @IsString()
    price: string;

    @IsBoolean()
    @IsOptional()
    isRequired?: boolean

    @IsEnum(MenuAvailability)
    availability: MenuAvailability;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    image: string;

    @IsOptional()
    @IsNumber()
    qty?: number;

}


export class CreateMenuDto {
    // @IsUUID()
    // vendorId: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsNumber()
    price: number;

    @IsNumber()
    preparationTime: number;

    @IsOptional()
    @IsString()
    stockQuantity?: string;

    @IsArray()
    @IsOptional()
    categories?: string[];


    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateMenuItemSizeVariationDto)
    variants: CreateMenuItemSizeVariationDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAddOnDto)
    addons: CreateAddOnDto[];



    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageDto)
    images: ImageDto[];

}


export class ImageDto {
    @IsString()
    url: string;

    @IsString()
    publicId: string;

    @IsString()
    id: string;
}