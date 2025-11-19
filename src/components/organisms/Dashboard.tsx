import React, { useRef } from 'react';
import { CSVRow } from '../../services/csvParser';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';
import DashboardNav from '../molecules/DashboardNav';
import Stats from './Stats';
import { useScrollSpy } from '../../hooks/useScrollSpy';

interface DashboardProps {
  data: TripStats;
  onFocusOnTrip: (tripRow: CSVRow) => void;
  onFocusOnTrips: (tripRows: CSVRow[], title?: string) => void;
  onShowTripList: (type: string) => void;
  distanceUnit: DistanceUnit;
  rows: CSVRow[];
}

const sections = [
  { id: 'fare-insights', title: 'Fare Insights' },
  { id: 'fare-vs-distance', title: 'Fare vs. Distance' },
  { id: 'trip-summary', title: 'Trip Summary' },
  { id: 'trips-by-year', title: 'Trips by Year' },
  { id: 'duration', title: 'Duration' },
  { id: 'distance', title: 'Distance' },
  { id: 'speed', title: 'Speed' },
  { id: 'waiting-time', title: 'Waiting Time' },
  { id: 'cumulative-stats', title: 'Cumulative Stats' },
  { id: 'cancellation-breakdown', title: 'Cancellation Breakdown' },
  { id: 'ride-activity', title: 'Ride Activity' },
  { id: 'streaks', title: 'Streaks' },
  { id: 'product-types', title: 'Product Types' },
  { id: 'top-cities', title: 'Top Cities' },
  { id: 'location-hotspots', title: 'Location Hotspots' },
  { id: 'fare-split-rides', title: 'Fare Split Rides' },
];
const sectionIds = sections.map(s => s.id);

const Dashboard: React.FC<DashboardProps> = (props) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeSection = useScrollSpy(sectionIds, scrollContainerRef, 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      <div className="hidden lg:block">
        <DashboardNav activeSection={activeSection} sections={sections} />
      </div>
      <div ref={scrollContainerRef} className="overflow-y-auto h-[calc(100vh-10rem)] pr-4">
        <Stats {...props} />
      </div>
    </div>
  );
};

export default Dashboard;
