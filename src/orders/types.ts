import { IsArray, IsIn, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExtraDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsNumber()
    count: number;

    @IsNumber()
    total: number;
}

class VariantDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsNumber()
    count: number;

    @IsNumber()
    total: number;

    @IsOptional()
    isDefault?: boolean;
}

class OrderItemDto {
    @IsString()
    menuId: string;

    @IsString()
    name: string;

    @IsString()
    image: string;

    @IsNumber()
    price: number;

    @IsNumber()
    quantity: number;

    @IsNumber()
    totalCost: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => VariantDto)
    variant?: VariantDto;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExtraDto)
    extras: ExtraDto[];
}

export class CreateOrderDto {
    @IsString()
    vendorId: string;

    @IsNumber()
    subtotal: number;

    @IsNumber()
    tax: number;

    @IsNumber()
    deliveryFee: number;

    @IsNumber()
    total: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
    @IsString()
    @IsIn(['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'])
    status: string;
}
