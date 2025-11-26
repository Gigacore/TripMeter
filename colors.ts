/**
 * Standardized color mapping for different data categories within the application.
 * This ensures visual consistency across all charts, graphs, and data visualizations.
 *
 * Based on the color system defined in gemini.md.
 * All colors are from the default Tailwind CSS palette.
 */
export const CHART_COLORS = {
  /**
   * For monetary values like fare, cost, price, and earnings.
   * Tailwind: `green-500`
   */
  monetary: '#22c55e',
  /**
   * For cancellations, errors, or negative events.
   * Tailwind: `red-600`
   */
  cancellation: '#dc2626',
  /**
   * For metrics related to distance (miles/km).
   * Tailwind: `blue-500`
   */
  distance: '#3b82f6',
  /**
   * For time-based data like trip duration or wait time.
   * Tailwind: `amber-500`
   */
  duration: '#f59e0b',
  /**
   * For surge pricing or other alert-like metrics.
   * Tailwind: `orange-500`
   */
  surge: '#f97316',
  /**
   * For general counts, like number of trips.
   * Tailwind: `indigo-500`
   */
  count: '#6366f1',
  /**
   * For ratings.
   * Tailwind: `yellow-400`
   */
  rating: '#facc15',
  /**
   * For efficiency metrics like MPG or fuel consumption.
   * Tailwind: `teal-500`
   */
  efficiency: '#14b8a6',
  /**
   * A neutral default for uncategorized or general data.
   * Tailwind: `gray-400`
   */
  default: '#9ca3af',
} as const;

export type ChartColor = keyof typeof CHART_COLORS;