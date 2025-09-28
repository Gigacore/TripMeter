import React from 'react';
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle, Treemap, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Stat from '../atoms/Stat';
import { formatDuration, formatDurationWithSeconds } from '../../utils/formatters';
import { downloadKML } from '../../services/kmlService';

const SankeyNode = ({ x, y, width, height, index, payload, onShowTripList }) => {
  const isClickable = payload.name !== 'Total Requests';
  const handleClick = () => {
    if (!isClickable) return;
    const typeMap = {
      'Successful': 'successful',
      'Rider Canceled': 'rider_canceled',
      'Driver Canceled': 'driver_canceled',
      'Unfulfilled': 'unfulfilled',
    };
    onShowTripList(typeMap[payload.name]);
  };

  return (
    <Layer key={`CustomNode${index}`}>
      <Rectangle x={x} y={y} width={width} height={height} fill="#666" fillOpacity="1" onClick={handleClick} cursor={isClickable ? 'pointer' : 'default'} />
      <text textAnchor="middle" x={x + width / 2} y={y + height / 2} fontSize="14" fill="#fff" strokeWidth="0">
        {payload.name} ({payload.value})
      </text>
    </Layer>
  );
};

const Stats = ({
  data,
  onFocusOnTrip,
  onShowTripList,
  distanceUnit,
  onFileSelect,
  isProcessing,
  rows,
}) => {
  const {
    totalTrips,
    successfulTrips,
    riderCanceledTrips,
    driverCanceledTrips,
    totalFareByCurrency,
    avgFareByCurrency,
    lowestFareByCurrency,
    highestFareByCurrency,
    totalTripDuration,
    avgTripDuration,
    longestTrip,
    longestTripRow,
    shortestTrip,
    shortestTripRow,
    totalWaitingTime,
    avgWaitingTime,
    longestWaitingTime,
    longestWaitingTimeRow,
    shortestWaitingTime,
    shortestWaitingTimeRow,
    totalCompletedDistance,
    longestTripByDist,
    longestTripByDistRow,
    shortestTripByDist,
    shortestTripByDistRow,
    costPerDistanceByCurrency,
    avgSpeed,
    fastestTripBySpeed,
    fastestTripBySpeedRow,
    slowestTripBySpeed,
    slowestTripBySpeedRow,
    costPerDurationByCurrency,
  } = data;

  const currencies = Object.keys(totalFareByCurrency);
  const [activeCurrency, setActiveCurrency] = React.useState(currencies.length > 0 ? currencies[0] : null);

  React.useEffect(() => {
    if (currencies.length > 0 && !currencies.includes(activeCurrency)) {
      setActiveCurrency(currencies[0]);
    }
  }, [currencies, activeCurrency]);

  const fileInputRef = React.useRef();

  const actionsEnabled = rows.length > 0 && !isProcessing;

  const handleDownloadKML = (which) => {
    downloadKML(rows, which);
  };

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
    const counts = rows.reduce((acc, trip) => {
      const product = trip.product_type || 'N/A';
      acc[product] = (acc[product] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, size]) => ({ name: `${name} (${size})`, size }));
  }, [rows]);

  const renderSankeyNode = React.useCallback(
    (props) => <SankeyNode {...props} onShowTripList={onShowTripList} />,
    [onShowTripList]
  );

  const fareDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0 || !activeCurrency) return [];
    const fares = rows
      .filter(r => r.fare_currency === activeCurrency && r.fare_amount && parseFloat(r.fare_amount) > 0)
      .map(r => parseFloat(r.fare_amount));
    if (fares.length === 0) return [];

    const maxFare = Math.max(...fares);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxFare / bucketCount);
    if (bucketSize === 0) return [];

    const buckets = Array.from({ length: bucketCount }, () => 0);
    fares.forEach(fare => {
      const bucketIndex = Math.min(Math.floor(fare / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize}`,
      count,
    }));
  }, [rows, activeCurrency]);

  const durationDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const durations = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.begin_trip_time && r.dropoff_time)
      .map(r => (new Date(r.dropoff_time) - new Date(r.begin_trip_time)) / (1000 * 60)) // in minutes
      .filter(d => d > 0);
    if (durations.length === 0) return [];

    const maxDuration = Math.max(...durations);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxDuration / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    durations.forEach(duration => {
      const bucketIndex = Math.min(Math.floor(duration / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize} min`,
      count,
    }));
  }, [rows]);

  const waitingTimeDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const waitingTimes = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.request_time && r.begin_trip_time)
      .map(r => (new Date(r.begin_trip_time) - new Date(r.request_time)) / (1000 * 60)) // in minutes
      .filter(d => d > 0);
    if (waitingTimes.length === 0) return [];

    const maxWaitingTime = Math.max(...waitingTimes);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxWaitingTime / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    waitingTimes.forEach(waitingTime => {
      const bucketIndex = Math.min(Math.floor(waitingTime / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize} min`,
      count,
    }));
  }, [rows]);

  const distanceDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const distances = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.distance && parseFloat(r.distance) > 0)
      .map(r => parseFloat(r.distance));
    if (distances.length === 0) return [];

    const maxDistance = Math.max(...distances);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxDistance / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    distances.forEach(distance => {
      const bucketIndex = Math.min(Math.floor(distance / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${(i * bucketSize).toFixed(1)}-${((i + 1) * bucketSize).toFixed(1)} ${distanceUnit}`,
      count,
    }));
  }, [rows, distanceUnit]);

  const speedDistributionData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const speeds = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.distance && parseFloat(r.distance) > 0 && r.begin_trip_time && r.dropoff_time)
      .map(r => {
        const durationHours = (new Date(r.dropoff_time) - new Date(r.begin_trip_time)) / (1000 * 60 * 60);
        if (durationHours <= 0) return null;
        return parseFloat(r.distance) / durationHours;
      })
      .filter(speed => speed !== null && speed > 0);
    if (speeds.length === 0) return [];

    const maxSpeed = Math.max(...speeds);
    const bucketCount = 10;
    const bucketSize = Math.ceil(maxSpeed / bucketCount) || 1;

    const buckets = Array.from({ length: bucketCount }, () => 0);
    speeds.forEach(speed => {
      const bucketIndex = Math.min(Math.floor(speed / bucketSize), bucketCount - 1);
      buckets[bucketIndex]++;
    });

    return buckets.map((count, i) => ({
      name: `${i * bucketSize}-${(i + 1) * bucketSize}`,
      count,
    }));
  }, [rows]);

  const treemapColors = React.useMemo(() => ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'], []);
  const renderTreemapContent = React.useCallback((props) => <CustomizedContent {...props} colors={treemapColors} />, [treemapColors]);

  return (
    <>
      <div className="section">
        {sankeyData.links.length > 0 && (
          <div className="stats-group">
            <h3>Trip Summary</h3>
            <ResponsiveContainer width="100%" height={700}>
              <Sankey
                data={sankeyData}
                node={renderSankeyNode}
                nodePadding={50}
                margin={{
                left: 200,
                  right: 200,
                  top: 100,
                  bottom: 100
                }}
                link={{ stroke: '#77c878' }}
              >
                <Tooltip />
              </Sankey>
            </ResponsiveContainer>
          </div>
        )}
        <div className="stats-group">
          <div className="stats-grid">
            <Stat label="Total Requests" value={totalTrips} onClick={() => onShowTripList('all')} />
            <Stat label="Successful" value={successfulTrips} onClick={() => onShowTripList('successful')} />
            <Stat label="Rider Canceled" value={riderCanceledTrips} onClick={() => onShowTripList('rider_canceled')} />
            <Stat label="Driver Canceled" value={driverCanceledTrips} onClick={() => onShowTripList('driver_canceled')} />
            {unfulfilledTrips > 0 && <Stat label="Unfulfilled" value={unfulfilledTrips} onClick={() => onShowTripList('unfulfilled')} />}
          </div>
        </div>

        {currencies.length > 0 && (
          <div className="stats-group">
            <h3>Fare</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Redesigned vertical tab UI for Fare section */}
              <div style={{ display: 'flex', width: '100%', minHeight: 220 }}>
                <div style={{ width: 180, borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
                  {currencies.map((currency, idx) => (
                    <button
                      key={currency}
                      onClick={() => setActiveCurrency(currency)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '18px 12px', border: 'none', outline: 'none', background: activeCurrency === currency ? '#fff' : 'transparent', fontWeight: activeCurrency === currency ? 600 : 400, cursor: 'pointer', borderBottom: idx !== currencies.length - 1 ? '1px solid #eee' : 'none', position: 'relative', minHeight: 72
                      }}
                    >
                      <span style={{ width: 32, height: 32, background: '#f0f0f0', borderRadius: 6, display: 'inline-block', marginRight: 8 }} />
                      <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>{currency}</span>
                        <span style={{ fontSize: 13, fontWeight: 400 }}>Total: {totalFareByCurrency[currency].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </span>
                      {activeCurrency === currency && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#bbb', borderRadius: '12px 0 0 12px' }} />}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, padding: '32px 24px', display: 'flex', alignItems: 'flex-start', flexDirection: 'column', gap: 24 }}>
                  <div style={{ width: '100%' }}>
                    {currencies.length === 1 && (
                      <Stat
                        label="Total Fare"
                        unit={activeCurrency}
                        value={totalFareByCurrency[activeCurrency].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      />
                    )}
                    <Stat
                      label="Avg. Fare"
                      unit={activeCurrency}
                      value={avgFareByCurrency[activeCurrency].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    />
                    {lowestFareByCurrency[activeCurrency] && (
                      <Stat
                        label="Lowest Fare"
                        unit={activeCurrency}
                        value={lowestFareByCurrency[activeCurrency].amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        onClick={() => onFocusOnTrip(lowestFareByCurrency[activeCurrency].row)}
                      />
                    )}
                    {highestFareByCurrency[activeCurrency] && (
                      <Stat
                        label="Highest Fare"
                        unit={activeCurrency}
                        value={highestFareByCurrency[activeCurrency].amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        onClick={() => onFocusOnTrip(highestFareByCurrency[activeCurrency].row)}
                      />
                    )}
                  </div>
                  <div style={{ width: '100%' }}>
                    {fareDistributionData.length > 0 && (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={fareDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" name="Number of Trips" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="stats-group">
          <h3>Ride Duration</h3>
          <div className="stats-grid">
            <Stat label="Total" value={formatDuration(totalTripDuration, true)} />
            <Stat label="Average" value={formatDurationWithSeconds(avgTripDuration)} />
            <Stat label="Longest" value={formatDurationWithSeconds(longestTrip)} onClick={() => onFocusOnTrip(longestTripRow)} />
            <Stat label="Shortest" value={formatDurationWithSeconds(shortestTrip)} onClick={() => onFocusOnTrip(shortestTripRow)} />
          </div>
          {durationDistributionData.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={durationDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <h3 style={{ marginTop: '16px' }}>Waiting Time</h3>
          <div className="stats-grid">
            <Stat label="Total" value={formatDuration(totalWaitingTime, true)} />
            <Stat label="Average" value={formatDurationWithSeconds(avgWaitingTime)} />
            <Stat label="Longest" value={formatDurationWithSeconds(longestWaitingTime)} onClick={() => onFocusOnTrip(longestWaitingTimeRow)} />
            <Stat label="Shortest" value={formatDurationWithSeconds(shortestWaitingTime)} onClick={() => onFocusOnTrip(shortestWaitingTimeRow)} />
          </div>
          {waitingTimeDistributionData.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waitingTimeDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="stats-group">
          <h3>Distance</h3>
          <div className="stats-grid">
            <Stat label="Total" value={totalCompletedDistance.toFixed(2)} unit={distanceUnit} />
            <Stat label="Longest" value={longestTripByDist.toFixed(2)} unit={distanceUnit} onClick={() => onFocusOnTrip(longestTripByDistRow)} />
            <Stat label="Shortest" value={shortestTripByDist.toFixed(2)} unit={distanceUnit} onClick={() => onFocusOnTrip(shortestTripByDistRow)} />
            {Object.entries(costPerDistanceByCurrency).map(([currency, amount]) => (
              <Stat
                key={currency}
                label={`Cost per ${distanceUnit}`}
                unit={`${currency}/${distanceUnit}`}
                value={amount.toFixed(2)}
              />
            ))}
          </div>
          {distanceDistributionData.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distanceDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff8042" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="stats-group">
          <h3>Speed</h3>
          <div className="stats-grid">
            <Stat label="Avg. Speed" value={avgSpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
            <Stat label="Fastest Avg. Speed" value={fastestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => onFocusOnTrip(fastestTripBySpeedRow)} />
            <Stat label="Slowest Avg. Speed" value={slowestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => onFocusOnTrip(slowestTripBySpeedRow)} />
            {Object.entries(costPerDurationByCurrency).map(([currency, amount]) =>
              <Stat
                key={currency}
                label="Cost"
                unit={currency}
                value={amount.toFixed(2)}
              />
            )}
            <div style={{ marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={speedDistributionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8dd1e1" name="Number of Trips" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

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
                <Tooltip formatter={(value, name, props) => [props.payload.name.split(' (')[0], `Count: ${value}`]} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="section">
        <div className="row" style={{ gap: '6px' }}>
          <button onClick={() => handleDownloadKML('both')} disabled={!actionsEnabled}>Download KML (both)</button>
          <button onClick={() => handleDownloadKML('begin')} disabled={!actionsEnabled}>Begintrip KML</button>
          <button onClick={() => handleDownloadKML('drop')} disabled={!actionsEnabled}>Dropoff KML</button>
        </div>
        <div className="footer">KML uses colored icons (green/red). Works in Google Earth / Maps.</div>
      </div>

      <div className="section">
        <input ref={fileInputRef} type="file" accept=".csv" onChange={onFileSelect} disabled={isProcessing} />
        <div className="footer">Select a new CSV file to replace the current data.</div>
      </div>
    </>
  );
};

const CustomizedContent = ({ root, depth, x, y, width, height, index, colors, name }) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }} />
      {depth === 1 ? <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>{name}</text> : null}
    </g>
  );
};

export default Stats;