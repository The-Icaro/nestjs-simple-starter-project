import { Injectable, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import {
  HealthIndicator,
  CustomHttpHealthIndicator,
} from '../health/health-indicator.interface';
import { PrometheusService } from '../prometheus/prometheus.service';

@Injectable()
export class HealthService {
  private readonly monitoring: Array<HealthIndicator>;

  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prometheusService: PrometheusService,
    private url?: string,
    private type?: 'Hist' | 'Gauge',
  ) {
    this.monitoring = [
      new CustomHttpHealthIndicator(
        this.http,
        this.url,
        this.type ? this.type : 'Hist',
        this.prometheusService,
      ),
    ];
  }

  @HealthCheck()
  public async check(): Promise<HealthCheckResult | undefined> {
    return await this.health.check(
      this.monitoring.map((apiIndicator: HealthIndicator) => async () => {
        try {
          return await apiIndicator.isHealthy();
        } catch (error) {
          Logger.warn(error);
          return apiIndicator.reportUnhealthy();
        }
      }),
    );
  }
}
