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
      <DialogContent className="flex flex-col max-w-[90vw] w-full h-[90vh] p-0 gap-0 overflow-hidden sm:rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          <div className="lg:col-span-1 h-full overflow-hidden border-r bg-background">
            <TripList
              list={rows}
              title="Trips in Streak"
              onBack={handleBack}
              onFocusOnTrip={handleFocusOnTrip}
              focusedTrip={focusedTrip}
            />
          </div>
          <div className="lg:col-span-2 h-full relative bg-muted/10">
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
