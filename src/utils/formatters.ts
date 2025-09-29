// --- Helper Functions ---
export const formatDuration = (totalMinutes: number, includeSeconds = false): string => {
    if (totalMinutes < 0) return 'N/A';
    if (totalMinutes === 0) return '0 minutes';

    const MIN_PER_YEAR = 365.25 * 24 * 60;
    const MIN_PER_MONTH = 30.44 * 24 * 60;
    const MIN_PER_DAY = 24 * 60;
    const MIN_PER_HOUR = 60;

    let remainingMinutes = totalMinutes;

    const years = Math.floor(remainingMinutes / MIN_PER_YEAR);
    remainingMinutes %= MIN_PER_YEAR;
    const months = Math.floor(remainingMinutes / MIN_PER_MONTH);
    remainingMinutes %= MIN_PER_MONTH;
    const days = Math.floor(remainingMinutes / MIN_PER_DAY);
    remainingMinutes %= MIN_PER_DAY;
    const hours = Math.floor(remainingMinutes / MIN_PER_HOUR);
    remainingMinutes %= MIN_PER_HOUR;
    const minutes = Math.floor(remainingMinutes);
    const seconds = includeSeconds ? Math.floor((remainingMinutes - minutes) * 60) : 0;

    const parts = [
        years > 0 && `${years}y`,
        months > 0 && `${months}mo`,
        days > 0 && `${days}d`,
        hours > 0 && `${hours}h`,
        minutes > 0 && `${minutes}min`,
        seconds > 0 && `${seconds}s`
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' ') : '0min';
};

export const formatDurationWithSeconds = (totalMinutes: number): string => {
    if (totalMinutes < 0) return 'N/A';
    if (totalMinutes === 0) return '0 seconds';

    if (totalMinutes < 1) {
        const seconds = Math.round(totalMinutes * 60);
        return `${seconds}s`;
    }

    return formatDuration(totalMinutes, true);
}

export const toNumber = (x: any): number | null => {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
};