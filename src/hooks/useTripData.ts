import { useState, useEffect } from 'react';
import { KM_PER_MILE } from '../constants';
import { CSVRow } from '../services/csvParser';
import { DistanceUnit } from '../App';

export interface TripStats {
  beginCount: number;
  dropoffCount: number;
  avgSpeed: number;
  longestTrip: number;
  longestTripByDist: number;
  shortestTrip: number;
  shortestTripByDist: number;
  longestTripRow: CSVRow | null;
  totalWaitingTime: number;
  avgWaitingTime: number;
  shortestWaitingTime: number;
  longestWaitingTime: number;
  shortestWaitingTimeRow: CSVRow | null;
  longestWaitingTimeRow: CSVRow | null;
  waitingLongerThanTripCount: number;
  totalWaitingTimeForLongerWaits: number;
  totalRidingTimeForLongerWaits: number;
  fastestTripBySpeed: number;
  fastestTripBySpeedRow: CSVRow | null;
  slowestTripBySpeed: number;
  slowestTripBySpeedRow: CSVRow | null;
  longestTripByDistRow: CSVRow | null;
  shortestTripRow: CSVRow | null;
  shortestTripByDistRow: CSVRow | null;
  avgTripDuration: number;
  totalTripDuration: number;
  totalCompletedDistance: number;
  avgCompletedDistance: number;
  totalTrips: number;
  successfulTrips: number;
  riderCanceledTrips: number;
  driverCanceledTrips: number;
  canceledTrips: number;
  unfulfilledTrips: number;
  avgFareByCurrency: { [key: string]: number };
  lowestFareByCurrency: { [key: string]: { amount: number; row: CSVRow } };
  highestFareByCurrency: { [key: string]: { amount: number; row: CSVRow } };
  totalFareByCurrency: { [key: string]: number };
  costPerDistanceByCurrency: { [key: string]: number };
  costPerDurationByCurrency: { [key: string]: number };
  avgCostPerDistanceByYear: { [currency: string]: { year: number; cost: number }[] };
  totalFareByYear: { [currency: string]: { year: number; total: number }[] };
  longestStreak: {
    days: number;
    startDate: number | null;
    endDate: number | null;
  };
  longestGap: {
    days: number;
    startDate: number | null;
    endDate: number | null;
  };
  tripsByYear: { year: number; count: number }[];
}

export const useTripData = (rows: CSVRow[], distanceUnit: DistanceUnit): TripStats => {
  const [stats, setStats] = useState<TripStats>({
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
    waitingLongerThanTripCount: 0,
    totalWaitingTimeForLongerWaits: 0,
    totalRidingTimeForLongerWaits: 0,
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
    avgCompletedDistance: 0,
    totalTrips: 0,
    successfulTrips: 0,
    riderCanceledTrips: 0,
    driverCanceledTrips: 0,
    canceledTrips: 0,
    unfulfilledTrips: 0,
    avgFareByCurrency: {},
    lowestFareByCurrency: {},
    highestFareByCurrency: {},
    totalFareByCurrency: {},
    costPerDistanceByCurrency: {},
    costPerDurationByCurrency: {},
    avgCostPerDistanceByYear: {},
    totalFareByYear: {},
    longestStreak: { days: 0, startDate: null, endDate: null },
    longestGap: { days: 0, startDate: null, endDate: null },
    tripsByYear: [],
  });

  const convertDistance = (miles: number) => {
    return distanceUnit === 'km' ? miles * KM_PER_MILE : miles;
  };

  useEffect(() => {
    if (rows.length > 0) {
      let currentTotalDistance = 0;
      let totalDurationMinutes = 0;
      let totalDurationHours = 0;
      const tripsWithDuration: { duration: number; row: CSVRow }[] = [];
      const tripsWithDistance: { distance: number; row: CSVRow }[] = [];
      const tripsWithSpeed: { speed: number; row: CSVRow }[] = [];
      const tripsWithWaitingTime: { waitingTime: number; row: CSVRow }[] = [];
      let completedCount = 0;
      let riderCanceledCount = 0;
      let driverCanceledCount = 0;
      const fareByCurrency: { [key: string]: number } = {};
      let waitingLongerThanTripCount = 0;
      let totalWaitingTimeForLongerWaits = 0;
      let totalRidingTimeForLongerWaits = 0;
      const fareCountByCurrency: { [key: string]: number } = {};
      const localLowestFare: { [key: string]: { amount: number, row: CSVRow } } = {};
      const localHighestFare: { [key: string]: { amount: number, row: CSVRow } } = {};
      const completedTripDates: Date[] = [];
      const yearlyDistanceByCurrency: { [currency: string]: { [year: number]: number } } = {};
      const yearlyFareByCurrency: { [currency: string]: { [year: number]: number } } = {};
      const tripsByYear: { [year: number]: number } = {};

      rows.forEach((r: CSVRow) => {
        const status = r.status?.toLowerCase();
        if (status === 'completed') {
          completedCount++;

          const distanceMiles = parseFloat(r.distance);
          const beginTime = new Date(r.begin_trip_time);
          const dropoffTime = new Date(r.dropoff_time);
          const requestTime = new Date(r.request_time);
          const year = requestTime.getFullYear();

          if (requestTime.getTime()) {
            if (!isNaN(year)) {
              if (!tripsByYear[year]) {
                tripsByYear[year] = 0;
              }
              tripsByYear[year]++;
            }
            completedTripDates.push(requestTime);
          }

          let waitingMinutes: number | undefined;
          if (requestTime.getTime() && beginTime.getTime() && beginTime > requestTime) {
            waitingMinutes = (beginTime.getTime() - requestTime.getTime()) / (1000 * 60);
            if (isFinite(waitingMinutes)) {
              tripsWithWaitingTime.push({ waitingTime: waitingMinutes, row: r });
            }
          }

          let durationMinutes: number | undefined;
          if (!isNaN(distanceMiles) && beginTime.getTime() && dropoffTime.getTime() && dropoffTime > beginTime) {
            const durationHours = (dropoffTime.getTime() - beginTime.getTime()) / (1000 * 60 * 60);
            durationMinutes = durationHours * 60;
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

          if (waitingMinutes !== undefined && durationMinutes !== undefined && waitingMinutes > durationMinutes) {
            waitingLongerThanTripCount++;
            totalWaitingTimeForLongerWaits += waitingMinutes;
            totalRidingTimeForLongerWaits += durationMinutes;
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

            if (!isNaN(year) && !isNaN(distanceMiles) && distanceMiles > 0) {
              if (!yearlyFareByCurrency[currency]) {
                yearlyFareByCurrency[currency] = {};
                yearlyDistanceByCurrency[currency] = {};
              }
              if (!yearlyFareByCurrency[currency][year]) {
                yearlyFareByCurrency[currency][year] = 0;
                yearlyDistanceByCurrency[currency][year] = 0;
              }
              yearlyFareByCurrency[currency][year] += fare;
              yearlyDistanceByCurrency[currency][year] += convertDistance(distanceMiles);
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

      const avgFares: { [key: string]: number } = {};
      for (const currency in fareByCurrency) {
        if (fareCountByCurrency[currency] > 0) {
          avgFares[currency] = fareByCurrency[currency] / fareCountByCurrency[currency];
        }
      }

      const localCostPerDistance: { [key: string]: number } = {};
      const localCostPerDuration: { [key: string]: number } = {};

      for (const currency in fareByCurrency) {
        if (currentTotalDistance > 0) {
          localCostPerDistance[currency] = fareByCurrency[currency] / currentTotalDistance;
        }
        if (totalDurationMinutes > 0) {
          localCostPerDuration[currency] = fareByCurrency[currency] / totalDurationMinutes;
        }
      }

      const avgCostPerDistanceByYear: { [currency: string]: { year: number; cost: number }[] } = {};
      for (const currency in yearlyFareByCurrency) {
        avgCostPerDistanceByYear[currency] = [];
        const yearlyData = yearlyFareByCurrency[currency];
        const years = Object.keys(yearlyData).map(Number).sort((a, b) => a - b);

        for (const year of years) {
          const totalDistanceForYear = yearlyDistanceByCurrency[currency][year];
          if (totalDistanceForYear > 0) {
            avgCostPerDistanceByYear[currency].push({ year, cost: yearlyData[year] / totalDistanceForYear });
          }
        }
      }

      const totalFareByYear: { [currency: string]: { year: number; total: number }[] } = {};
      for (const currency in yearlyFareByCurrency) {
        totalFareByYear[currency] = [];
        const yearlyData = yearlyFareByCurrency[currency];
        const years = Object.keys(yearlyData).map(Number).sort((a, b) => a - b);

        for (const year of years) {
          totalFareByYear[currency].push({ year, total: yearlyData[year] });
        }
      }

      let longestStreak = { days: 0, startDate: null as number | null, endDate: null as number | null };
      let longestGap = { days: 0, startDate: null as number | null, endDate: null as number | null };

      if (completedTripDates.length > 0) {
        const uniqueDates = Array.from(new Set(
          completedTripDates.map(d => {
            const date = new Date(d);
            date.setUTCHours(0, 0, 0, 0);
            return date.getTime();
          })
        )).sort((a, b) => a - b);

        if (uniqueDates.length === 1) {
          longestStreak = { days: 1, startDate: uniqueDates[0], endDate: uniqueDates[0] };
        } else if (uniqueDates.length > 1) {
          let currentStreak = 1;
          let currentStreakStartDate = uniqueDates[0];
          longestStreak = { days: 1, startDate: uniqueDates[0], endDate: uniqueDates[0] };

          const oneDay = 24 * 60 * 60 * 1000;

          for (let i = 1; i < uniqueDates.length; i++) {
            const diffDays = Math.round((uniqueDates[i] - uniqueDates[i - 1]) / oneDay);

            if (diffDays === 1) {
              currentStreak++;
            } else {
              if (currentStreak > longestStreak.days) {
                longestStreak = { days: currentStreak, startDate: currentStreakStartDate, endDate: uniqueDates[i - 1] };
              }
              currentStreak = 1;
              currentStreakStartDate = uniqueDates[i];

              const gapDays = diffDays - 1;
              if (gapDays > longestGap.days) {
                longestGap = {
                  days: gapDays,
                  startDate: uniqueDates[i - 1] + oneDay,
                  endDate: uniqueDates[i] - oneDay,
                };
              }
            }
          }

          if (currentStreak > longestStreak.days) {
            longestStreak = { days: currentStreak, startDate: currentStreakStartDate, endDate: uniqueDates[uniqueDates.length - 1] };
          }
        }
      }

      const formattedTripsByYear = Object.keys(tripsByYear)
        .map(Number)
        .sort((a, b) => a - b)
        .map(year => ({ year, count: tripsByYear[year] }));

      const newStats: TripStats = {
        ...stats,
        totalTrips: rows.length,
        successfulTrips: completedCount,
        riderCanceledTrips: riderCanceledCount,
        driverCanceledTrips: driverCanceledCount,
        canceledTrips: canceledCount,
        unfulfilledTrips: unfulfilledCount,
        totalFareByCurrency: fareByCurrency,
        lowestFareByCurrency: localLowestFare,
        highestFareByCurrency: localHighestFare,
        avgFareByCurrency: avgFares,
        costPerDistanceByCurrency: localCostPerDistance,
        costPerDurationByCurrency: localCostPerDuration,
        avgCostPerDistanceByYear,
        totalFareByYear,
        totalCompletedDistance: currentTotalDistance,
        avgCompletedDistance: completedCount > 0 ? currentTotalDistance / completedCount : 0,
        avgSpeed: totalDurationHours > 0 ? currentTotalDistance / totalDurationHours : 0,
        totalTripDuration: totalDurationMinutes,
        longestStreak,
        longestGap,
        waitingLongerThanTripCount,
        totalWaitingTimeForLongerWaits,
        totalRidingTimeForLongerWaits,
        tripsByYear: formattedTripsByYear,
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