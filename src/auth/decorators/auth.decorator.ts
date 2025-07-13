// auth.decorator.ts
import { applyDecorators, createParamDecorator, ExecutionContext, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { type Request } from 'express';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from '../guards/roles.guard.js';


export const Auth = (role?: Role) => {
    if (role) {
        return applyDecorators(
            Roles(role),
            UseGuards(AuthGuard('jwt'), RolesGuard)
        );
    }

    return applyDecorators(UseGuards(AuthGuard('jwt')));
};


export function getAuthToken(req: Request) {
    const auth = req.headers.authorization;
    const bearer = auth && /^Bearer (.+)$/.exec(auth);
    if (bearer) return bearer[1];

    const header = req.get('X-Auth-Token');
    if (header) return header;

    return null;
}

export const AuthUser = createParamDecorator(
    async (_: unknown, ctx: ExecutionContext) => {
        const jwtService = new JwtService();
        const token = getAuthToken(ctx.switchToHttp().getRequest());
        if (!token) throw new UnauthorizedException();
        try {
            const payload = await jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            return payload;
        } catch {
            throw new UnauthorizedException();
        }
    },
);
