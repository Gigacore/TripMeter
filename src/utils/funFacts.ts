
export const calculateDistanceFacts = (totalDistanceMiles: number) => {
    const EARTH_CIRCUMFERENCE_MILES = 24901;
    const DISTANCE_TO_MOON_MILES = 238855;
    const GREAT_WALL_MILES = 13171;
    const US_COAST_TO_COAST_MILES = 2800;

    return [
        {
            label: "Great Wall of China",
            value: `${(totalDistanceMiles / GREAT_WALL_MILES).toFixed(2)}x`,
            description: "Lengths of the Great Wall covered",
            iconName: "Landmark",
            gradient: "from-amber-500/20 to-orange-500/20",
            textColor: "text-amber-700 dark:text-amber-300"
        },
        {
            label: "US Coast to Coast",
            value: `${(totalDistanceMiles / US_COAST_TO_COAST_MILES).toFixed(2)}x`,
            description: "Trips across the United States",
            iconName: "Map",
            gradient: "from-blue-500/20 to-cyan-500/20",
            textColor: "text-blue-700 dark:text-blue-300"
        },
        {
            label: "To the Moon",
            value: `${((totalDistanceMiles / DISTANCE_TO_MOON_MILES) * 100).toFixed(4)}%`,
            description: "Of the distance to the Moon",
            iconName: "Rocket",
            gradient: "from-slate-500/20 to-zinc-500/20",
            textColor: "text-slate-700 dark:text-slate-300"
        }
    ];
};

export const calculateDurationFacts = (totalDurationMinutes: number) => {
    const APOLLO_11_HOURS = 195;
    const BOHEMIAN_RHAPSODY_MINUTES = 5.91; // 5:55
    const LOTR_EXTENDED_MINUTES = 683; // 11h 23m

    const totalHours = totalDurationMinutes / 60;

    return [
        {
            label: "Apollo 11 Missions",
            value: `${(totalHours / APOLLO_11_HOURS).toFixed(2)}`,
            description: "Full lunar missions completed",
            iconName: "Rocket",
            gradient: "from-indigo-500/20 to-purple-500/20",
            textColor: "text-indigo-700 dark:text-indigo-300"
        },
        {
            label: "Bohemian Rhapsodies",
            value: `${(totalDurationMinutes / BOHEMIAN_RHAPSODY_MINUTES).toFixed(0)}`,
            description: "Times you could listen to the song",
            iconName: "Music",
            gradient: "from-pink-500/20 to-rose-500/20",
            textColor: "text-pink-700 dark:text-pink-300"
        },
        {
            label: "LOTR Marathons",
            value: `${(totalDurationMinutes / LOTR_EXTENDED_MINUTES).toFixed(1)}`,
            description: "Extended edition marathons watched",
            iconName: "Film",
            gradient: "from-emerald-500/20 to-teal-500/20",
            textColor: "text-emerald-700 dark:text-emerald-300"
        }
    ];
};

export const calculateFareFacts = (totalFare: number) => {
    const COFFEE_PRICE = 5;
    const IPHONE_PRICE = 999;
    const TESLA_PRICE = 40000;

    return [
        {
            label: "Coffees",
            value: `${(totalFare / COFFEE_PRICE).toFixed(0)}`,
            description: "Cups of fancy coffee",
            iconName: "Coffee"
        },
        {
            label: "iPhones",
            value: `${(totalFare / IPHONE_PRICE).toFixed(1)}`,
            description: "Latest iPhones",
            iconName: "Smartphone"
        },
        {
            label: "Tesla Model 3",
            value: `${((totalFare / TESLA_PRICE) * 100).toFixed(2)}%`,
            description: "Of a Tesla Model 3",
            iconName: "Car"
        }
    ];
};

export const calculateSpeedFacts = (avgSpeedMph: number) => {
    const CHEETAH_SPEED = 75;
    const USAIN_BOLT_SPEED = 27.8;
    const SNAIL_SPEED = 0.03;

    return [
        {
            label: "Vs Cheetah",
            value: `${((avgSpeedMph / CHEETAH_SPEED) * 100).toFixed(1)}%`,
            description: "Of a cheetah's top speed",
            iconName: "Cat"
        },
        {
            label: "Vs Usain Bolt",
            value: `${(avgSpeedMph / USAIN_BOLT_SPEED).toFixed(2)}x`,
            description: "Faster than Usain Bolt",
            iconName: "PersonRunning"
        }
    ];
};

export const calculateTripFacts = (totalTrips: number) => {
    const BUS_CAPACITY = 50;
    const STADIUM_CAPACITY = 50000;

    return [
        {
            label: "Bus Loads",
            value: `${(totalTrips / BUS_CAPACITY).toFixed(1)}`,
            description: "Full buses of passengers",
            iconName: "Bus"
        },
        {
            label: "Stadiums",
            value: `${(totalTrips / STADIUM_CAPACITY).toFixed(4)}`,
            description: "Stadiums filled",
            iconName: "Landmark"
        }
    ];
};
