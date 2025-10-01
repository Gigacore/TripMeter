import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';
import Map from './Map';
import TopStats from './TopStats';
import Sidebar from './Sidebar';
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
    <div className="main-content">
      <div className="map-and-stats-container map-main">
        <Map
          rows={rows}
          focusedTrip={focusedTrip}
          distanceUnit={distanceUnit}
          convertDistance={convertDistance}
        />
      </div>
      <TopStats tripData={tripData} distanceUnit={distanceUnit} />
      <div className="container">
        <Sidebar
          focusedTrip={focusedTrip}
          onShowAll={onShowAll}
          convertDistance={convertDistance}
          distanceUnit={distanceUnit}
          sidebarView={sidebarView}
          error={error}
          tripData={tripData}
          onFocusOnTrip={onFocusOnTrip}
          onShowTripList={onShowTripList}
          onFileSelect={onFileSelect}
          isProcessing={isProcessing}
          rows={rows}
          tripList={tripList}
          tripListTitle={tripListTitle}
          onBackToStats={onBackToStats}
        />
      </div>
    </div>
  );
};

export default MainView;