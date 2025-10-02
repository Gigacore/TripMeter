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
          <CardHeader>
            <CardTitle>Trip Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <TripSummaryChart data={data} onShowTripList={onShowTripList} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Trips by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <TripsByYearChart data={data} distanceUnit={distanceUnit} activeCurrency={activeCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fare Charts</CardTitle>
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
            <CardTitle>Duration Charts</CardTitle>
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
            <CardTitle>Waiting Time Charts</CardTitle>
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
            <CardTitle>Activity Charts</CardTitle>
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
            <CardTitle>Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <TopCities rows={rows} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;