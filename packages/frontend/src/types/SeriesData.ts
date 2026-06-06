// Mirrors packages/api/src/models/SeriesData.js
// Generic wrapper for time-bucketed history/stats endpoints.

export interface SeriesData<T> {
  timestamp: string | null
  data: T | null
}
