import { useState, useEffect, useCallback } from 'react';
import { add, divide } from '../utils/currency';
import { KM_PER_MILE } from '../constants';
import { CSVRow } from '../services/csvParser';
import { DistanceUnit } from '../App';
import { point } from '@turf/helpers';
import distance from '@turf/distance';

export interface YearlyStat {
  year: number;
  count: number;
  totalDistance: number;
  totalFare: { [key: string]: number };
  totalRidingTime: number;
  totalWaitingTime: number;
  farthestTrip: number;
  shortestTrip: number | null;
  highestFare: { [key: string]: number };
  lowestFare: { [key: string]: number };
}

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
  speedDistribution: { name: string; count: number }[];
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
  longestStreak: { days: number; startDate: number | null; endDate: number | null };
  longestGap: { days: number; startDate: number | null; endDate: number | null };
  longestSuccessfulStreakBeforeCancellation: { count: number; startDate: number | null; endDate: number | null };
  longestCancellationStreak: { count: number; startDate: number | null; endDate: number | null };
  longestSuccessfulStreakBeforeDriverCancellation: { count: number; startDate: number | null; endDate: number | null };
  longestDriverCancellationStreak: { count: number; startDate: number | null; endDate: number | null };
  tripsByYear: YearlyStat[];
  avgSpeedByDayOfWeek: { day: string; avgSpeed: number }[];
  mostSuccessfulTripsInADay: { count: number; date: number | null; trips: CSVRow[] };
  longestConsecutiveTripsChain: CSVRow[];
  convertDistance: (miles: number) => number;
}

const safeParseFloat = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseFloat(value);
  return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
};

const safeParseDate = (value: any): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return !isNaN(date.getTime()) ? date : null;
};

const isPositiveNumber = (value: number | null): value is number => {
  return value !== null && value > 0;
};

const INITIAL_STATS: TripStats = {
  beginCount: 0, dropoffCount: 0, avgSpeed: 0, longestTrip: 0, longestTripByDist: 0, shortestTrip: 0, shortestTripByDist: 0, longestTripRow: null,
  totalWaitingTime: 0, avgWaitingTime: 0, shortestWaitingTime: 0, longestWaitingTime: 0, shortestWaitingTimeRow: null, longestWaitingTimeRow: null,
  waitingLongerThanTripCount: 0, totalWaitingTimeForLongerWaits: 0, totalRidingTimeForLongerWaits: 0, fastestTripBySpeed: 0, fastestTripBySpeedRow: null,
  speedDistribution: [], slowestTripBySpeed: 0, slowestTripBySpeedRow: null, longestTripByDistRow: null, shortestTripRow: null, shortestTripByDistRow: null,
  avgTripDuration: 0, totalTripDuration: 0, totalCompletedDistance: 0, avgCompletedDistance: 0, totalTrips: 0, successfulTrips: 0, riderCanceledTrips: 0,
  driverCanceledTrips: 0, canceledTrips: 0, unfulfilledTrips: 0, avgFareByCurrency: {}, lowestFareByCurrency: {}, highestFareByCurrency: {}, totalFareByCurrency: {},
  costPerDistanceByCurrency: {}, costPerDurationByCurrency: {}, avgCostPerDistanceByYear: {}, totalFareByYear: {},
  longestStreak: { days: 0, startDate: null, endDate: null }, longestGap: { days: 0, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeCancellation: { count: 0, startDate: null, endDate: null }, longestCancellationStreak: { count: 0, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeDriverCancellation: { count: 0, startDate: null, endDate: null }, longestDriverCancellationStreak: { count: 0, startDate: null, endDate: null },
  tripsByYear: [], avgSpeedByDayOfWeek: [], longestConsecutiveTripsChain: [], mostSuccessfulTripsInADay: { count: 0, date: null, trips: [] },
  convertDistance: (miles: number) => miles,
};

interface ProcessedRow {
  row: CSVRow;
  requestTime: Date | null;
  requestTimestamp: number;
  beginTime: Date | null;
  beginTimestamp: number;
  dropoffTime: Date | null;
  dropoffTimestamp: number;
  distanceMiles: number | null;
  fare: number | null;
  currency: string | null;
  status: string;
  durationHours: number | null;
  durationMinutes: number | null;
  waitingMinutes: number | null;
}

export const useTripData = (rows: CSVRow[], distanceUnit: DistanceUnit): [TripStats, boolean] => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [stats, setStats] = useState<TripStats>(INITIAL_STATS);

  const convertDistance = useCallback((miles: number): number => {
    return distanceUnit === 'km' ? miles * KM_PER_MILE : miles;
  }, [distanceUnit]);

  useEffect(() => {
    if (rows.length === 0) {
      setStats(INITIAL_STATS);
      setIsAnalyzing(false);
      return;
    }
    setIsAnalyzing(true);
    const timeoutId = setTimeout(() => {
      const processedRows: ProcessedRow[] = rows.map(r => {
        const requestTime = safeParseDate(r.request_time);
        const beginTime = safeParseDate(r.begin_trip_time);
        const dropoffTime = safeParseDate(r.dropoff_time);
        const distanceMiles = safeParseFloat(r.distance);
        const fare = safeParseFloat(r.fare_amount);
        const currency = r.fare_currency?.trim();
        const status = r.status?.toLowerCase().trim() || '';
        let durationHours: number | null = null;
        let durationMinutes: number | null = null;
        if (beginTime && dropoffTime && dropoffTime > beginTime) {
          durationHours = (dropoffTime.getTime() - beginTime.getTime()) / (1000 * 60 * 60);
          if (durationHours > 0 && durationHours < 24) durationMinutes = durationHours * 60;
          else durationHours = null;
        }
        let waitingMinutes: number | null = null;
        if (requestTime && beginTime && beginTime > requestTime) {
          const diff = (beginTime.getTime() - requestTime.getTime()) / (1000 * 60);
          if (isPositiveNumber(diff) && diff < 1440) waitingMinutes = diff;
        }
        return { row: r, requestTime, requestTimestamp: requestTime?.getTime() || 0, beginTime, beginTimestamp: beginTime?.getTime() || 0, dropoffTime, dropoffTimestamp: dropoffTime?.getTime() || 0, distanceMiles, fare, currency, status, durationHours, durationMinutes, waitingMinutes };
      });

      processedRows.sort((a, b) => a.requestTimestamp - b.requestTimestamp);

      let currentTotalDistance = 0;
      let totalDurationMinutes = 0;
      let totalDurationHours = 0;
      let completedCount = 0;
      let beginCount = 0;
      let dropoffCount = 0;
      let riderCanceledCount = 0;
      let driverCanceledCount = 0;

      const tripsWithDuration: ProcessedRow[] = [];
      const tripsWithDistance: ProcessedRow[] = [];
      const tripsWithSpeed: { speed: number; row: CSVRow }[] = [];
      const tripsWithWaitingTime: ProcessedRow[] = [];

      let longestSuccessfulStreakBeforeCancellation = { count: 0, startDate: null as number | null, endDate: null as number | null };
      let currentSuccessfulStreak = { count: 0, startDate: null as number | null, endDate: null as number | null };
      let longestCancellationStreak = { count: 0, startDate: null as number | null, endDate: null as number | null };
      let currentCancellationStreak = { count: 0, startDate: null as number | null, endDate: null as number | null };
      let longestSuccessfulStreakBeforeDriverCancellation = { count: 0, startDate: null as number | null, endDate: null as number | null };
      let currentSuccessfulStreakForDriver = { count: 0, startDate: null as number | null, endDate: null as number | null };
      let longestDriverCancellationStreak = { count: 0, startDate: null as number | null, endDate: null as number | null };
      let currentDriverCancellationStreak = { count: 0, startDate: null as number | null, endDate: null as number | null };

      const fareByCurrency: { [key: string]: number } = {};
      const fareCountByCurrency: { [key: string]: number } = {};
      const localLowestFare: { [key: string]: { amount: number; row: CSVRow } } = {};
      const localHighestFare: { [key: string]: { amount: number; row: CSVRow } } = {};

      let waitingLongerThanTripCount = 0;
      let totalWaitingTimeForLongerWaits = 0;
      let totalRidingTimeForLongerWaits = 0;

      const completedTripDates: number[] = [];
      const yearlyDistanceByCurrency: { [currency: string]: { [year: number]: number } } = {};
      const yearlyFareByCurrency: { [currency: string]: { [year: number]: number } } = {};
      const tripsByYear: { [year: number]: Omit<YearlyStat, 'year'> } = {};

      const dailySpeedTotals: { totalSpeed: number; count: number }[] = Array(7).fill(0).map(() => ({ totalSpeed: 0, count: 0 }));
      const initYearlyStat = (): Omit<YearlyStat, 'year'> => ({ count: 0, totalDistance: 0, totalFare: {}, totalRidingTime: 0, totalWaitingTime: 0, farthestTrip: 0, shortestTrip: null, highestFare: {}, lowestFare: {} });
      const tripsByDay = new Map<string, CSVRow[]>();

      for (const p of processedRows) {
        const { row, status, requestTime, requestTimestamp, beginTime, dropoffTime, distanceMiles, fare, currency, durationHours, durationMinutes, waitingMinutes } = p;
        if (status === 'completed') {
          if (requestTime) {
            const dateKey = `${requestTime.getFullYear()}-${requestTime.getMonth() + 1}-${requestTime.getDate()}`;
            if (!tripsByDay.has(dateKey)) tripsByDay.set(dateKey, []);
            tripsByDay.get(dateKey)!.push(row);
          }
          if (currentSuccessfulStreak.count === 0) currentSuccessfulStreak.startDate = requestTimestamp;
          currentSuccessfulStreak.endDate = requestTimestamp;
          currentSuccessfulStreak.count++;
          if (currentSuccessfulStreakForDriver.count === 0) currentSuccessfulStreakForDriver.startDate = requestTimestamp;
          currentSuccessfulStreakForDriver.endDate = requestTimestamp;
          currentSuccessfulStreakForDriver.count++;
          if (currentCancellationStreak.count > longestCancellationStreak.count) longestCancellationStreak = { ...currentCancellationStreak };
          currentCancellationStreak = { count: 0, startDate: null, endDate: null };
          if (currentDriverCancellationStreak.count > longestDriverCancellationStreak.count) longestDriverCancellationStreak = { ...currentDriverCancellationStreak };
          currentDriverCancellationStreak = { count: 0, startDate: null, endDate: null };
          completedCount++;
          if (beginTime) beginCount++;
          if (dropoffTime) dropoffCount++;
          let year: number | null = null;
          if (requestTime) {
            year = requestTime.getFullYear();
            if (year >= 1900 && year <= 2100) {
              if (!tripsByYear[year]) tripsByYear[year] = initYearlyStat();
              completedTripDates.push(requestTimestamp);
            } else year = null;
          }
          if (waitingMinutes !== null) {
            tripsWithWaitingTime.push(p);
            if (year && tripsByYear[year]) tripsByYear[year].totalWaitingTime += waitingMinutes;
          }
          if (durationMinutes !== null && durationHours !== null) {
            tripsWithDuration.push(p);
            if (year && tripsByYear[year]) tripsByYear[year].totalRidingTime += durationMinutes;
            if (isPositiveNumber(distanceMiles) && distanceMiles < 3000) {
              const convertedDist = convertDistance(distanceMiles);
              totalDurationMinutes += durationMinutes;
              currentTotalDistance += convertedDist;
              totalDurationHours += durationHours;
              const speed = convertedDist / durationHours;
              if (isPositiveNumber(speed) && speed < 300) {
                tripsWithSpeed.push({ speed, row });
                if (requestTime) {
                  const dayOfWeek = requestTime.getDay();
                  dailySpeedTotals[dayOfWeek].totalSpeed += speed;
                  dailySpeedTotals[dayOfWeek].count++;
                }
              }
              tripsWithDistance.push(p);
              if (year && tripsByYear[year]) {
                tripsByYear[year].totalDistance += convertedDist;
                tripsByYear[year].farthestTrip = Math.max(tripsByYear[year].farthestTrip, convertedDist);
                const currentShortest = tripsByYear[year].shortestTrip;
                tripsByYear[year].shortestTrip = currentShortest === null ? convertedDist : Math.min(currentShortest, convertedDist);
              }
            }
          }
          if (waitingMinutes !== null && durationMinutes !== null && waitingMinutes > durationMinutes) {
            waitingLongerThanTripCount++;
            totalWaitingTimeForLongerWaits += waitingMinutes;
            totalRidingTimeForLongerWaits += durationMinutes;
          }
          if (currency && isPositiveNumber(fare) && fare < 100000) {
            if (!fareByCurrency[currency]) {
              fareByCurrency[currency] = 0;
              fareCountByCurrency[currency] = 0;
              localLowestFare[currency] = { amount: fare, row };
              localHighestFare[currency] = { amount: fare, row };
            }
            if (year && tripsByYear[year]) {
              tripsByYear[year].count++;
              tripsByYear[year].totalFare[currency] = add(tripsByYear[year].totalFare[currency] || 0, fare);
              const currentHighest = tripsByYear[year].highestFare[currency];
              if (currentHighest === undefined || fare > currentHighest) tripsByYear[year].highestFare[currency] = fare;
              const currentLowest = tripsByYear[year].lowestFare[currency];
              if (currentLowest === undefined || fare < currentLowest) tripsByYear[year].lowestFare[currency] = fare;
            }
            fareByCurrency[currency] = add(fareByCurrency[currency], fare);
            fareCountByCurrency[currency]++;
            if (fare < localLowestFare[currency].amount) localLowestFare[currency] = { amount: fare, row };
            if (fare > localHighestFare[currency].amount) localHighestFare[currency] = { amount: fare, row };
            if (year && isPositiveNumber(distanceMiles) && distanceMiles < 1000) {
              if (!yearlyFareByCurrency[currency]) {
                yearlyFareByCurrency[currency] = {};
                yearlyDistanceByCurrency[currency] = {};
              }
              if (!yearlyFareByCurrency[currency][year]) {
                yearlyFareByCurrency[currency][year] = 0;
                yearlyDistanceByCurrency[currency][year] = 0;
              }
              yearlyFareByCurrency[currency][year] = add(yearlyFareByCurrency[currency][year], fare);
              yearlyDistanceByCurrency[currency][year] += convertDistance(distanceMiles);
            }
          }
        } else if (status === 'rider_canceled') {
          riderCanceledCount++;
          if (currentSuccessfulStreak.count > longestSuccessfulStreakBeforeCancellation.count) longestSuccessfulStreakBeforeCancellation = { ...currentSuccessfulStreak };
          currentSuccessfulStreak = { count: 0, startDate: null, endDate: null };
          if (currentCancellationStreak.count === 0) currentCancellationStreak.startDate = requestTimestamp;
          currentCancellationStreak.endDate = requestTimestamp;
          currentCancellationStreak.count++;
          if (currentDriverCancellationStreak.count > longestDriverCancellationStreak.count) longestDriverCancellationStreak = { ...currentDriverCancellationStreak };
          currentDriverCancellationStreak = { count: 0, startDate: null, endDate: null };
        } else if (status === 'driver_canceled') {
          driverCanceledCount++;
          if (currentSuccessfulStreak.count > longestSuccessfulStreakBeforeCancellation.count) longestSuccessfulStreakBeforeCancellation = { ...currentSuccessfulStreak };
          currentSuccessfulStreak = { count: 0, startDate: null, endDate: null };
          if (currentCancellationStreak.count === 0) currentCancellationStreak.startDate = requestTimestamp;
          currentCancellationStreak.endDate = requestTimestamp;
          currentCancellationStreak.count++;
          if (currentSuccessfulStreakForDriver.count > longestSuccessfulStreakBeforeDriverCancellation.count) longestSuccessfulStreakBeforeDriverCancellation = { ...currentSuccessfulStreakForDriver };
          currentSuccessfulStreakForDriver = { count: 0, startDate: null, endDate: null };
          if (currentDriverCancellationStreak.count === 0) currentDriverCancellationStreak.startDate = requestTimestamp;
          currentDriverCancellationStreak.endDate = requestTimestamp;
          currentDriverCancellationStreak.count++;
        } else {
          if (currentSuccessfulStreak.count > longestSuccessfulStreakBeforeCancellation.count) longestSuccessfulStreakBeforeCancellation = { ...currentSuccessfulStreak };
          currentSuccessfulStreak = { count: 0, startDate: null, endDate: null };
          if (currentCancellationStreak.count > longestCancellationStreak.count) longestCancellationStreak = { ...currentCancellationStreak };
          currentCancellationStreak = { count: 0, startDate: null, endDate: null };
          if (currentSuccessfulStreakForDriver.count > longestSuccessfulStreakBeforeDriverCancellation.count) longestSuccessfulStreakBeforeDriverCancellation = { ...currentSuccessfulStreakForDriver };
          currentSuccessfulStreakForDriver = { count: 0, startDate: null, endDate: null };
          if (currentDriverCancellationStreak.count > longestDriverCancellationStreak.count) longestDriverCancellationStreak = { ...currentDriverCancellationStreak };
          currentDriverCancellationStreak = { count: 0, startDate: null, endDate: null };
        }
      }

      if (currentSuccessfulStreak.count > longestSuccessfulStreakBeforeCancellation.count) longestSuccessfulStreakBeforeCancellation = { ...currentSuccessfulStreak };
      if (currentCancellationStreak.count > longestCancellationStreak.count) longestCancellationStreak = { ...currentCancellationStreak };
      if (currentSuccessfulStreakForDriver.count > longestSuccessfulStreakBeforeDriverCancellation.count) longestSuccessfulStreakBeforeDriverCancellation = { ...currentSuccessfulStreakForDriver };
      if (currentDriverCancellationStreak.count > longestDriverCancellationStreak.count) longestDriverCancellationStreak = { ...currentDriverCancellationStreak };

      let maxTrips = 0;
      let maxDate: number | null = null;
      let maxTripsRows: CSVRow[] = [];
      for (const [dateKey, trips] of tripsByDay) {
        if (trips.length > maxTrips) {
          maxTrips = trips.length;
          maxDate = new Date(dateKey).getTime();
          maxTripsRows = trips;
        }
      }

      let longestConsecutiveTripsChain: CSVRow[] = [];
      let currentConsecutiveTripsChain: CSVRow[] = [];
      const completedTripsSorted = processedRows
        .filter(p => p.status === 'completed' && p.beginTimestamp && p.dropoffTimestamp)
        .sort((a, b) => a.beginTimestamp - b.beginTimestamp);

      if (completedTripsSorted.length > 0) {
        currentConsecutiveTripsChain = [completedTripsSorted[0].row];
        for (let i = 1; i < completedTripsSorted.length; i++) {
          const prev = completedTripsSorted[i - 1];
          const curr = completedTripsSorted[i];
          const prevDropoffDate = prev.dropoffTime?.toDateString();
          const currBeginDate = curr.beginTime?.toDateString();
          if (prevDropoffDate === currBeginDate) {
            const prevLat = safeParseFloat(prev.row.dropoff_lat);
            const prevLng = safeParseFloat(prev.row.dropoff_lng);
            const currLat = safeParseFloat(curr.row.begintrip_lat);
            const currLng = safeParseFloat(curr.row.begintrip_lng);
            if (prevLat && prevLng && currLat && currLng) {
              const from = point([prevLng, prevLat]);
              const to = point([currLng, currLat]);
              const dist = distance(from, to, { units: 'kilometers' });
              if (dist <= 0.2) currentConsecutiveTripsChain.push(curr.row);
              else {
                if (currentConsecutiveTripsChain.length > longestConsecutiveTripsChain.length) longestConsecutiveTripsChain = [...currentConsecutiveTripsChain];
                currentConsecutiveTripsChain = [curr.row];
              }
            }
          } else {
            if (currentConsecutiveTripsChain.length > longestConsecutiveTripsChain.length) longestConsecutiveTripsChain = [...currentConsecutiveTripsChain];
            currentConsecutiveTripsChain = [curr.row];
          }
        }
        if (currentConsecutiveTripsChain.length > longestConsecutiveTripsChain.length) longestConsecutiveTripsChain = [...currentConsecutiveTripsChain];
      }

      const canceledCount = riderCanceledCount + driverCanceledCount;
      const unfulfilledCount = rows.length - completedCount - canceledCount;
      const avgFares: { [key: string]: number } = {};
      for (const currency in fareByCurrency) {
        if (fareCountByCurrency[currency] > 0) avgFares[currency] = divide(fareByCurrency[currency], fareCountByCurrency[currency]);
      }
      const localCostPerDistance: { [key: string]: number } = {};
      const localCostPerDuration: { [key: string]: number } = {};
      for (const currency in fareByCurrency) {
        if (currentTotalDistance > 0) localCostPerDistance[currency] = divide(fareByCurrency[currency], currentTotalDistance);
        if (totalDurationMinutes > 0) localCostPerDuration[currency] = divide(fareByCurrency[currency], totalDurationMinutes);
      }
      const avgCostPerDistanceByYear: { [currency: string]: { year: number; cost: number }[] } = {};
      for (const currency in yearlyFareByCurrency) {
        avgCostPerDistanceByYear[currency] = [];
        const years = Object.keys(yearlyFareByCurrency[currency]).map(Number).sort((a, b) => a - b);
        for (const year of years) {
          const dist = yearlyDistanceByCurrency[currency][year];
          if (dist > 0) avgCostPerDistanceByYear[currency].push({ year, cost: divide(yearlyFareByCurrency[currency][year], dist) });
        }
      }
      const totalFareByYear: { [currency: string]: { year: number; total: number }[] } = {};
      for (const currency in yearlyFareByCurrency) {
        totalFareByYear[currency] = [];
        const years = Object.keys(yearlyFareByCurrency[currency]).map(Number).sort((a, b) => a - b);
        for (const year of years) totalFareByYear[currency].push({ year, total: yearlyFareByCurrency[currency][year] });
      }

      let longestStreak = { days: 0, startDate: null as number | null, endDate: null as number | null };
      let longestGap = { days: 0, startDate: null as number | null, endDate: null as number | null };
      if (completedTripDates.length > 0) {
        const uniqueDates = Array.from(new Set(completedTripDates.map(d => {
          const date = new Date(d);
          date.setUTCHours(0, 0, 0, 0);
          return date.getTime();
        }))).sort((a, b) => a - b);
        if (uniqueDates.length === 1) longestStreak = { days: 1, startDate: uniqueDates[0], endDate: uniqueDates[0] };
        else if (uniqueDates.length > 1) {
          let currentStreak = 1;
          let currentStreakStartDate = uniqueDates[0];
          longestStreak = { days: 1, startDate: uniqueDates[0], endDate: uniqueDates[0] };
          const oneDay = 24 * 60 * 60 * 1000;
          for (let i = 1; i < uniqueDates.length; i++) {
            const diffDays = Math.round((uniqueDates[i] - uniqueDates[i - 1]) / oneDay);
            if (diffDays === 1) currentStreak++;
            else {
              if (currentStreak > longestStreak.days) longestStreak = { days: currentStreak, startDate: currentStreakStartDate, endDate: uniqueDates[i - 1] };
              currentStreak = 1;
              currentStreakStartDate = uniqueDates[i];
              const gapDays = diffDays - 1;
              if (gapDays > longestGap.days) longestGap = { days: gapDays, startDate: uniqueDates[i - 1] + oneDay, endDate: uniqueDates[i] - oneDay };
            }
          }
          if (currentStreak > longestStreak.days) longestStreak = { days: currentStreak, startDate: currentStreakStartDate, endDate: uniqueDates[uniqueDates.length - 1] };
        }
      }

      const formattedTripsByYear = Object.keys(tripsByYear).map(Number).sort((a, b) => a - b).map(year => ({ year, ...tripsByYear[year] }));
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const avgSpeedByDayOfWeek = dailySpeedTotals.map((data, index) => ({ day: dayNames[index], avgSpeed: data.count > 0 ? data.totalSpeed / data.count : 0 }));

      const newStats: TripStats = {
        totalTrips: rows.length, successfulTrips: completedCount, beginCount, dropoffCount, riderCanceledTrips: riderCanceledCount, driverCanceledTrips: driverCanceledCount,
        canceledTrips: canceledCount, unfulfilledTrips: unfulfilledCount, totalFareByCurrency: fareByCurrency, lowestFareByCurrency: localLowestFare, highestFareByCurrency: localHighestFare,
        avgFareByCurrency: avgFares, costPerDistanceByCurrency: localCostPerDistance, costPerDurationByCurrency: localCostPerDuration, avgCostPerDistanceByYear, totalFareByYear,
        totalCompletedDistance: currentTotalDistance, avgCompletedDistance: completedCount > 0 ? currentTotalDistance / completedCount : 0, avgSpeed: totalDurationHours > 0 ? currentTotalDistance / totalDurationHours : 0,
        totalTripDuration: totalDurationMinutes, longestStreak, longestGap, longestSuccessfulStreakBeforeCancellation, longestCancellationStreak, longestSuccessfulStreakBeforeDriverCancellation,
        longestDriverCancellationStreak, waitingLongerThanTripCount, totalWaitingTimeForLongerWaits, totalRidingTimeForLongerWaits, tripsByYear: formattedTripsByYear, avgSpeedByDayOfWeek,
        longestConsecutiveTripsChain, mostSuccessfulTripsInADay: { count: maxTrips, date: maxDate, trips: maxTripsRows }, convertDistance,
        avgTripDuration: 0, longestTrip: 0, shortestTrip: 0, longestTripRow: null, shortestTripRow: null, totalWaitingTime: 0, avgWaitingTime: 0, shortestWaitingTime: 0, longestWaitingTime: 0,
        shortestWaitingTimeRow: null, longestWaitingTimeRow: null, shortestTripByDist: 0, shortestTripByDistRow: null, longestTripByDist: 0, longestTripByDistRow: null,
        slowestTripBySpeed: 0, slowestTripBySpeedRow: null, fastestTripBySpeed: 0, fastestTripBySpeedRow: null, speedDistribution: []
      };

      if (tripsWithDuration.length > 0) {
        tripsWithDuration.sort((a, b) => a.durationMinutes! - b.durationMinutes!);
        const shortest = tripsWithDuration[0];
        const longest = tripsWithDuration[tripsWithDuration.length - 1];
        newStats.avgTripDuration = totalDurationMinutes / tripsWithDuration.length;
        newStats.longestTrip = longest.durationMinutes!;
        newStats.shortestTrip = shortest.durationMinutes!;
        newStats.longestTripRow = longest.row;
        newStats.shortestTripRow = shortest.row;
      }
      if (tripsWithWaitingTime.length > 0) {
        tripsWithWaitingTime.sort((a, b) => a.waitingMinutes! - b.waitingMinutes!);
        const shortest = tripsWithWaitingTime[0];
        const longest = tripsWithWaitingTime[tripsWithWaitingTime.length - 1];
        const totalTime = tripsWithWaitingTime.reduce((sum, t) => sum + t.waitingMinutes!, 0);
        newStats.totalWaitingTime = totalTime;
        newStats.avgWaitingTime = totalTime / tripsWithWaitingTime.length;
        newStats.shortestWaitingTime = shortest.waitingMinutes!;
        newStats.shortestWaitingTimeRow = shortest.row;
        newStats.longestWaitingTime = longest.waitingMinutes!;
        newStats.longestWaitingTimeRow = longest.row;
      }
      if (tripsWithDistance.length > 0) {
        tripsWithDistance.sort((a, b) => a.distanceMiles! - b.distanceMiles!);
        newStats.shortestTripByDist = convertDistance(tripsWithDistance[0].distanceMiles!);
        newStats.shortestTripByDistRow = tripsWithDistance[0].row;
        newStats.longestTripByDist = convertDistance(tripsWithDistance[tripsWithDistance.length - 1].distanceMiles!);
        newStats.longestTripByDistRow = tripsWithDistance[tripsWithDistance.length - 1].row;
      }
      if (tripsWithSpeed.length > 0) {
        tripsWithSpeed.sort((a, b) => a.speed - b.speed);
        newStats.slowestTripBySpeed = tripsWithSpeed[0].speed;
        newStats.slowestTripBySpeedRow = tripsWithSpeed[0].row;
        newStats.fastestTripBySpeed = tripsWithSpeed[tripsWithSpeed.length - 1].speed;
        newStats.fastestTripBySpeedRow = tripsWithSpeed[tripsWithSpeed.length - 1].row;
        const speeds = tripsWithSpeed.map(t => t.speed);
        const maxSpeed = Math.max(...speeds);
        const bucketCount = 10;
        const bucketSize = Math.max(1, Math.ceil(maxSpeed / bucketCount));
        const buckets = Array.from({ length: bucketCount }, () => 0);
        speeds.forEach(speed => {
          const bucketIndex = Math.min(Math.floor(speed / bucketSize), bucketCount - 1);
          buckets[bucketIndex]++;
        });
        newStats.speedDistribution = buckets.map((count, i) => ({ name: `${i * bucketSize}-${(i + 1) * bucketSize}`, count }));
      }
      setStats(newStats);
      setIsAnalyzing(false);
    }, 10);
    return () => clearTimeout(timeoutId);
  }, [rows, distanceUnit, convertDistance]);
  return [stats, isAnalyzing];
};
