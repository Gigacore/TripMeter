import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Map from '../Map';
import { CSVRow } from '@/services/csvParser';
import { DistanceUnit } from '@/App';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MapModalProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
  isOpen: boolean;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({
  rows,
  distanceUnit,
  convertDistance,
  isOpen,
  onClose,
}) => {
  const [selectedTrip, setSelectedTrip] = useState<CSVRow | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSelectTrip = (trip: CSVRow) => {
    setSelectedTrip(trip);
  };

  const handleShowAll = () => {
    setSelectedTrip(null);
  };

  const getAddress = (row: CSVRow, type: 'from' | 'to'): string => {
    const fromKeys = ['From address', 'Begin Trip Address', 'Pickup address', 'begintrip_address'];
    const toKeys = ['To address', 'Dropoff Address', 'Dropoff address', 'dropoff_address'];
    const keys = type === 'from' ? fromKeys : toKeys;

    const key = keys.find(k => row[k]);
    return key ? String(row[key]) : 'N/A';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>All Trip Requests</DialogTitle>
        </DialogHeader>
        <div className="flex flex-row flex-grow gap-4 min-h-0">
          <div className="w-1/3 flex flex-col border-r pr-4">
            <Button onClick={handleShowAll} variant="outline" className="mb-2">Show All</Button>
            <div className="overflow-y-auto flex-grow space-y-2">
              <div className="text-sm font-medium text-muted-foreground px-2">
                All Requests ({rows.length})
              </div>
              <ul>
                {rows.map((row) => (
                  <li
                    key={row['Request id']}
                    onClick={() => handleSelectTrip(row)}
                    className={cn(
                      "p-2 cursor-pointer hover:bg-muted rounded-md text-sm",
                      selectedTrip?.['Request id'] === row['Request id'] && "bg-muted"
                    )}
                  >
                    <p className="font-semibold truncate">{getAddress(row, 'from')}</p>
                    <p className="text-muted-foreground truncate">to {getAddress(row, 'to')}</p>
                    <p className="text-xs text-muted-foreground">{row['Request id']}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="w-2/3 flex-grow">
            <Map rows={rows} focusedTrip={selectedTrip} distanceUnit={distanceUnit} convertDistance={convertDistance} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;