interface MetricSample {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

const buffer: MetricSample[] = [];

export function recordMetric(sample: Omit<MetricSample, "timestamp">) {
  buffer.push({ ...sample, timestamp: Date.now() });
  if (buffer.length > 200) {
    buffer.shift();
  }
}

export function getMetrics(filter?: (sample: MetricSample) => boolean) {
  return buffer.filter((sample) => (filter ? filter(sample) : true));
}
