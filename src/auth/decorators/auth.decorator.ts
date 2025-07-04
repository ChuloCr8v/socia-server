// auth.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '@prisma/client';

export const Auth = (role?: Role) => {
    if (role) {
        return applyDecorators(
            Roles(role),
            UseGuards(AuthGuard('jwt'), RolesGuard)
        );
    }

    return applyDecorators(UseGuards(AuthGuard('jwt')));
};
