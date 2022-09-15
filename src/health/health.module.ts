import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

import { TerminusModule } from '@nestjs/terminus';

@Module({
  controllers: [HealthController, TerminusModule],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
