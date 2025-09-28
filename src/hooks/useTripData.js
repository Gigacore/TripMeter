import { useState, useEffect } from 'react';
import { KM_PER_MILE } from '../constants';

export const useTripData = (rows, distanceUnit) => {
  const [stats, setStats] = useState({
    beginCount: 0,
    dropoffCount: 0,
    avgSpeed: 0,
    longestTrip: 0,
    longestTripByDist: 0,
    shortestTrip: 0,
    shortestTripByDist: 0,
    longestTripRow: null,
    totalWaitingTime: 0,
    avgWaitingTime: 0,
    shortestWaitingTime: 0,
    longestWaitingTime: 0,
    shortestWaitingTimeRow: null,
    longestWaitingTimeRow: null,
    fastestTripBySpeed: 0,
    fastestTripBySpeedRow: null,
    slowestTripBySpeed: 0,
    slowestTripBySpeedRow: null,
    longestTripByDistRow: null,
    shortestTripRow: null,
    shortestTripByDistRow: null,
    avgTripDuration: 0,
    totalTripDuration: 0,
    totalCompletedDistance: 0,
    totalTrips: 0,
    successfulTrips: 0,
    riderCanceledTrips: 0,
    driverCanceledTrips: 0,
    unfulfilledTrips: 0,
    avgFareByCurrency: {},
    lowestFareByCurrency: {},
    highestFareByCurrency: {},
    totalFareByCurrency: {},
    costPerDistanceByCurrency: {},
    costPerDurationByCurrency: {},
  });

  const convertDistance = (miles) => {
    return distanceUnit === 'km' ? miles * KM_PER_MILE : miles;
  };

  useEffect(() => {
    if (rows.length > 0) {
      let currentTotalDistance = 0;
      let totalDurationMinutes = 0;
      let totalDurationHours = 0;
      const tripsWithDuration = [];
      const tripsWithDistance = [];
      const tripsWithSpeed = [];
      const tripsWithWaitingTime = [];
      let completedCount = 0;
      let riderCanceledCount = 0;
      let driverCanceledCount = 0;
      const fareByCurrency = {};
      const fareCountByCurrency = {};
      const localLowestFare = {};
      const localHighestFare = {};

      rows.forEach(r => {
        const status = r.status?.toLowerCase();
        if (status === 'completed') {
          completedCount++;
          const distanceMiles = parseFloat(r.distance);
          const beginTime = new Date(r.begin_trip_time);
          const dropoffTime = new Date(r.dropoff_time);
          const requestTime = new Date(r.request_time);

          if (requestTime.getTime() && beginTime.getTime() && beginTime > requestTime) {
            const waitingMinutes = (beginTime - requestTime) / (1000 * 60);
            if (isFinite(waitingMinutes)) {
              tripsWithWaitingTime.push({ waitingTime: waitingMinutes, row: r });
            }
          }
          if (!isNaN(distanceMiles) && beginTime.getTime() && dropoffTime.getTime() && dropoffTime > beginTime) {
            const durationHours = (dropoffTime - beginTime) / (1000 * 60 * 60);
            if (durationHours > 0) {
              if (distanceMiles > 0) {
                totalDurationMinutes += durationHours * 60;
                currentTotalDistance += convertDistance(distanceMiles);
                totalDurationHours += durationHours;
                const speed = convertDistance(distanceMiles) / durationHours;
                if (isFinite(speed)) {
                  tripsWithSpeed.push({ speed, row: r });
                }
              }
              tripsWithDuration.push({ duration: durationHours, row: r });
            }
            if (distanceMiles > 0) {
              tripsWithDistance.push({ distance: convertDistance(distanceMiles), row: r });
            }
          }

          const fare = parseFloat(r.fare_amount);
          const currency = r.fare_currency;
          if (currency && !isNaN(fare)) {
            if (!fareByCurrency[currency]) {
              fareByCurrency[currency] = 0;
              fareCountByCurrency[currency] = 0;
              localLowestFare[currency] = { amount: fare, row: r };
              localHighestFare[currency] = { amount: fare, row: r };
            }
            fareByCurrency[currency] += fare;
            fareCountByCurrency[currency]++;

            if (fare < localLowestFare[currency].amount) {
              localLowestFare[currency] = { amount: fare, row: r };
            }
            if (fare > localHighestFare[currency].amount) {
              localHighestFare[currency] = { amount: fare, row: r };
            }
          }
        } else if (status === 'rider_canceled') {
          riderCanceledCount++;
        } else if (status === 'driver_canceled') {
          driverCanceledCount++;
        }
      });

      const canceledCount = riderCanceledCount + driverCanceledCount;
      const unfulfilledCount = rows.length - completedCount - canceledCount;

      const avgFares = {};
      for (const currency in fareByCurrency) {
        if (fareCountByCurrency[currency] > 0) {
          avgFares[currency] = fareByCurrency[currency] / fareCountByCurrency[currency];
        }
      }

      const localCostPerDistance = {};
      const localCostPerDuration = {};

      for (const currency in fareByCurrency) {
        if (currentTotalDistance > 0) {
          localCostPerDistance[currency] = fareByCurrency[currency] / currentTotalDistance;
        }
        if (totalDurationMinutes > 0) {
          localCostPerDuration[currency] = fareByCurrency[currency] / totalDurationMinutes;
        }
      }

      const newStats = {
        totalTrips: rows.length,
        successfulTrips: completedCount,
        riderCanceledTrips: riderCanceledCount,
        driverCanceledTrips: driverCanceledCount,
        unfulfilledTrips: unfulfilledCount,
        totalFareByCurrency: fareByCurrency,
        lowestFareByCurrency: localLowestFare,
        highestFareByCurrency: localHighestFare,
        avgFareByCurrency: avgFares,
        costPerDistanceByCurrency: localCostPerDistance,
        costPerDurationByCurrency: localCostPerDuration,
        totalCompletedDistance: currentTotalDistance,
        avgSpeed: totalDurationHours > 0 ? currentTotalDistance / totalDurationHours : 0,
        totalTripDuration: totalDurationMinutes,
      };

      if (tripsWithDuration.length > 0) {
        tripsWithDuration.sort((a, b) => a.duration - b.duration);
        const shortest = tripsWithDuration[0];
        const longest = tripsWithDuration[tripsWithDuration.length - 1];
        const totalDuration = tripsWithDuration.reduce((sum, trip) => sum + trip.duration * 60, 0);
        newStats.avgTripDuration = totalDuration / tripsWithDuration.length;
        newStats.longestTrip = longest.duration * 60;
        newStats.shortestTrip = shortest.duration * 60;
        newStats.longestTripRow = longest.row;
        newStats.shortestTripRow = shortest.row;
      }

      if (tripsWithWaitingTime.length > 0) {
        tripsWithWaitingTime.sort((a, b) => a.waitingTime - b.waitingTime);
        const shortest = tripsWithWaitingTime[0];
        const longest = tripsWithWaitingTime[tripsWithWaitingTime.length - 1];
        const totalTime = tripsWithWaitingTime.reduce((sum, trip) => sum + trip.waitingTime, 0);
        newStats.totalWaitingTime = totalTime;
        newStats.avgWaitingTime = totalTime / tripsWithWaitingTime.length;
        newStats.shortestWaitingTime = shortest.waitingTime;
        newStats.shortestWaitingTimeRow = shortest.row;
        newStats.longestWaitingTime = longest.waitingTime;
        newStats.longestWaitingTimeRow = longest.row;
      }

      if (tripsWithDistance.length > 0) {
        tripsWithDistance.sort((a, b) => a.distance - b.distance);
        newStats.shortestTripByDist = tripsWithDistance[0].distance;
        newStats.shortestTripByDistRow = tripsWithDistance[0].row;
        newStats.longestTripByDist = tripsWithDistance[tripsWithDistance.length - 1].distance;
        newStats.longestTripByDistRow = tripsWithDistance[tripsWithDistance.length - 1].row;
      }

      if (tripsWithSpeed.length > 0) {
        tripsWithSpeed.sort((a, b) => a.speed - b.speed);
        newStats.slowestTripBySpeed = tripsWithSpeed[0].speed;
        newStats.slowestTripBySpeedRow = tripsWithSpeed[0].row;
        newStats.fastestTripBySpeed = tripsWithSpeed[tripsWithSpeed.length - 1].speed;
        newStats.fastestTripBySpeedRow = tripsWithSpeed[tripsWithSpeed.length - 1].row;
      }

      setStats(newStats);
    }
  }, [rows, distanceUnit]);

  return stats;
};