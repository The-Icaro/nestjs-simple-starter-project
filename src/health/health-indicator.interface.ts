import { HealthIndicatorResult, HttpHealthIndicator } from '@nestjs/terminus';
import { PrometheusService } from 'src/prometheus/prometheus.service';
import { AbstractHealthIndicator } from './abstract-health.indicator';

export interface HealthIndicator {
  name: string;
  callMetrics: any;
  customMetricsRegistered?: boolean;
  customGaugesRegistered?: boolean;

  updatePrometheusData(isConnected: boolean): void;
  isHealthy(): Promise<HealthIndicatorResult>;
  reportUnhealthy(): HealthIndicatorResult;
}

export class CustomHttpHealthIndicator
  extends AbstractHealthIndicator
  implements HealthIndicator
{
  public readonly name = 'NestJS';
  protected readonly description: string;
  protected readonly prometheusService: PrometheusService | undefined;

  private readonly url: string;
  private readonly httpHealthIndicator: HttpHealthIndicator;

  constructor(
    httpHealthIndicator: HttpHealthIndicator,
    url: string | undefined,
    type: 'Hist' | 'Gauge',
    prometheusService?: PrometheusService,
  ) {
    super();
    this.httpHealthIndicator = httpHealthIndicator;
    this.prometheusService = prometheusService;
    this.url = url || '';
    type === 'Hist' ? this.registerNewMetrics() : this.registerGauges();
  }

  public async isHealthy(): Promise<HealthIndicatorResult> {
    if (!this.isDefined(this.url)) return;
    const result: Promise<HealthIndicatorResult> =
      this.httpHealthIndicator.pingCheck(this.name, this.url);
    this.updatePrometheusData(true);
    return result;
  }
}
