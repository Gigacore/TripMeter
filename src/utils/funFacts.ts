
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
            textColor: "text-amber-700 dark:text-amber-300",
            baseFact: `Great Wall length: ${GREAT_WALL_MILES.toLocaleString()} miles`
        },
        {
            label: "US Coast to Coast",
            value: `${(totalDistanceMiles / US_COAST_TO_COAST_MILES).toFixed(2)}x`,
            description: "Trips across the United States",
            iconName: "Map",
            gradient: "from-blue-500/20 to-cyan-500/20",
            textColor: "text-blue-700 dark:text-blue-300",
            baseFact: `Coast to coast: ${US_COAST_TO_COAST_MILES.toLocaleString()} miles`
        },
        {
            label: "To the Moon",
            value: `${((totalDistanceMiles / DISTANCE_TO_MOON_MILES) * 100).toFixed(4)}%`,
            description: "Of the distance to the Moon",
            iconName: "Rocket",
            gradient: "from-slate-500/20 to-zinc-500/20",
            textColor: "text-slate-700 dark:text-slate-300",
            baseFact: `Distance to Moon: ${DISTANCE_TO_MOON_MILES.toLocaleString()} miles`
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
            textColor: "text-indigo-700 dark:text-indigo-300",
            baseFact: `Mission duration: ${APOLLO_11_HOURS} hours`
        },
        {
            label: "Bohemian Rhapsodies",
            value: `${(totalDurationMinutes / BOHEMIAN_RHAPSODY_MINUTES).toFixed(0)}`,
            description: "Times you could listen to the song",
            iconName: "Music",
            gradient: "from-pink-500/20 to-rose-500/20",
            textColor: "text-pink-700 dark:text-pink-300",
            baseFact: `Song duration: 5 mins 55 secs`
        },
        {
            label: "LOTR Extended Marathons",
            value: `${(totalDurationMinutes / LOTR_EXTENDED_MINUTES).toFixed(1)}`,
            description: "Trilogy marathons watched",
            iconName: "Film",
            gradient: "from-emerald-500/20 to-teal-500/20",
            textColor: "text-emerald-700 dark:text-emerald-300",
            baseFact: `Trilogy duration: 11 hours 23 mins`
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
            iconName: "Coffee",
            baseFact: `Coffee price: $${COFFEE_PRICE}`
        },
        {
            label: "iPhones",
            value: `${(totalFare / IPHONE_PRICE).toFixed(1)}`,
            description: "Latest iPhones",
            iconName: "Smartphone",
            baseFact: `iPhone price: $${IPHONE_PRICE}`
        },
        {
            label: "Tesla Model 3",
            value: `${((totalFare / TESLA_PRICE) * 100).toFixed(2)}%`,
            description: "Of a Tesla Model 3",
            iconName: "Car",
            baseFact: `Tesla price: $${TESLA_PRICE.toLocaleString()}`
        }
    ];
};

export const calculateSpeedFacts = (avgSpeedMph: number, slowestTripDurationHours: number = 0) => {
    const CHEETAH_SPEED = 75;
    const USAIN_BOLT_SPEED = 27.8;
    const SNAIL_SPEED = 0.03;

    const snailDistance = slowestTripDurationHours * SNAIL_SPEED;
    const snailDistanceStr = snailDistance < 0.1
        ? `${(snailDistance * 5280).toFixed(0)} ft`
        : `${snailDistance.toFixed(2)} miles`;

    return [
        {
            label: "Vs Cheetah",
            value: `${((avgSpeedMph / CHEETAH_SPEED) * 100).toFixed(1)}%`,
            description: "Of a cheetah's top speed",
            iconName: "Cat",
            gradient: "from-orange-500/20 to-yellow-500/20",
            textColor: "text-orange-700 dark:text-orange-300",
            baseFact: `Cheetah top speed: ${CHEETAH_SPEED} mph`
        },
        {
            label: "Vs Avg Speed",
            value: `${(avgSpeedMph / USAIN_BOLT_SPEED).toFixed(2)}x`,
            description: "Faster than Usain Bolt",
            iconName: "Zap",
            gradient: "from-yellow-500/20 to-amber-500/20",
            textColor: "text-yellow-700 dark:text-yellow-300",
            baseFact: `Usain Bolt top speed: ${USAIN_BOLT_SPEED} mph`
        },
        {
            label: "Snail Pace",
            value: snailDistanceStr,
            description: "Distance a snail covers during your slowest trip",
            iconName: "Snail",
            gradient: "from-green-500/20 to-emerald-500/20",
            textColor: "text-green-700 dark:text-green-300",
            baseFact: `Snail speed: ${SNAIL_SPEED} mph`
        }
    ];
};

export const calculateWaitingTimeFacts = (totalWaitingTimeMinutes: number) => {
    const TITANIC_MINUTES = 195;
    const FLIGHT_TO_LONDON_MINUTES = 420;
    const POWER_NAP_MINUTES = 20;

    return [
        {
            label: "Titanic Movie Viewings",
            value: `${(totalWaitingTimeMinutes / TITANIC_MINUTES).toFixed(1)}`,
            description: "Times you could watch Titanic",
            iconName: "Ship",
            gradient: "from-blue-500/20 to-indigo-500/20",
            textColor: "text-blue-700 dark:text-blue-300",
            baseFact: `Movie duration: 3 hours 15 mins`
        },
        {
            label: "Flights to London",
            value: `${(totalWaitingTimeMinutes / FLIGHT_TO_LONDON_MINUTES).toFixed(1)}`,
            description: "NYC to London flights",
            iconName: "Plane",
            gradient: "from-sky-500/20 to-cyan-500/20",
            textColor: "text-sky-700 dark:text-sky-300",
            baseFact: `Flight duration: ~7 hours`
        },
        {
            label: "Power Naps",
            value: `${(totalWaitingTimeMinutes / POWER_NAP_MINUTES).toFixed(0)}`,
            description: "Power naps you could have taken",
            iconName: "Moon",
            gradient: "from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20",
            textColor: "text-indigo-700 dark:text-indigo-300",
            baseFact: `Power nap: ${POWER_NAP_MINUTES} mins`
        }
    ];
};
