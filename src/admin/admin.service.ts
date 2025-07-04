import { Injectable } from '@nestjs/common';
import { LoginDto } from 'src/auth/auth.types';

@Injectable()
export class AdminService {

    async login(dto: LoginDto) {
        
    }
}
