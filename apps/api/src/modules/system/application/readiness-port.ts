export type DependencyAvailability = 'available' | 'unavailable';

export interface ReadinessSnapshot {
  readonly availability: DependencyAvailability;
  readonly checkedAtMs: number | undefined;
}

export interface ReadinessPort {
  current(): ReadinessSnapshot;
  refresh(): Promise<ReadinessSnapshot>;
}
