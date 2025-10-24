import { Module } from '@nestjs/common';
import { NicheService } from './niche.service';
import { NicheController } from './niche.controller';

@Module({
  providers: [NicheService],
  controllers: [NicheController]
})
export class NicheModule {}
