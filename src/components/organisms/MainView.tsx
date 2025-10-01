import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';
import Map from './Map';
import Sidebar from './Sidebar';
import Stats from './Stats';
import { TripStats } from '../../hooks/useTripData';

interface MainViewProps {
  rows: CSVRow[];
  focusedTrip: CSVRow | null;
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
  tripData: TripStats;
  sidebarView: 'stats' | 'tripList';
  error: string;
  isProcessing: boolean;
  tripList: CSVRow[];
  tripListTitle: string;
  onShowAll: () => void;
  onFocusOnTrip: (tripRow: CSVRow) => void;
  onShowTripList: (type: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBackToStats: () => void;
}

const MainView: React.FC<MainViewProps> = ({
  rows,
  focusedTrip,
  distanceUnit,
  convertDistance,
  tripData,
  sidebarView,
  error,
  isProcessing,
  tripList,
  tripListTitle,
  onShowAll,
  onFocusOnTrip,
  onShowTripList,
  onFileSelect,
  onBackToStats,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 p-4">
      <Map
          rows={rows}
          focusedTrip={focusedTrip}
          distanceUnit={distanceUnit}
          convertDistance={convertDistance}
        />
      <Stats data={tripData} onFocusOnTrip={onFocusOnTrip} onShowTripList={onShowTripList} distanceUnit={distanceUnit} rows={rows} />
    </div>
  );
};

export default MainView;