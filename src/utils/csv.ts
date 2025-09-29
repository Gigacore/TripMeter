export const normalizeHeaders = (hdrs: string[]): { [key: string]: number } | null => {
    const idx: { [key: string]: number } = {};
    hdrs.forEach((h, i) => idx[h.trim().toLowerCase()] = i);
    const req = ['begintrip_lat', 'begintrip_lng', 'dropoff_lat', 'dropoff_lng'];
    for (const k of req) {
        if (!(k in idx)) return null;
    }
    return idx;
};