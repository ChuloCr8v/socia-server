// roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRole) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();


        return user?.role === requiredRole;
    }
}
