import { IsArray, IsBoolean, IsEmail, IsISO8601, IsNotEmpty, IsNumber, IsOptional, isString, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from "class-transformer";
import { ImageDto } from 'src/vendors/types/menu';
import { PartialType } from '@nestjs/mapped-types';



export enum OtpTypes {
    EMAIL_VERIFICATION
}


export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsString()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    phoneNumber: string

    @IsString()
    @IsNotEmpty()
    address: string

    @IsBoolean()
    @IsOptional()
    isActive?: boolean

    @IsBoolean()
    @IsOptional()
    isVerified?: boolean



    // @IsArray()
    // @IsOptional()
    // @ValidateNested({ each: true })
    // @Type(() => ImageDto)
    // images: ImageDto[];

}

export class LoginDto {
    @IsEmail()
    email: string

    @IsString()
    password?: string

    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    googleId?: string
}


export type AuthPayload = {
    sub: string;
    otpId?: string;
    isOtp?: boolean;
    userId?: string
};

export type IAuthUser = AuthPayload;

export class BankInformationDto {
    @IsString()
    bankName: string

    @IsString()
    accountName: string

    @IsString()
    accountNumber: string
}

export class CreateVendorDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsString()
    businessName?: string

    @IsString()
    email: string

    @IsString()
    password: string

    @IsString()
    phone?: string

    @IsNumber()
    @IsOptional()
    deliveryFee?: number

    @IsBoolean()
    @IsOptional()
    isVerified?: boolean

    // @IsArray()
    // @IsOptional()
    // @ValidateNested({ each: true })
    // @Type(() => ImageDto)
    // images: ImageDto[];

}

export class VendorDto extends CreateVendorDto {

    @IsString()
    address: string

    @IsString()
    cac: string

    @IsString()
    @IsOptional()
    logoUrl?: string

    @IsString()
    @IsOptional()
    headerImageUrl?: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BankInformationDto)
    banks: []

    @IsString()
    @IsOptional()
    openingTime?: string

    @IsString()
    @IsOptional()
    closingTime?: string

}


export class OperatingHourDto {
    @IsString()
    day: string;

    @IsOptional()
    @IsISO8601()
    opening?: string;   // matches Prisma schema

    @IsOptional()
    @IsISO8601()
    closing?: string;

    @IsBoolean()
    isOpen: boolean;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OperatingHourDto)
    operatingHour?: OperatingHourDto[];
}
export class validateUserDto {
    @IsEmail()
    email: string

    @IsString()
    otp: string
}