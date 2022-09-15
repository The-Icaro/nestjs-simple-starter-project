import { Injectable } from '@nestjs/common';
import { HealthService } from 'src/health/health.service';
import { PrometheusService } from 'src/prometheus/prometheus.service';

@Injectable()
export class MetricsService {
  constructor(
    private prometheusService: PrometheusService,
    private healthService: HealthService,
  ) {}

  public get allMetrics(): Promise<string> {
    this.healthService.check();
    return this.prometheusService.allMetrics;
  }
}
