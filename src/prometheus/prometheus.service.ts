import { Injectable } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Histogram, Gauge } from 'prom-client';

export type PrometheusHistogram = Histogram<string>;

interface MapHistogram {
  [key: string]: Histogram<string>;
}

interface MapGauge {
  [key: string]: Gauge<string>;
}

export interface NewMetricRegister {
  name: string;
  description: string;
  labelNames: Array<string>;
  buckets: Array<number>;
}

@Injectable()
export class PrometheusService {
  private readonly PROMETHEUS_APP_TITLE = 'PrometheusAPP';
  private readonly PROMETHEUS_APP_PREFIX = 'PrometheusPrefix_';
  private readonly registry: Registry;
  private monitoredMetricsHistogram: MapHistogram = {};
  private monitoredMetricsGauges: MapGauge = {};

  constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({ app: this.PROMETHEUS_APP_TITLE });
    collectDefaultMetrics({
      register: this.registry,
      prefix: this.PROMETHEUS_APP_PREFIX,
    });
  }

  public get allMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  public registerNewMetrics(
    newMetricRegister: NewMetricRegister,
  ): Histogram<string> {
    if (this.monitoredMetricsHistogram[newMetricRegister.name] === undefined) {
      const histogram = new Histogram({
        name: newMetricRegister.name,
        help: newMetricRegister.description,
        labelNames: newMetricRegister.labelNames,
        buckets: newMetricRegister.buckets,
      });
      this.registry.registerMetric(histogram);
      this.monitoredMetricsHistogram[newMetricRegister.name] = histogram;
    }

    return this.monitoredMetricsHistogram[newMetricRegister.name];
  }

  public registerGauge(name: string, description: string): Gauge<string> {
    if (this.monitoredMetricsGauges[name] === undefined) {
      const gauge = (this.monitoredMetricsGauges[name] = new Gauge({
        name: this.PROMETHEUS_APP_PREFIX + name,
        help: description,
      }));
      this.registry.registerMetric(gauge);
      this.monitoredMetricsGauges[name] = gauge;
    }
    return this.monitoredMetricsGauges[name];
  }

  public removeMetricByName(name: string): void {
    return this.registry.removeSingleMetric(name);
  }

  public clearAllMetrics(): void {
    this.registry.resetMetrics();
    return this.registry.clear();
  }
}
