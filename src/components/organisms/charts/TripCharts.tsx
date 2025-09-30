import React from 'react';
import { ResponsiveContainer, Sankey, Tooltip, Treemap, AreaChart, CartesianGrid, XAxis, YAxis, Area } from 'recharts';
import Stat from '../../atoms/Stat';
import SankeyNode from '../../atoms/SankeyNode';
import CustomizedContent from '../../atoms/CustomizedContent';
import { CSVRow } from '../../../services/csvParser';
import { TripStats } from '../../../hooks/useTripData';

interface TripChartsProps {
  data: TripStats;
  rows: CSVRow[];
  onShowTripList: (type: string) => void;
}

const TripCharts: React.FC<TripChartsProps> = ({
  data,
  rows,
  onShowTripList,
}) => {
  const {
    totalTrips,
    successfulTrips,
    riderCanceledTrips,
    driverCanceledTrips,
    tripsByYear,
  } = data;

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
      { source: 0, target: 3, value: driverCanceledTrips },
      { source: 0, target: 4, value: unfulfilledTrips },
    ].filter(link => link.value > 0),
  };

  const productTypeData = React.useMemo(() => {
    if (!rows || rows.length === 0) {
      return [];
    }
    const counts = rows.reduce((acc: { [key: string]: number }, trip) => {
      const product = trip.product_type || 'N/A';
      acc[product] = (acc[product] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, size]) => ({ name: `${name} (${size})`, size }));
  }, [rows]);

  const treemapColors = React.useMemo(() => ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'], []);
  const renderTreemapContent = React.useCallback((props: any) => <CustomizedContent {...props} colors={treemapColors} />, [treemapColors]);

  const renderSankeyNode = React.useCallback(
    (props: any) => <SankeyNode {...props} onShowTripList={onShowTripList} />,
    [onShowTripList]
  );

  return (
    <>
      <div className="section">
        {sankeyData.links.length > 0 && (
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
        )}

        {tripsByYear.length > 0 && (
          <div className="stats-group">
            <h3>Trips by Year</h3>
            <p className="hint -mt-2 mb-4">Total completed trips each year.</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={tripsByYear}
                margin={{
                  top: 5,
                  right: 20,
                  left: 10,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fillOpacity={1} fill="url(#colorTrips)" name="Trips" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {productTypeData.length > 0 && (
          <div className="stats-group">
            <h3>Product Types</h3>
            <ResponsiveContainer width="100%" height={700}>
              <Treemap
                data={productTypeData}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                isAnimationActive={false}
                content={renderTreemapContent}
              >
                <Tooltip formatter={(value: number, name: string, props: any) => [props.payload.name.split(' (')[0], `Count: ${value}`]} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
};

export default TripCharts;