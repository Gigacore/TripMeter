import React from 'react';
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

  const fileInputRef = React.useRef();

  const actionsEnabled = rows.length > 0 && !isProcessing;

  const handleDownloadKML = (which) => {
    downloadKML(rows, which);
  };

  return (
    <>
      <div className="section">
        <div className="stats-group">
          <h3>Trip Summary</h3>
          <div className="stats-grid">
            <Stat label="Total Requests" value={totalTrips} onClick={() => onShowTripList('all')} />
            <Stat label="Successful" value={successfulTrips} onClick={() => onShowTripList('successful')} />
            <Stat label="Rider Canceled" value={riderCanceledTrips} onClick={() => onShowTripList('rider_canceled')} />
            <Stat label="Driver Canceled" value={driverCanceledTrips} onClick={() => onShowTripList('driver_canceled')} />
          </div>
        </div>

        {Object.keys(totalFareByCurrency).length > 0 && (
          <div className="stats-group">
            <h3>Fare</h3>
            <div className="stats-grid">
              {Object.entries(totalFareByCurrency).map(([currency, amount]) => (
                <Stat
                  key={currency}
                  label="Total Fare"
                  unit={currency}
                  value={amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                />
              ))}
              {Object.entries(avgFareByCurrency).map(([currency, amount]) => (
                <Stat
                  key={currency}
                  label="Avg. Fare"
                  unit={currency}
                  value={amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                />
              ))}
              {Object.entries(lowestFareByCurrency).map(([currency, data]) => (
                <Stat
                  key={`${currency}-lowest`}
                  label="Lowest Fare"
                  unit={currency}
                  value={data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onClick={() => onFocusOnTrip(data.row)}
                />
              ))}
              {Object.entries(highestFareByCurrency).map(([currency, data]) => (
                <Stat
                  key={`${currency}-highest`}
                  label="Highest Fare"
                  unit={currency}
                  value={data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  onClick={() => onFocusOnTrip(data.row)}
                />
              ))}
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