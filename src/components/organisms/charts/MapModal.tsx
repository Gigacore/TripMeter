import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Map from '../Map';
import { CSVRow } from '@/services/csvParser';
import { DistanceUnit } from '@/App';
import { useState, useMemo } from 'react';
import { CheckCircle2, HelpCircle, ShieldX, UserX } from 'lucide-react';

import { cn } from '@/lib/utils';

interface MapModalProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
  isOpen: boolean;
  onClose: () => void;
}

const StatusIcon = ({ status }: { status: string }) => {
  const size = 18;
  const props = { size, className: 'flex-shrink-0' };
  switch (status) {
    case 'completed':
      return <CheckCircle2 {...props} className="text-green-500" />;
    case 'rider_canceled':
      return <UserX {...props} className="text-orange-500" />;
    case 'driver_canceled':
      return <ShieldX {...props} className="text-red-500" />;
    default:
      return <HelpCircle {...props} className="text-slate-500" />;
  }
}

const MapModal: React.FC<MapModalProps> = ({
  rows,
  distanceUnit,
  convertDistance,
  isOpen,
  onClose,
}) => {
  const getTripDate = (trip: CSVRow): Date | null => {
    const dateKeys = ['Request timestamp', 'Request Time', 'request_time_utc'];
    for (const key of dateKeys) {
      if (trip[key]) {
        const date = new Date(trip[key] as string);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    return null;
  };

  const mostRecentTrip = useMemo(() => {
    if (!isOpen || rows.length === 0) return null;

    return [...rows].sort((a, b) => {
      const dateA = getTripDate(a);
      const dateB = getTripDate(b);
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    })[0];
  }, [rows, isOpen]); // getTripDate is stable, no need to include

  const [selectedTrip, setSelectedTrip] = useState<CSVRow | null>(mostRecentTrip);

  if (!isOpen) {
    return null;
  }

  const handleSelectTrip = (trip: CSVRow) => {
    if (selectedTrip && selectedTrip['Request id'] === trip['Request id']) {
      setSelectedTrip(null); // Deselect if clicking the same trip
    } else {
      setSelectedTrip(trip);
    }
  };

  const getAddress = (row: CSVRow, type: 'from' | 'to'): string => {
    const fromKeys = ['From address', 'Begin Trip Address', 'Pickup address', 'begintrip_address'];
    const toKeys = ['To address', 'Dropoff Address', 'Dropoff address', 'dropoff_address'];
    const keys = type === 'from' ? fromKeys : toKeys;

    const key = keys.find(k => row[k]);
    return key ? String(row[key]) : 'N/A';
  };

  const getTripStatus = (status: unknown): string => {
    if (typeof status === 'string' && status.trim() !== '') {
      return status.trim().toLowerCase();
    }
    return 'unfulfilled';
  };

  const renderAddress = (row: CSVRow, type: 'from' | 'to'): string => {
    const address = getAddress(row, type);
    if (address === 'N/A') {
      const status = getTripStatus(row.status);
      if (status === 'rider_canceled' || status === 'driver_canceled') {
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }
    return address;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>All Trip Requests</DialogTitle>
        </DialogHeader>
        <div className="flex flex-row flex-grow gap-4 min-h-0">
          <div className="w-[380px] flex-shrink-0 flex flex-col border-r pr-4">
            <div className="overflow-y-auto flex-grow space-y-2 pt-2">
              <div className="text-sm font-medium text-muted-foreground px-2">
                All Requests ({rows.length})
              </div>
              <ul className="space-y-1">
                {rows.map((row) => (
                  <li
                    key={row['Request id']}
                    onClick={() => handleSelectTrip(row)}
                    className={cn("flex gap-3 p-2.5 cursor-pointer hover:bg-muted rounded-lg text-sm transition-colors", selectedTrip?.['Request id'] === row['Request id'] && "bg-muted")}
                  >
                    <div className="flex flex-col items-center h-full mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary/50" />
                      <div className="flex-grow w-px bg-border my-1" />
                      <div className="w-2 h-2 rounded-full bg-foreground/50" />
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-medium truncate leading-tight" title={renderAddress(row, 'from')}>{renderAddress(row, 'from')}</p>
                        <div title={getTripStatus(row.status).replace(/_/g, ' ')}>
                          <StatusIcon status={getTripStatus(row.status)} />
                        </div>
                      </div>
                      <p className="text-muted-foreground truncate mt-0.5" title={renderAddress(row, 'to')}>{renderAddress(row, 'to')}</p>
                      {getTripDate(row) && (
                        <p className="text-xs text-muted-foreground/80 mt-1.5">
                          {getTripDate(row)?.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex-grow">
            <Map rows={rows} focusedTrip={selectedTrip} distanceUnit={distanceUnit} convertDistance={convertDistance} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;