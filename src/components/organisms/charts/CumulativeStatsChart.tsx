import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, TooltipProps, ReferenceArea } from 'recharts';
import { timeFormat } from 'd3-time-format';
import { CSVRow } from '@/services/csvParser';
import { DistanceUnit } from '@/App';
import { formatCurrency } from '@/utils/currency';

const formatDate = timeFormat('%b %d, %Y');

interface CustomCumulativeTooltipProps extends TooltipProps<number, string> {
  activeCurrency: string | null;
  distanceUnit: DistanceUnit;
  selectedData: {
    type: 'trips' | 'distance' | 'fare';
    value: number;
    startDate: Date;
    endDate: Date;
  } | null;
}

const CustomCumulativeTooltip: React.FC<CustomCumulativeTooltipProps> = ({ active, payload, activeCurrency, distanceUnit, selectedData }) => {
  const data = payload?.[0]?.payload;

  if (selectedData && selectedData.value > 0) {
    let valueDisplay: React.ReactNode;
    let label: string;

    switch (selectedData.type) {
      case 'trips':
        label = 'Trips';
        valueDisplay = selectedData.value.toLocaleString();
        break;
      case 'distance':
        label = 'Distance';
        valueDisplay = `${selectedData.value.toFixed(2)} ${distanceUnit}`;
        break;
      case 'fare':
        label = 'Fare';
        valueDisplay = activeCurrency ? formatCurrency(selectedData.value, activeCurrency) : '';
        break;
      default:
        return null;
    }

    return (
      <div className="min-w-[250px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">Selected Range</p>
        </div>
        <div className="grid grid-cols-[1fr,auto] gap-x-4 gap-y-1.5">
          <div className="text-slate-300 font-medium">{label}</div>
          <div className="font-medium text-right text-emerald-400">{valueDisplay}</div>
          <div className="text-slate-400 text-xs">From</div>
          <div className="font-medium text-right">{formatDate(selectedData.startDate)}</div>
          <div className="text-slate-400 text-xs">To</div>
          <div className="font-medium text-right">{formatDate(selectedData.endDate)}</div>
        </div>
      </div>
    );
  }

  if (active && data) {
    const { date, cumulativeTrips, cumulativeDistance, cumulativeFare } = data;
    let valueDisplay: React.ReactNode;
    let label: string;

    if (cumulativeTrips !== undefined) {
      label = 'Total Trips';
      valueDisplay = cumulativeTrips.toLocaleString();
    } else if (cumulativeDistance !== undefined) {
      label = 'Total Distance';
      valueDisplay = `${cumulativeDistance.toFixed(2)} ${distanceUnit}`;
    } else if (cumulativeFare !== undefined && activeCurrency) {
      label = 'Total Fare';
      valueDisplay = formatCurrency(cumulativeFare, activeCurrency);
    } else {
      return null;
    }

    return (
      <div className="min-w-[200px] rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-sm text-slate-100 shadow-lg backdrop-blur-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{formatDate(new Date(date))}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="text-slate-300 font-medium">{label}</div>
          <div className="font-medium text-right text-emerald-400">{valueDisplay}</div>
        </div>
      </div>
    );
  }
  return null;
};

interface CumulativeStatsChartProps {
  rows: CSVRow[];
  distanceUnit: DistanceUnit;
  activeCurrency: string | null;
  convertDistance: (miles: number) => number;
}

type Metric = 'trips' | 'distance' | 'fare';

const CumulativeStatsChart: React.FC<CumulativeStatsChartProps> = ({ rows, distanceUnit, activeCurrency, convertDistance }) => {
  const [metric, setMetric] = React.useState<Metric>('trips');

  const cumulativeData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];

    const completedTrips = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.request_time)
      .map(r => ({
        date: new Date(r.request_time),
        distance: r.distance ? convertDistance(parseFloat(r.distance)) : 0,
        fare: r.fare_currency === activeCurrency && r.fare_amount ? parseFloat(r.fare_amount) : 0,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (completedTrips.length === 0) return [];

    let cumulativeTrips = 0;
    let cumulativeDistance = 0;
    let cumulativeFare = 0;

    return completedTrips.map(trip => {
      cumulativeTrips++;
      cumulativeDistance += trip.distance;
      cumulativeFare += trip.fare;
      return { date: trip.date.getTime(), cumulativeTrips, cumulativeDistance, cumulativeFare };
    });
  }, [rows, activeCurrency, convertDistance]);

  const [selection, setSelection] = React.useState<{ start: number | null, end: number | null }>({ start: null, end: null });
  const [isSelecting, setIsSelecting] = React.useState(false);

  const handleMouseUp = () => setIsSelecting(false);
  const handleResetSelection = () => setSelection({ start: null, end: null });

  const handleMouseDown = (e: any) => {
    if (e) {
      setIsSelecting(true);
      setSelection({ start: e.activeLabel, end: e.activeLabel });
    }
  };

  const handleMouseMove = (e: any) => {
    if (isSelecting && e) {
      setSelection(prev => ({ ...prev, end: e.activeLabel }));
    }
  };

  const selectedData = React.useMemo(() => {
    if (!selection.start || !selection.end || !cumulativeData) return null;

    const [start, end] = [Math.min(selection.start, selection.end), Math.max(selection.start, selection.end)];
    const startPoint = cumulativeData.find(d => d.date >= start);
    const endPoint = [...cumulativeData].reverse().find(d => d.date <= end);

    if (startPoint && endPoint) {
      const startIndex = cumulativeData.indexOf(startPoint);
      const startValue = cumulativeData[startIndex - 1] || { cumulativeTrips: 0, cumulativeDistance: 0, cumulativeFare: 0 };

      let value = 0;
      if (metric === 'trips') value = endPoint.cumulativeTrips - startValue.cumulativeTrips;
      else if (metric === 'distance') value = endPoint.cumulativeDistance - startValue.cumulativeDistance;
      else if (metric === 'fare') value = endPoint.cumulativeFare - startValue.cumulativeFare;

      return { type: metric, value: value < 0 ? 0 : value, startDate: new Date(start), endDate: new Date(end) };
    }
    return null;
  }, [selection, cumulativeData, metric]);

  const metricOptions: { value: Metric; label: string; dataKey: keyof (typeof cumulativeData)[0]; color: string; disabled?: boolean }[] = [
    { value: 'trips', label: 'Trips', dataKey: 'cumulativeTrips', color: '#34d399' },
    { value: 'distance', label: `Distance (${distanceUnit})`, dataKey: 'cumulativeDistance', color: '#fb923c' },
    { value: 'fare', label: `Fare (${activeCurrency})`, dataKey: 'cumulativeFare', color: '#10b981', disabled: !activeCurrency },
  ];

  const activeMetric = metricOptions.find(m => m.value === metric)!;

  return (
    <div className="stats-group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-800/50 p-1">
          {metricOptions.map(option => (
            <button key={option.value} onClick={() => !option.disabled && setMetric(option.value)} disabled={option.disabled} className={`px-3 py-1.5 text-xs font-medium transition-colors rounded-md disabled:cursor-not-allowed disabled:opacity-50 ${metric === option.value ? 'bg-slate-700 text-slate-100' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}>
              {option.label}
            </button>
          ))}
        </div>
        {selection.start && (
          <button onClick={handleResetSelection} className="text-xs text-slate-400 hover:text-slate-100">Reset Selection</button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={cumulativeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
          <defs>
            <linearGradient id={`colorCumulative-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={activeMetric.color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} type="number" tickFormatter={(unixTime) => formatDate(new Date(unixTime))} />
          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number).toLocaleString()}`} />
          <Tooltip content={<CustomCumulativeTooltip activeCurrency={activeCurrency} distanceUnit={distanceUnit} selectedData={selectedData} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} isAnimationActive={false} />
          <Area type="monotone" dataKey={activeMetric.dataKey} stroke={activeMetric.color} fillOpacity={1} fill={`url(#colorCumulative-${metric})`} name={activeMetric.label} />
          {selection.start && selection.end && (
            <ReferenceArea x1={selection.start} x2={selection.end} strokeOpacity={0.3} fill={`${activeMetric.color}33`} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CumulativeStatsChart;