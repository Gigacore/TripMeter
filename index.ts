export type DataCategory =
  | 'monetary'
  | 'cancellation'
  | 'distance'
  | 'duration'
  | 'count'
  | 'efficiency'
  | 'general';

export interface TooltipPayload {
  name: string;
  value: string | number;
  dataKey: string;
  // Recharts payload can have more properties, add them as needed
}