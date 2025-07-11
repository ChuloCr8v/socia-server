import { IsArray, IsBoolean, IsEmail, IsOptional, isString, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from "class-transformer";


export enum OtpTypes {
    EMAIL_VERIFICATION
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

    @IsBoolean()
    @IsOptional()
    isVerified?: boolean


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

export class validateUserDto {
    @IsEmail()
    email: string

    @IsString()
    otp: string
}