import React, { ChangeEvent } from 'react';
import { CSVRow } from '../../services/csvParser';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';
import FareCharts from './charts/FareCharts';
import DurationCharts from './charts/DurationCharts';
import DistanceCharts from './charts/DistanceCharts';
import SpeedCharts from './charts/SpeedCharts';
import WaitingTimeCharts from './charts/WaitingTimeCharts';
import ActivityCharts from './charts/ActivityCharts';
import { downloadKML } from '../../services/kmlService';
import TopCities from './TopCities';
import TripSummaryChart from './charts/TripSummaryChart';
import TripsByYearChart from './charts/TripsByYearChart';
import ProductTypesChart from './charts/ProductTypesChart';

interface StatsProps {
  data: TripStats;
  onFocusOnTrip: (tripRow: CSVRow) => void;
  onShowTripList: (type: string) => void;
  distanceUnit: DistanceUnit;
  onFileSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
  rows: CSVRow[];
}

const Stats: React.FC<StatsProps> = ({
  data,
  onFocusOnTrip,
  onShowTripList,
  distanceUnit,
  onFileSelect,
  isProcessing,
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

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const actionsEnabled = rows.length > 0 && !isProcessing;

  const handleDownloadKML = (which: 'both' | 'begin' | 'drop') => {
    downloadKML(rows, which);
  };

  return (
    <>
      <TopCities rows={rows} />
      <FareCharts
        data={data}
        rows={rows}
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
        onFocusOnTrip={onFocusOnTrip}
      />
      <TripSummaryChart data={data} onShowTripList={onShowTripList} />
      <TripsByYearChart data={data} />
      <DurationCharts
        data={data}
        rows={rows}
        onFocusOnTrip={onFocusOnTrip}
      />
      <DistanceCharts
        data={data}
        rows={rows}
        distanceUnit={distanceUnit}
        activeCurrency={activeCurrency}
        onFocusOnTrip={onFocusOnTrip}
      />
      <SpeedCharts
        data={data}
        rows={rows}
        distanceUnit={distanceUnit}
        activeCurrency={activeCurrency}
        onFocusOnTrip={onFocusOnTrip}
      />
      <WaitingTimeCharts
        data={data}
        rows={rows}
        onFocusOnTrip={onFocusOnTrip}
      />
      <ActivityCharts
        data={data}
        rows={rows}
      />
      <ProductTypesChart
        rows={rows}
        distanceUnit={distanceUnit}
        activeCurrency={activeCurrency}
      />
      <div className="mb-6">
        <div className="row flex gap-1.5">
          <button onClick={() => handleDownloadKML('both')} disabled={!actionsEnabled}>Download KML (both)</button>
          <button onClick={() => handleDownloadKML('begin')} disabled={!actionsEnabled}>Begintrip KML</button>
          <button onClick={() => handleDownloadKML('drop')} disabled={!actionsEnabled}>Dropoff KML</button>
        </div>
        <div className="footer">KML uses colored icons (green/red). Works in Google Earth / Maps.</div>
      </div>
      <div className="section">
        <input ref={fileInputRef} type="file" accept=".csv" onChange={onFileSelect} disabled={isProcessing} className="block" />
        <div className="footer">Select a new CSV file to replace the current data.</div>
      </div>
    </>
  );
};

export default Stats;