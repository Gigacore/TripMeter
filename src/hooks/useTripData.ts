import { useState, useEffect } from 'react';
import { add, multiply, divide } from '../utils/currency';
import { KM_PER_MILE } from '../constants';
import { CSVRow } from '../services/csvParser';
import { DistanceUnit } from '../App';

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
  tripsByYear: YearlyStat[];
  avgSpeedByDayOfWeek: { day: string; avgSpeed: number }[];
}

// Helper function to safely parse float
const safeParseFloat = (value: any): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = parseFloat(value);
  return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
};

// Helper function to safely parse date
const safeParseDate = (value: any): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return !isNaN(date.getTime()) ? date : null;
};

// Helper function to validate positive number
const isPositiveNumber = (value: number | null): value is number => {
  return value !== null && value > 0;
};

export const useTripData = (rows: CSVRow[], distanceUnit: DistanceUnit): [TripStats, boolean] => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
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
    avgSpeedByDayOfWeek: [],
  });

  const convertDistance = (miles: number): number => {
    return distanceUnit === 'km' ? miles * KM_PER_MILE : miles;
  };

  useEffect(() => {
    if (rows.length > 0) {
      setIsAnalyzing(true);
      const timeoutId = setTimeout(() => {
        // Accumulators
        let currentTotalDistance = 0;
        let totalDurationMinutes = 0;
        let totalDurationHours = 0;
        const tripsWithDuration: { duration: number; row: CSVRow }[] = [];
        const tripsWithDistance: { distance: number; row: CSVRow }[] = [];
        const tripsWithSpeed: { speed: number; row: CSVRow }[] = [];
        const tripsWithWaitingTime: { waitingTime: number; row: CSVRow }[] = [];
        let completedCount = 0;
        let beginCount = 0;
        let dropoffCount = 0;
        let riderCanceledCount = 0;
        let driverCanceledCount = 0;
        const fareByCurrency: { [key: string]: number } = {};
        let waitingLongerThanTripCount = 0;
        let totalWaitingTimeForLongerWaits = 0;
        let totalRidingTimeForLongerWaits = 0;
        const fareCountByCurrency: { [key: string]: number } = {};
        const localLowestFare: { [key: string]: { amount: number; row: CSVRow } } = {};
        const localHighestFare: { [key: string]: { amount: number; row: CSVRow } } = {};
        const completedTripDates: Date[] = [];
        const yearlyDistanceByCurrency: { [currency: string]: { [year: number]: number } } = {};
        const yearlyFareByCurrency: { [currency: string]: { [year: number]: number } } = {};
        const tripsByYear: { [year: number]: Omit<YearlyStat, 'year'> } = {};

        const dailySpeedTotals: { totalSpeed: number; count: number }[] = Array(7)
          .fill(0)
          .map(() => ({ totalSpeed: 0, count: 0 }));

        const initYearlyStat = (): Omit<YearlyStat, 'year'> => ({
          count: 0,
          totalDistance: 0,
          totalFare: {},
          totalRidingTime: 0,
          totalWaitingTime: 0,
          farthestTrip: 0,
          shortestTrip: null,
          highestFare: {},
          lowestFare: {},
        });

        // Main processing loop
        rows.forEach((r: CSVRow) => {
          const status = r.status?.toLowerCase().trim();
          
          if (status === 'completed') {
            completedCount++;

            // Parse and validate all fields upfront
            const distanceMiles = safeParseFloat(r.distance);
            const beginTime = safeParseDate(r.begin_trip_time);
            const dropoffTime = safeParseDate(r.dropoff_time);
            const requestTime = safeParseDate(r.request_time);
            const fare = safeParseFloat(r.fare_amount);
            const currency = r.fare_currency?.trim();

            // Count trips with valid begin/dropoff times
            if (beginTime) beginCount++;
            if (dropoffTime) dropoffCount++;

            // Get year for yearly stats
            let year: number | null = null;
            if (requestTime) {
              year = requestTime.getFullYear();
              if (!isNaN(year) && year >= 1900 && year <= 2100) {
                if (!tripsByYear[year]) {
                  tripsByYear[year] = initYearlyStat();
                }
                completedTripDates.push(requestTime);
              } else {
                year = null;
              }
            }

            // Calculate waiting time
            let waitingMinutes: number | null = null;
            if (requestTime && beginTime && beginTime > requestTime) {
              const diff = (beginTime.getTime() - requestTime.getTime()) / (1000 * 60);
              if (isPositiveNumber(diff) && diff < 1440) { // Sanity check: less than 24 hours
                waitingMinutes = diff;
                tripsWithWaitingTime.push({ waitingTime: diff, row: r });
                if (year && tripsByYear[year]) {
                  tripsByYear[year].totalWaitingTime += diff;
                }
              }
            }

            // Calculate trip duration and distance metrics
            let durationMinutes: number | null = null;
            if (beginTime && dropoffTime && dropoffTime > beginTime) {
              const durationHours = (dropoffTime.getTime() - beginTime.getTime()) / (1000 * 60 * 60);
              
              // Sanity check: trip should be less than 24 hours
              if (durationHours > 0 && durationHours < 24) {
                durationMinutes = durationHours * 60;
                tripsWithDuration.push({ duration: durationHours, row: r });
                
                if (year && tripsByYear[year]) {
                  tripsByYear[year].totalRidingTime += durationMinutes;
                }

                // Process distance and speed if valid
                if (isPositiveNumber(distanceMiles) && distanceMiles < 3000) { // Sanity check: less than 3000 miles
                  const convertedDist = convertDistance(distanceMiles);
                  
                  totalDurationMinutes += durationMinutes;
                  currentTotalDistance += convertedDist;
                  totalDurationHours += durationHours;
                  
                  // Calculate speed
                  const speed = convertedDist / durationHours;
                  if (isPositiveNumber(speed) && speed < 300) { // Sanity check: less than 300 mph/kph
                    tripsWithSpeed.push({ speed, row: r });
                    if (requestTime) {
                      const dayOfWeek = requestTime.getDay();
                      dailySpeedTotals[dayOfWeek].totalSpeed += speed;
                      dailySpeedTotals[dayOfWeek].count++;
                    }
                  }

                  // Track distance
                  tripsWithDistance.push({ distance: convertedDist, row: r });
                  if (year && tripsByYear[year]) {
                    tripsByYear[year].totalDistance += convertedDist;
                    tripsByYear[year].farthestTrip = Math.max(
                      tripsByYear[year].farthestTrip,
                      convertedDist
                    );
                    const currentShortest = tripsByYear[year].shortestTrip;
                    tripsByYear[year].shortestTrip = 
                      currentShortest === null ? convertedDist : Math.min(currentShortest, convertedDist);
                  }
                }
              }
            }

            // Check for waiting time longer than trip
            if (waitingMinutes !== null && durationMinutes !== null && waitingMinutes > durationMinutes) {
              waitingLongerThanTripCount++;
              totalWaitingTimeForLongerWaits += waitingMinutes;
              totalRidingTimeForLongerWaits += durationMinutes;
            }

            // Process fare data
            if (currency && isPositiveNumber(fare) && fare < 100000) { // Sanity check: less than $100k
              if (!fareByCurrency[currency]) {
                fareByCurrency[currency] = 0;
                fareCountByCurrency[currency] = 0;
                localLowestFare[currency] = { amount: fare, row: r };
                localHighestFare[currency] = { amount: fare, row: r };
              }

              // Update yearly fare stats
              if (year && tripsByYear[year]) {
                tripsByYear[year].count++;
                tripsByYear[year].totalFare[currency] = 
                  add(tripsByYear[year].totalFare[currency] || 0, fare);
                
                const currentHighest = tripsByYear[year].highestFare[currency];
                if (currentHighest === undefined || fare > currentHighest) {
                  tripsByYear[year].highestFare[currency] = fare;
                }
                
                const currentLowest = tripsByYear[year].lowestFare[currency];
                if (currentLowest === undefined || fare < currentLowest) {
                  tripsByYear[year].lowestFare[currency] = fare;
                }
              }

              // Update overall fare stats
              fareByCurrency[currency] = add(fareByCurrency[currency], fare);
              fareCountByCurrency[currency]++;

              if (fare < localLowestFare[currency].amount) {
                localLowestFare[currency] = { amount: fare, row: r };
              }
              if (fare > localHighestFare[currency].amount) {
                localHighestFare[currency] = { amount: fare, row: r };
              }

              // Track yearly fare by distance for cost calculations
              if (year && isPositiveNumber(distanceMiles) && distanceMiles < 1000) {
                if (!yearlyFareByCurrency[currency]) {
                  yearlyFareByCurrency[currency] = {};
                  yearlyDistanceByCurrency[currency] = {};
                }
                if (!yearlyFareByCurrency[currency][year]) {
                  yearlyFareByCurrency[currency][year] = 0;
                  yearlyDistanceByCurrency[currency][year] = 0;
                }
                yearlyFareByCurrency[currency][year] = 
                  add(yearlyFareByCurrency[currency][year], fare);
                yearlyDistanceByCurrency[currency][year] += convertDistance(distanceMiles);
              }
            }
          } else if (status === 'rider_canceled') {
            riderCanceledCount++;
          } else if (status === 'driver_canceled') {
            driverCanceledCount++;
          }
        });

        // Calculate derived statistics
        const canceledCount = riderCanceledCount + driverCanceledCount;
        const unfulfilledCount = rows.length - completedCount - canceledCount;

        // Calculate average fares
        const avgFares: { [key: string]: number } = {};
        for (const currency in fareByCurrency) {
          if (fareCountByCurrency[currency] > 0) {
            avgFares[currency] = divide(fareByCurrency[currency], fareCountByCurrency[currency]);
          }
        }

        // Calculate cost per distance and duration
        const localCostPerDistance: { [key: string]: number } = {};
        const localCostPerDuration: { [key: string]: number } = {};

        for (const currency in fareByCurrency) {
          if (currentTotalDistance > 0) {
            localCostPerDistance[currency] = divide(fareByCurrency[currency], currentTotalDistance);
          }
          if (totalDurationMinutes > 0) {
            localCostPerDuration[currency] = divide(fareByCurrency[currency], totalDurationMinutes);
          }
        }

        // Calculate average cost per distance by year
        const avgCostPerDistanceByYear: { [currency: string]: { year: number; cost: number }[] } = {};
        for (const currency in yearlyFareByCurrency) {
          avgCostPerDistanceByYear[currency] = [];
          const years = Object.keys(yearlyFareByCurrency[currency])
            .map(Number)
            .sort((a, b) => a - b);

          for (const year of years) {
            const totalDistanceForYear = yearlyDistanceByCurrency[currency][year];
            if (totalDistanceForYear > 0) {
              avgCostPerDistanceByYear[currency].push({
                year,
                cost: divide(yearlyFareByCurrency[currency][year], totalDistanceForYear),
              });
            }
          }
        }

        // Calculate total fare by year
        const totalFareByYear: { [currency: string]: { year: number; total: number }[] } = {};
        for (const currency in yearlyFareByCurrency) {
          totalFareByYear[currency] = [];
          const years = Object.keys(yearlyFareByCurrency[currency])
            .map(Number)
            .sort((a, b) => a - b);

          for (const year of years) {
            totalFareByYear[currency].push({
              year,
              total: yearlyFareByCurrency[currency][year],
            });
          }
        }

        // Calculate streaks and gaps
        let longestStreak = { days: 0, startDate: null as number | null, endDate: null as number | null };
        let longestGap = { days: 0, startDate: null as number | null, endDate: null as number | null };

        if (completedTripDates.length > 0) {
          const uniqueDates = Array.from(
            new Set(
              completedTripDates.map((d) => {
                const date = new Date(d);
                date.setUTCHours(0, 0, 0, 0);
                return date.getTime();
              })
            )
          ).sort((a, b) => a - b);

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
                  longestStreak = {
                    days: currentStreak,
                    startDate: currentStreakStartDate,
                    endDate: uniqueDates[i - 1],
                  };
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
              longestStreak = {
                days: currentStreak,
                startDate: currentStreakStartDate,
                endDate: uniqueDates[uniqueDates.length - 1],
              };
            }
          }
        }

        // Format trips by year
        const formattedTripsByYear = Object.keys(tripsByYear)
          .map(Number)
          .sort((a, b) => a - b)
          .map((year) => ({ year, ...tripsByYear[year] }));

        // Calculate average speed by day of week
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const avgSpeedByDayOfWeek = dailySpeedTotals.map((data, index) => ({
          day: dayNames[index],
          avgSpeed: data.count > 0 ? data.totalSpeed / data.count : 0,
        }));

        // Build final stats object
        const newStats: TripStats = {
          totalTrips: rows.length,
          successfulTrips: completedCount,
          beginCount,
          dropoffCount,
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
          avgSpeedByDayOfWeek,
          // Initialize fields that will be set below
          avgTripDuration: 0,
          longestTrip: 0,
          shortestTrip: 0,
          longestTripRow: null,
          shortestTripRow: null,
          totalWaitingTime: 0,
          avgWaitingTime: 0,
          shortestWaitingTime: 0,
          longestWaitingTime: 0,
          shortestWaitingTimeRow: null,
          longestWaitingTimeRow: null,
          shortestTripByDist: 0,
          shortestTripByDistRow: null,
          longestTripByDist: 0,
          longestTripByDistRow: null,
          slowestTripBySpeed: 0,
          slowestTripBySpeedRow: null,
          fastestTripBySpeed: 0,
          fastestTripBySpeedRow: null,
        };

        // Calculate duration statistics
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

        // Calculate waiting time statistics
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

        // Calculate distance statistics
        if (tripsWithDistance.length > 0) {
          tripsWithDistance.sort((a, b) => a.distance - b.distance);
          newStats.shortestTripByDist = tripsWithDistance[0].distance;
          newStats.shortestTripByDistRow = tripsWithDistance[0].row;
          newStats.longestTripByDist = tripsWithDistance[tripsWithDistance.length - 1].distance;
          newStats.longestTripByDistRow = tripsWithDistance[tripsWithDistance.length - 1].row;
        }

        // Calculate speed statistics
        if (tripsWithSpeed.length > 0) {
          tripsWithSpeed.sort((a, b) => a.speed - b.speed);
          newStats.slowestTripBySpeed = tripsWithSpeed[0].speed;
          newStats.slowestTripBySpeedRow = tripsWithSpeed[0].row;
          newStats.fastestTripBySpeed = tripsWithSpeed[tripsWithSpeed.length - 1].speed;
          newStats.fastestTripBySpeedRow = tripsWithSpeed[tripsWithSpeed.length - 1].row;
        }

        setStats(newStats);
        setIsAnalyzing(false);
      }, 10);

      return () => {
        clearTimeout(timeoutId);
        setIsAnalyzing(false);
      };
    }
  }, [rows, distanceUnit]);

  return [stats, isAnalyzing];
};