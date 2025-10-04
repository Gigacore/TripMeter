import React from 'react';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';
import Map from './Map';
import Footer from './Footer';
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
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] relative">
      <div className="flex-grow main-content grid gap-4 p-4 container mx-auto relative z-0">
        <Map
            rows={rows}
            focusedTrip={focusedTrip}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
          />
        <Stats data={tripData} onFocusOnTrip={onFocusOnTrip} onShowTripList={onShowTripList} distanceUnit={distanceUnit} rows={rows} />
        <div className="md:col-span-1 flex flex-col gap-4">
          {/* <Sidebar
            focusedTrip={focusedTrip}
            onShowAll={onShowAll}
            sidebarView={sidebarView}
            onFocusOnTrip={onFocusOnTrip}
            onShowTripList={onShowTripList}
            tripList={tripList}
            tripListTitle={tripListTitle}
            onBackToStats={onBackToStats}
          /> */}
        
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MainView;