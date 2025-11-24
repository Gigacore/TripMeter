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
  title: string;
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
  title,
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
      <DialogContent className="max-w-6xl md:h-[90vh] h-screen w-screen md:w-auto max-w-full md:max-w-6xl flex flex-col bg-white/90 dark:bg-black/90 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row flex-grow gap-6 min-h-0 pt-4">
          <div className="w-full md:w-[380px] flex-shrink-0 flex flex-col md:border-r border-gray-200/50 dark:border-gray-800/50 md:pr-6 order-2 md:order-1">
            <div className="overflow-y-auto flex-grow space-y-2 pr-2 custom-scrollbar">
              <div className="text-sm font-medium text-muted-foreground px-2 pb-2 sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-10">
                All Requests ({rows.length})
              </div>
              <ul className="space-y-2">
                {rows.map((row, index) => (
                  <li
                    key={`${row['Request id'] || 'row'}-${index}`}
                    onClick={() => handleSelectTrip(row)}
                    className={cn(
                      "group flex gap-3 p-3 cursor-pointer rounded-xl text-sm transition-all duration-200 border border-transparent",
                      selectedTrip?.['Request id'] === row['Request id']
                        ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 shadow-sm"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-800"
                    )}
                  >
                    <div className="flex flex-col items-center h-full mt-1">
                      <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", selectedTrip?.['Request id'] === row['Request id'] ? "bg-purple-600 dark:bg-purple-400" : "bg-gray-300 dark:bg-gray-600 group-hover:bg-purple-400 dark:group-hover:bg-purple-500")} />
                      <div className="flex-grow w-px bg-gray-200 dark:bg-gray-800 my-1" />
                      <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", selectedTrip?.['Request id'] === row['Request id'] ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-500 dark:group-hover:bg-gray-400")} />
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-start gap-2">
                        <p className={cn("font-medium truncate leading-tight transition-colors", selectedTrip?.['Request id'] === row['Request id'] ? "text-purple-900 dark:text-purple-100" : "text-foreground")} title={renderAddress(row, 'from')}>{renderAddress(row, 'from')}</p>
                        <div title={getTripStatus(row.status).replace(/_/g, ' ')}>
                          <StatusIcon status={getTripStatus(row.status)} />
                        </div>
                      </div>
                      <p className="text-muted-foreground truncate mt-1" title={renderAddress(row, 'to')}>{renderAddress(row, 'to')}</p>
                      {getTripDate(row) && (
                        <p className="text-xs text-muted-foreground/80 mt-2 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                          {getTripDate(row)?.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex-grow rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-inner order-1 md:order-2 h-[50vh] md:h-auto">
            <Map rows={rows} focusedTrip={selectedTrip} distanceUnit={distanceUnit} convertDistance={convertDistance} locations={[]} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;