import { Controller } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NicheService } from './niche.service';

@Controller('niche')
export class NicheController {

    constructor(private niche: NicheService) {
    }

}
