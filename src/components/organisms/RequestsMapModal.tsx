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
  children?: React.ReactNode;
  title?: string;
  renderTripStat?: (trip: CSVRow) => React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RequestsMapModal: React.FC<RequestsMapModalProps> = ({
  rows,
  distanceUnit,
  convertDistance,
  children,
  title = "Trips",
  renderTripStat,
  isOpen,
  onOpenChange
}) => {
  const [focusedTrip, setFocusedTrip] = useState<CSVRow | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleFocusOnTrip = (trip: CSVRow) => {
    setFocusedTrip(trip);
  };

  const handleClose = () => {
    setOpen(false);
    setFocusedTrip(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="flex flex-col max-w-full md:max-w-[90vw] w-screen md:w-full h-screen md:h-[90vh] p-0 gap-0 overflow-hidden sm:rounded-xl">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-hidden md:border-r bg-background order-2 md:order-1">
            <TripList
              list={rows}
              title={title}
              onBack={handleClose}
              onFocusOnTrip={handleFocusOnTrip}
              focusedTrip={focusedTrip}
              renderTripStat={renderTripStat}
            />
          </div>
          <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-muted/10 order-1 md:order-2">
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
