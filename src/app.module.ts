import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrometheusModule } from './prometheus/prometheus.module';

@Module({
  imports: [HealthModule, PrometheusModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
