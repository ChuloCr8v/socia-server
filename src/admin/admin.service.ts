import { Injectable } from '@nestjs/common';
import { LoginDto } from '../auth/auth.types.js';

@Injectable()
export class AdminService {

    async login(dto: LoginDto) {

    }
}
