import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import {
  NewMetricRegister,
  PrometheusHistogram,
  PrometheusService,
} from '../prometheus/prometheus.service';
import { Logger } from '@nestjs/common';
import { Gauge } from 'prom-client';

const TAG = 'HealthCheck';

export abstract class AbstractHealthIndicator extends HealthIndicator {
  public abstract name: string;
  public callMetrics: any;

  protected abstract description: string;
  protected abstract readonly prometheusService: PrometheusService | undefined;
  protected readonly labelNames = ['status'];
  protected readonly buckets = [1];
  protected stateIsConnected = false;

  private histogramsRegistered = false;
  private gaugesRegistered = false;
  private gauge: Gauge<string> | undefined;

  public abstract isHealthy(): Promise<HealthIndicatorResult>;

  public get customHistogramsRegistered(): boolean {
    return this.histogramsRegistered;
  }

  public get customGaugesRegistered(): boolean {
    return this.gaugesRegistered;
  }

  protected registerNewMetrics(): void {
    if (!this.prometheusService) return;

    Logger.log('New Histrogram Metric: ' + this.name, TAG, true);

    this.histogramsRegistered = true;
    const newMetricRegister: NewMetricRegister = {
      name: this.name,
      description: this.description,
      labelNames: this.labelNames,
      buckets: this.buckets,
    };

    const histogram: PrometheusHistogram =
      this.prometheusService.registerNewMetrics(newMetricRegister);
    this.callMetrics = histogram.startTimer();
  }

  protected registerGauges(): void {
    if (!this.prometheusService) return;

    Logger.log('New Gauge Metric: ' + this.name, TAG, true);
    this.gaugesRegistered = true;
    this.gauge = this.prometheusService.registerGauge(
      this.name,
      this.description,
    );
  }

  protected isDefined(value: string | undefined): boolean {
    return !!value;
  }

  public updatePrometheusData(isConnected: boolean): void {
    if (this.stateIsConnected !== isConnected) {
      if (isConnected) {
        Logger.log(this.name + ' is available', TAG, true);
      }

      this.stateIsConnected = isConnected;

      if (this.histogramsRegistered) {
        this.callMetrics({ status: this.stateIsConnected ? 1 : 0 });
      }

      if (this.gaugesRegistered) {
        this.gauge?.set(this.stateIsConnected ? 1 : 0);
      }
    }
  }

  public reportUnhealthy(): HealthIndicatorResult {
    this.updatePrometheusData(false);
    return this.getStatus(this.name, false);
  }
}
