import React from 'react';
import { ResponsiveContainer, Sankey, Tooltip, TooltipProps } from 'recharts';
import { Map } from 'lucide-react';
import Stat from '../../atoms/Stat';
import SankeyNode from '../../atoms/SankeyNode';
import { TripStats } from '../../../hooks/useTripData';
import RequestsMapModal from '../RequestsMapModal';
import { DistanceUnit } from '../../../App';
import { CSVRow } from '../../../services/csvParser';

interface TripSummaryChartProps {
  data: TripStats;
  onShowTripList: (type: string) => void;
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  convertDistance: (miles: number) => number;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { source, target, value } = payload[0].payload || {};
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`${source.name} → ${target.name}`}</p>
        </div>
        <div className="text-muted-foreground">Trips</div>
        <div className="font-medium text-lg">{value.toLocaleString()}</div>
      </div>
    );
  }
  return null;
};

const statusColors: { [key: string]: string } = {
  'Successful': '#22c55e', // green-500
  'Rider Canceled': '#f97316', // orange-500
  'Driver Canceled': '#ef4444', // red-500
  'Unfulfilled': '#64748b', // slate-500
};

const TripSummaryChart: React.FC<TripSummaryChartProps> = ({ data, onShowTripList, rows, distanceUnit, convertDistance }) => {
  const { totalTrips, successfulTrips, riderCanceledTrips, driverCanceledTrips } = data;

  const unfulfilledTrips = totalTrips - successfulTrips - riderCanceledTrips - driverCanceledTrips;

  const sankeyData = {
    nodes: [
      { name: 'Total Requests' },
      { name: 'Successful' },
      { name: 'Rider Canceled' },
      { name: 'Driver Canceled' },
      { name: 'Unfulfilled' },
    ],
    links: [
      { source: 0, target: 1, value: successfulTrips, color: statusColors['Successful'] },
      { source: 0, target: 2, value: riderCanceledTrips, color: statusColors['Rider Canceled'] },
      { source: 0, target: 3, value: driverCanceledTrips, color: statusColors['Driver Canceled'] },
      { source: 0, target: 4, value: unfulfilledTrips, color: statusColors['Unfulfilled'] },
    ].filter(link => link.value > 0),
  };

  if (sankeyData.links.length === 0) return null;

  return (
    <div className="stats-group">
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={500}>
          <Sankey
            data={sankeyData}
            node={<SankeyNode onShowTripList={onShowTripList} />}
            nodePadding={50}
            margin={{ left: 100, right: 100, top: 5, bottom: 5 }}
            link={{ stroke: '#77c878' }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
        <RequestsMapModal
          rows={rows}
          distanceUnit={distanceUnit}
          convertDistance={convertDistance}
          title="All Trip Requests"
        >
          <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
            <Stat
              label="Total Requests"
              value={totalTrips}
              valueIcon={<Map size={16} />}
            />
          </div>
        </RequestsMapModal>

        <RequestsMapModal
          rows={rows.filter(r => r.status?.toLowerCase() === 'completed')}
          distanceUnit={distanceUnit}
          convertDistance={convertDistance}
          title="Successful Trips"
        >
          <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
            <Stat
              label="Successful"
              value={successfulTrips}
              valueIcon={<Map size={16} />}
            />
          </div>
        </RequestsMapModal>

        <RequestsMapModal
          rows={rows.filter(r => r.status?.toLowerCase() === 'rider_canceled' || r.status?.toLowerCase() === 'canceled')}
          distanceUnit={distanceUnit}
          convertDistance={convertDistance}
          title="Rider Canceled Trips"
        >
          <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
            <Stat
              label="Rider Canceled"
              value={riderCanceledTrips}
              valueIcon={<Map size={16} />}
            />
          </div>
        </RequestsMapModal>

        <RequestsMapModal
          rows={rows.filter(r => r.status?.toLowerCase() === 'driver_canceled')}
          distanceUnit={distanceUnit}
          convertDistance={convertDistance}
          title="Driver Canceled Trips"
        >
          <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
            <Stat
              label="Driver Canceled"
              value={driverCanceledTrips}
              valueIcon={<Map size={16} />}
            />
          </div>
        </RequestsMapModal>

        {unfulfilledTrips > 0 && (
          <RequestsMapModal
            rows={rows.filter(r => !['completed', 'rider_canceled', 'canceled', 'driver_canceled'].includes(r.status?.toLowerCase() || ''))}
            distanceUnit={distanceUnit}
            convertDistance={convertDistance}
            title="Unfulfilled Requests"
          >
            <div className="cursor-pointer hover:bg-muted transition-colors duration-200 rounded-lg">
              <Stat
                label="Unfulfilled"
                value={unfulfilledTrips}
                valueIcon={<Map size={16} />}
              />
            </div>
          </RequestsMapModal>
        )}
      </div>

    </div>
  );
};

export default TripSummaryChart;