import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  public allMetrics(): Promise<string> {
    return this.metricsService.allMetrics;
  }
}
