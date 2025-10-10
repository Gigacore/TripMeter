import React, { useState } from 'react';
import { CSVRow } from '../../services/csvParser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Map from './Map';
import TripList from './TripList';
import { DistanceUnit } from '../../App';

interface RequestsMapModalProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
  children: React.ReactNode;
}

const RequestsMapModal: React.FC<RequestsMapModalProps> = ({ rows, distanceUnit, convertDistance, children }) => {
  const [focusedTrip, setFocusedTrip] = useState<CSVRow | null>(null);

  const handleFocusOnTrip = (trip: CSVRow) => {
    setFocusedTrip(trip);
  };

  const handleBack = () => {
    setFocusedTrip(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-7xl h-4/5">
        <DialogHeader>
          <DialogTitle>Trips Map</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          <div className="md:col-span-1 h-full overflow-y-auto">
            <TripList
              list={rows}
              title="All Trips"
              onBack={handleBack}
              onFocusOnTrip={handleFocusOnTrip}
            />
          </div>
          <div className="md:col-span-2 h-full">
            <Map
              rows={rows}
              focusedTrip={focusedTrip}
              distanceUnit={distanceUnit}
              convertDistance={convertDistance}
              locations={[]}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestsMapModal;
