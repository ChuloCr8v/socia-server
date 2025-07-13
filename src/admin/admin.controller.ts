import { Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service.js';

@Controller('admin')
export class AdminController {
    constructor(private admin: AdminService) { }

}
