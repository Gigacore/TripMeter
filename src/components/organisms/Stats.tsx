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
import TopStats from './TopStats';
import FareDistanceScatterPlot from './FareDistanceScatterPlot';
import CostEfficiencyChart from './CostEfficiencyChart';
import CancellationBreakdownChart from './CancellationBreakdownChart';

interface StatsProps {
  data: TripStats;
  onFocusOnTrip: (tripRow: CSVRow) => void;
  onShowTripList: (type: string) => void;
  distanceUnit: DistanceUnit;
  rows: CSVRow[];
}

const Stats: React.FC<StatsProps> = ({
  data,
  onFocusOnTrip,
  onShowTripList,
  distanceUnit,
  rows,
}) => {
  const { totalFareByCurrency } = data;
  const currencies = Object.keys(totalFareByCurrency);
  const [activeCurrency, setActiveCurrency] = React.useState<string | null>(currencies.length > 0 ? currencies[0] : null);

  React.useEffect(() => {
    if (currencies.length > 0 && (!activeCurrency || !currencies.includes(activeCurrency))) {
      setActiveCurrency(currencies[0]);
    }
  }, [currencies, activeCurrency]);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-2">
      <TopStats tripData={data} distanceUnit={distanceUnit} />
      <div className="grid grid-cols-1 gap-4">
                <Card>
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
              onFocusOnTrip={onFocusOnTrip}
            />
          </CardContent>
        </Card>
        <Card>
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
        

        <Card>
          <CardHeader>
            <CardTitle>Trip Summary</CardTitle>
            <CardDescription>A breakdown of all trip requests by their final status.</CardDescription>
          </CardHeader>
          <CardContent>
            <TripSummaryChart data={data} onShowTripList={onShowTripList} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancellation Breakdown</CardTitle>
            <CardDescription>A look at when rider and driver cancellations occur throughout the day.</CardDescription>
          </CardHeader>
          <CardContent>
            <CancellationBreakdownChart rows={rows} />
          </CardContent>
        </Card>
                <Card>
          <CardHeader>
            <CardTitle>Completed Trips by Year</CardTitle>
            <CardDescription>The trend of your completed trips over the years.</CardDescription>
          </CardHeader>
          <CardContent>
            <TripsByYearChart data={data} distanceUnit={distanceUnit} activeCurrency={activeCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Duration Charts</CardTitle>
            <CardDescription>Analysis of how long your trips typically take.</CardDescription>
          </CardHeader>
          <CardContent>
            <DurationCharts
              data={data}
              rows={rows}
              onFocusOnTrip={onFocusOnTrip}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distance Charts</CardTitle>
            <CardDescription>A look at the distances of your trips and cost efficiency.</CardDescription>
          </CardHeader>
          <CardContent>
            <DistanceCharts
              data={data}
              rows={rows}
              distanceUnit={distanceUnit}
              activeCurrency={activeCurrency}
              onFocusOnTrip={onFocusOnTrip}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Speed Charts</CardTitle>
            <CardDescription>Distribution and records of your average trip speeds.</CardDescription>
          </CardHeader>
          <CardContent>
            <SpeedCharts
              data={data}
              rows={rows}
              distanceUnit={distanceUnit}
              activeCurrency={activeCurrency}
              onFocusOnTrip={onFocusOnTrip}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Waiting Time Distribution</CardTitle>
            <CardDescription>Analysis of the time spent waiting for a driver to arrive.</CardDescription>
          </CardHeader>
          <CardContent>
            <WaitingTimeCharts
              data={data}
              rows={rows}
              onFocusOnTrip={onFocusOnTrip}
            />
          </CardContent>
        </Card>
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Product Types</CardTitle>
            <CardDescription>A breakdown of your trips by the type of service used.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductTypesChart
              rows={rows}
              distanceUnit={distanceUnit}
              activeCurrency={activeCurrency}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ride Efficiency by Product</CardTitle>
            <CardDescription>A comparison of distance per unit of currency across different service types.</CardDescription>
          </CardHeader>
          <CardContent>
            <CostEfficiencyChart
              rows={rows}
              distanceUnit={distanceUnit}
              activeCurrency={activeCurrency}
              convertDistance={data.convertDistance}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
            <CardDescription>Discover which cities you travel in the most.</CardDescription>
          </CardHeader>
          <CardContent>
            <TopCities rows={rows} distanceUnit={distanceUnit} convertDistance={data.convertDistance} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;