import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';
import FareCharts from './charts/FareCharts';
import DurationCharts from './charts/DurationCharts';
import DistanceCharts from './charts/DistanceCharts';
import SpeedCharts from './charts/SpeedCharts';
import WaitingTimeCharts from './charts/WaitingTimeCharts';
import ActivityCharts from './charts/ActivityCharts';
import TopCities from './TopCities';
import TripSummaryChart from './charts/TripSummaryChart';
import TripsByYearChart from './charts/TripsByYearChart';
import ProductTypesChart from './charts/ProductTypesChart';
import RideSummary from './RideSummary';
import FareDistanceScatterPlot from './FareDistanceScatterPlot';
import CostEfficiencyChart from './CostEfficiencyChart';
import CancellationBreakdownChart from './CancellationBreakdownChart';
import StreaksAndPauses from './charts/StreaksAndPauses';
import CumulativeStatsChart from './charts/CumulativeStatsChart';
import FareSplitStats from './FareSplitStats';

import MostTripsInADay from './MostTripsInADay';
import ConsecutiveTrips from './ConsecutiveTrips';
import LazySection from '../molecules/LazySection';

interface StatsProps {
  data: TripStats;
  onFocusOnTrip: (tripRow: CSVRow) => void;
  onFocusOnTrips: (tripRows: CSVRow[], title?: string) => void;
  onShowTripList: (type: string) => void;
  distanceUnit: DistanceUnit;
  rows: CSVRow[];
}

const Stats: React.FC<StatsProps> = ({
  data,
  onFocusOnTrip,
  onFocusOnTrips,
  onShowTripList,
  distanceUnit,
  rows,
}) => {
  const { totalFareByCurrency, longestStreak, longestGap, longestSuccessfulStreakBeforeCancellation, longestCancellationStreak, longestSuccessfulStreakBeforeDriverCancellation, longestDriverCancellationStreak, longestConsecutiveTripsChain, mostSuccessfulTripsInADay } = data;
  const currencies = Object.keys(totalFareByCurrency);
  const [activeCurrency, setActiveCurrency] = React.useState<string | null>(currencies.length > 0 ? currencies[0] : null);

  React.useEffect(() => {
    if (currencies.length > 0 && (!activeCurrency || !currencies.includes(activeCurrency))) {
      setActiveCurrency(currencies[0]);
    }
  }, [currencies, activeCurrency]);

  const productTypesCount = React.useMemo(() => {
    if (!rows || rows.length === 0) return 0;
    const types = new Set(rows.map(r => {
      const p = r.product_type || 'N/A';
      return p.toLowerCase().includes('auto') ? 'Auto' : p;
    }));
    return types.size;
  }, [rows]);

  const hasFareSplits = React.useMemo(() => {
    return rows.some(row => row.status?.toLowerCase() === 'fare_split');
  }, [rows]);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 overflow-y-auto pr-1 sm:pr-2">
      <RideSummary data={data} rows={rows} distanceUnit={distanceUnit} />
      <div className="grid grid-cols-1 gap-4">
        <LazySection id="fare-insights">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            {/* Fare Insights */}
            <CardHeader>
              <CardTitle>Fare Insights</CardTitle>
              <CardDescription>Insights into your spending, including fare distribution and yearly totals.</CardDescription>
            </CardHeader>
            <CardContent>
              <FareCharts
                data={data}
                rows={rows}
                activeCurrency={activeCurrency}
                setActiveCurrency={setActiveCurrency}
                onFocusOnTrips={onFocusOnTrips}
                distanceUnit={distanceUnit}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>
        <LazySection id="fare-distance">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Fare vs. Distance</CardTitle>
              <CardDescription>The relationship between trip cost and distance for the selected currency.</CardDescription>
            </CardHeader>
            <CardContent>
              <FareDistanceScatterPlot
                rows={rows}
                distanceUnit={distanceUnit}
                activeCurrency={activeCurrency}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>


        <LazySection id="trip-summary">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Trip Summary</CardTitle>
              <CardDescription>A breakdown of all trip requests by their final status.</CardDescription>
            </CardHeader>
            <CardContent>
              <TripSummaryChart
                data={data}
                onShowTripList={onShowTripList}
                rows={rows}
                distanceUnit={distanceUnit}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>


        <LazySection id="trips-by-year">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Completed Trips by Year</CardTitle>
              <CardDescription>The trend of your completed trips over the years.</CardDescription>
            </CardHeader>
            <CardContent>
              <TripsByYearChart data={data} rows={rows} distanceUnit={distanceUnit} activeCurrency={activeCurrency} />
            </CardContent>
          </Card>
        </LazySection>

        <LazySection id="duration">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Duration</CardTitle>
              <CardDescription>Analysis of how long your trips typically take.</CardDescription>
            </CardHeader>
            <CardContent>
              <DurationCharts
                data={data}
                rows={rows}
                onFocusOnTrips={onFocusOnTrips}
                onShowTripList={onShowTripList}
                distanceUnit={distanceUnit}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>
        <LazySection id="distance">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Distance</CardTitle>
              <CardDescription>A look at the distances of your trips.</CardDescription>
            </CardHeader>
            <CardContent>
              <DistanceCharts
                data={data}
                rows={rows}
                distanceUnit={distanceUnit}
                activeCurrency={activeCurrency}
                onFocusOnTrips={onFocusOnTrips}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>

        <LazySection id="speed">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Speed</CardTitle>
              <CardDescription>Distribution and records of your average trip speeds.</CardDescription>
            </CardHeader>
            <CardContent>
              <SpeedCharts
                data={data}
                rows={rows}
                distanceUnit={distanceUnit}
                activeCurrency={activeCurrency}
                onFocusOnTrips={onFocusOnTrips}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>
        <LazySection id="waiting-time">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Waiting Time</CardTitle>
              <CardDescription>Analysis of the time spent waiting for a driver to arrive.</CardDescription>
            </CardHeader>
            <CardContent>
              <WaitingTimeCharts
                data={data}
                rows={rows}
                onFocusOnTrips={onFocusOnTrips}
                onShowTripList={onShowTripList}
                distanceUnit={distanceUnit}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>
        <LazySection id="cumulative-stats">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Cumulative Stats Over Time</CardTitle>
              <CardDescription>Track the progression of your trips, distance, and spending over time. Click and drag to select a range.</CardDescription>
            </CardHeader>
            <CardContent>
              <CumulativeStatsChart rows={rows} distanceUnit={distanceUnit} activeCurrency={activeCurrency} convertDistance={data.convertDistance} />
            </CardContent>
          </Card>
        </LazySection>
        <LazySection id="cancellation-breakdown">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Cancellation Breakdown</CardTitle>
              <CardDescription>A look at when rider and driver cancellations occur throughout the day.</CardDescription>
            </CardHeader>
            <CardContent>
              <CancellationBreakdownChart
                rows={rows}
              />
            </CardContent>
          </Card>
        </LazySection>
        <LazySection id="ride-activity">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Ride Activity</CardTitle>
              <CardDescription>Patterns in your trip activity over time, by day, and by hour.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityCharts
                data={data}
                rows={rows}
                distanceUnit={distanceUnit}
                activeCurrency={activeCurrency}
              />
            </CardContent>
          </Card>
        </LazySection>
        <LazySection id="streaks">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Streaks</CardTitle>
            </CardHeader>
            <CardContent>
              <StreaksAndPauses
                onFocusOnTrip={onFocusOnTrip}
                longestStreak={longestStreak}
                longestGap={longestGap}
                longestSuccessfulStreakBeforeCancellation={longestSuccessfulStreakBeforeCancellation}
                longestCancellationStreak={longestCancellationStreak}
                longestSuccessfulStreakBeforeDriverCancellation={longestSuccessfulStreakBeforeDriverCancellation}
                longestDriverCancellationStreak={longestDriverCancellationStreak}
                longestConsecutiveTripsChain={longestConsecutiveTripsChain}
                mostTripsInADay={data.mostSuccessfulTripsInADay}
                rows={rows}
                distanceUnit={distanceUnit}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>

        <LazySection id="product-types">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Product Types ({productTypesCount})</CardTitle>
              <CardDescription>A breakdown of your trips by the type of service used.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTypesChart
                rows={rows}
                distanceUnit={distanceUnit}
                activeCurrency={activeCurrency}
                convertDistance={data.convertDistance}
              />
            </CardContent>
          </Card>
        </LazySection>
        <LazySection id="top-cities">
          <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Top Cities</CardTitle>
              <CardDescription>Discover which cities you travel in the most.</CardDescription>
            </CardHeader>
            <CardContent>
              <TopCities rows={rows} distanceUnit={distanceUnit} convertDistance={data.convertDistance} />
            </CardContent>
          </Card>
        </LazySection>
        {hasFareSplits && (
          <LazySection id="fare-split">
            <Card className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Fare Split Rides</CardTitle>
                <CardDescription>Summary of rides where the fare was split.</CardDescription>
              </CardHeader>
              <CardContent>
                <FareSplitStats rows={rows} />
              </CardContent>
            </Card>
          </LazySection>
        )}
      </div>
    </div>
  );
}

export default Stats;
