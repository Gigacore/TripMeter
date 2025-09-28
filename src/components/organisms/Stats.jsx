import React from 'react';
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from 'recharts';
import Stat from '../atoms/Stat';
import { formatDuration, formatDurationWithSeconds } from '../../utils/formatters';
import { downloadKML } from '../../services/kmlService';

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

  // Custom node for Sankey to allow clicking
  const SankeyNode = ({ x, y, width, height, index, payload }) => {
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

  return (
    <>
      <div className="section">
        {sankeyData.links.length > 0 && (
          <div className="stats-group">
            <h3>Trip Summary</h3>
            <ResponsiveContainer width="100%" height={700}>
              <Sankey
                data={sankeyData}
                node={<SankeyNode />}
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
              {currencies.length > 1 && (
                <div className="tabs vertical-tabs" style={{ flex: '0 0 20%' }}>
                  {currencies.map(currency => (
                    <button
                      key={currency}
                      className={`tab-button ${activeCurrency === currency ? 'active' : ''}`}
                      onClick={() => setActiveCurrency(currency)}
                    >
                      {currency} - Total: {totalFareByCurrency[currency].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </button>
                  ))}
                </div>
              )}
              {activeCurrency && (
                <div className="stats-grid" style={{ flex: '1 1 80%' }}>
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
              )}
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
          <h3 style={{ marginTop: '16px' }}>Waiting Time</h3>
          <div className="stats-grid">
            <Stat label="Total" value={formatDuration(totalWaitingTime, true)} />
            <Stat label="Average" value={formatDurationWithSeconds(avgWaitingTime)} />
            <Stat label="Longest" value={formatDurationWithSeconds(longestWaitingTime)} onClick={() => onFocusOnTrip(longestWaitingTimeRow)} />
            <Stat label="Shortest" value={formatDurationWithSeconds(shortestWaitingTime)} onClick={() => onFocusOnTrip(shortestWaitingTimeRow)} />
          </div>
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
        </div>

        <div className="stats-group">
          <h3>Speed</h3>
          <div className="stats-grid">
            <Stat label="Avg. Speed" value={avgSpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} />
            <Stat label="Fastest Avg. Speed" value={fastestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => onFocusOnTrip(fastestTripBySpeedRow)} />
            <Stat label="Slowest Avg. Speed" value={slowestTripBySpeed.toFixed(2)} unit={distanceUnit === 'miles' ? 'mph' : 'km/h'} onClick={() => onFocusOnTrip(slowestTripBySpeedRow)} />
            {Object.entries(costPerDurationByCurrency).map(([currency, amount]) => (
              <Stat
                key={currency}
                label="Cost"
                unit={currency}
                value={amount.toFixed(2)}
              />
            ))}
          </div>
        </div>
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

export default Stats;