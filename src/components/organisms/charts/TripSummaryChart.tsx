import React from 'react';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import Stat from '../../atoms/Stat';
import SankeyNode from '../../atoms/SankeyNode';
import { TripStats } from '../../../hooks/useTripData';

interface TripSummaryChartProps {
  data: TripStats;
  onShowTripList: (type: string) => void;
}

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
      { source: 0, target: 1, value: successfulTrips },
      { source: 0, target: 2, value: riderCanceledTrips },
      { source:0, target: 3, value: driverCanceledTrips },
      { source: 0, target: 4, value: unfulfilledTrips },
    ].filter(link => link.value > 0),
  };

  const renderSankeyNode = React.useCallback(
    (props: any) => <SankeyNode {...props} onShowTripList={onShowTripList} />,
    [onShowTripList]
  );

  if (sankeyData.links.length === 0) return null;

  return (
    <div className="stats-group mb-6">
      <h3>Trip Summary</h3>
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
      <div className="stats-grid five-col mt-4">
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