import React from 'react';
import { ResponsiveContainer, Sankey, Tooltip, TooltipProps } from 'recharts';
import Stat from '../../atoms/Stat';
import SankeyNode from '../../atoms/SankeyNode';
import { TripStats } from '../../../hooks/useTripData';

interface TripSummaryChartProps {
  data: TripStats;
  onShowTripList: (type: string) => void;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { source, target, value } = payload[0].payload || {};
    return (
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{`${source.name} → ${target.name}`}</p>
        </div>
        <div className="text-slate-400">Trips</div>
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

const TripSummaryChart: React.FC<TripSummaryChartProps> = ({ data, onShowTripList }) => {
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

  const renderSankeyNode = React.useCallback(
    (props: any) => <SankeyNode {...props} onShowTripList={onShowTripList} />,
    [onShowTripList]
  );

  if (sankeyData.links.length === 0) return null;

  return (
    <div className="stats-group">
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={500}>
          <Sankey
            data={sankeyData}
            node={renderSankeyNode}
            nodePadding={50}
            margin={{ left: 100, right: 100, top: 5, bottom: 5 }}
            link={{ stroke: '#77c878' }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
        <Stat label="Total Requests" value={totalTrips} onClick={() => onShowTripList('all')} />
        <Stat label="Successful" value={successfulTrips} onClick={() => onShowTripList('successful')} />
        <Stat label="Rider Canceled" value={riderCanceledTrips} onClick={() => onShowTripList('rider_canceled')} />
        <Stat label="Driver Canceled" value={driverCanceledTrips} onClick={() => onShowTripList('driver_canceled')} />
        {unfulfilledTrips > 0 && <Stat label="Unfulfilled" value={unfulfilledTrips} onClick={() => onShowTripList('unfulfilled')} />}
      </div>
    </div>
  );
};

export default TripSummaryChart;