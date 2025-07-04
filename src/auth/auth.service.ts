import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { bad } from 'src/utils/error.utils';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,

    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { auth: true },
        });

        if (!user || !(await argon.verify(user.auth?.passHash || '', password))) {
            bad('Invalid credentials');
        }

        return user;
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: this.jwt.sign(payload),
            user,
        };
    }

}

