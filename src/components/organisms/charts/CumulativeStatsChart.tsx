import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, TooltipProps, ReferenceArea } from 'recharts';
import { timeFormat } from 'd3-time-format';
import { CSVRow } from '@/services/csvParser';
import { DistanceUnit } from '@/App';
import { formatCurrency } from '@/utils/currency';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatDate = timeFormat('%b %d, %Y');

interface CustomCumulativeTooltipProps extends TooltipProps<number, string> {
  activeCurrency: string | null;
  distanceUnit: DistanceUnit;
  selectedData: {
    trips: number;
    distance: number;
    fare: number;
    startDate: Date;
    endDate: Date;
  } | null;  
  view: 'all' | 'trips' | 'distance' | 'fare';
}

const CustomCumulativeTooltip: React.FC<CustomCumulativeTooltipProps> = ({ active, payload, activeCurrency, distanceUnit, selectedData, view }) => {
  if (selectedData && (selectedData.trips > 0 || selectedData.distance > 0 || selectedData.fare > 0)) {
    return (
      <div className="min-w-[250px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">Selected Range</p>
        </div>
        <div className="grid grid-cols-[1fr,auto] gap-x-4 gap-y-1.5">
          <div className="text-muted-foreground font-medium">Trips</div>
          <div className="font-medium text-right text-emerald-400">{selectedData.trips.toLocaleString()}</div>
          <div className="text-muted-foreground font-medium">Distance</div>
          <div className="font-medium text-right text-orange-400">{selectedData.distance.toFixed(2)} {distanceUnit}</div>
          {activeCurrency && (
            <>
              <div className="text-muted-foreground font-medium">Fare</div>
              <div className="font-medium text-right text-emerald-400">{formatCurrency(selectedData.fare, activeCurrency)}</div>
            </>
          )}
          <div className="text-muted-foreground text-xs">From</div>
          <div className="font-medium text-right">{formatDate(selectedData.startDate)}</div>
          <div className="text-muted-foreground text-xs">To</div>
          <div className="font-medium text-right">{formatDate(selectedData.endDate)}</div>
        </div>
      </div>
    );
  }

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { date, cumulativeTrips, cumulativeDistance, cumulativeFare } = data;    
    
    let valueDisplay: React.ReactNode;
    let label: string;

    if (view === 'trips') {
      label = 'Total Trips';
      valueDisplay = cumulativeTrips.toLocaleString();
    } else if (view === 'distance') {
      label = 'Total Distance';
      valueDisplay = `${cumulativeDistance.toFixed(2)} ${distanceUnit}`;
    } else if (view === 'fare' && activeCurrency) {
      label = 'Total Fare';
      valueDisplay = formatCurrency(cumulativeFare, activeCurrency);
    }

    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <div className="mb-2 border-b border-border pb-2">
          <p className="recharts-tooltip-label font-bold text-base">{formatDate(new Date(date))}</p>
        </div>
        {view === 'all' ? (
          <div className="grid grid-cols-[1fr,auto] gap-x-4 gap-y-1.5">
            <div className="text-muted-foreground font-medium">Total Trips</div><div className="font-medium text-right text-emerald-400">{cumulativeTrips.toLocaleString()}</div>
            <div className="text-muted-foreground font-medium">Total Distance</div><div className="font-medium text-right text-orange-400">{cumulativeDistance.toFixed(2)} {distanceUnit}</div>
            {activeCurrency && <><div className="text-muted-foreground font-medium">Total Fare</div><div className="font-medium text-right text-emerald-400">{formatCurrency(cumulativeFare, activeCurrency)}</div></>}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="text-muted-foreground font-medium">{label}</div>
            <div className="font-medium text-right text-emerald-400">{valueDisplay}</div>
          </div>
        )}
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

const CumulativeStatsChart: React.FC<CumulativeStatsChartProps> = ({ rows, distanceUnit, activeCurrency, convertDistance }) => {
  const [view, setView] = React.useState<'all' | 'trips' | 'distance' | 'fare'>('all');

  const cumulativeData = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];

    const completedTrips = rows
      .filter(r => r.status?.toLowerCase() === 'completed' && r.request_time && (!activeCurrency || r.fare_currency === activeCurrency))
      .map(r => ({
        date: new Date(r.request_time),
        distance: r.distance ? convertDistance(parseFloat(r.distance)) : 0,
        // Fare is already filtered by the main filter, but we keep this for safety and clarity
        fare: (r.fare_currency === activeCurrency && r.fare_amount) ? parseFloat(r.fare_amount) : 0,
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

      const trips = endPoint.cumulativeTrips - startValue.cumulativeTrips;
      const distance = endPoint.cumulativeDistance - startValue.cumulativeDistance;
      const fare = endPoint.cumulativeFare - startValue.cumulativeFare;

      return {
        trips: trips < 0 ? 0 : trips,
        distance: distance < 0 ? 0 : distance,
        fare: fare < 0 ? 0 : fare,
        startDate: new Date(start),
        endDate: new Date(end)
      };
    }
    return null;
  }, [selection, cumulativeData]);

  const metrics = [
    { dataKey: 'cumulativeTrips', color: '#34d399', yAxisId: 'trips', name: 'Trips' },
    { dataKey: 'cumulativeDistance', color: '#fb923c', yAxisId: 'distance', name: `Distance (${distanceUnit})` },
    { dataKey: 'cumulativeFare', color: '#818cf8', yAxisId: 'fare', name: `Fare (${activeCurrency})`, disabled: !activeCurrency },
  ];

  const activeMetric = metrics.find(m => m.yAxisId === view);

  return (
    <div className="stats-group">
      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="distance">Distance</TabsTrigger>
            <TabsTrigger value="fare" disabled={!activeCurrency}>Fare</TabsTrigger>
          </TabsList>
          {selection.start && (
            <button onClick={handleResetSelection} className="text-xs text-muted-foreground hover:text-foreground">Reset Selection</button>
          )}
        </div>
        <TabsContent value="all">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumulativeData} margin={{ top: 10, right: 50, left: 20, bottom: 0 }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
              <defs>
                {metrics.map(m => (
                  <linearGradient key={m.dataKey} id={`colorCumulative-${m.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={m.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={m.color} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} type="number" tickFormatter={(unixTime) => formatDate(new Date(unixTime))} />
              <YAxis yAxisId="trips" stroke={metrics[0].color} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number).toLocaleString()}`} />
              <YAxis yAxisId="distance" orientation="right" stroke={metrics[1].color} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number).toLocaleString()}`} />
              {activeCurrency && <YAxis yAxisId="fare" orientation="right" stroke={metrics[2].color} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number, activeCurrency)} style={{ transform: 'translateX(50px)' }} />}
              <Tooltip content={<CustomCumulativeTooltip activeCurrency={activeCurrency} distanceUnit={distanceUnit} selectedData={selectedData} view={view} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} isAnimationActive={false} />
              {metrics.map(m => !m.disabled && <Area key={m.dataKey} yAxisId={m.yAxisId} type="monotone" dataKey={m.dataKey} stroke={m.color} fillOpacity={1} fill={`url(#colorCumulative-${m.dataKey})`} name={m.name} isAnimationActive={view === 'all'} />)}
              {selection.start && selection.end && (
                <ReferenceArea x1={selection.start} x2={selection.end} strokeOpacity={0.3} fill="#8884d8" fillOpacity={0.2} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
        {metrics.map(metric => (
          <TabsContent key={metric.yAxisId} value={metric.yAxisId}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cumulativeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
                <defs>
                  <linearGradient id={`colorCumulative-${metric.yAxisId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin', 'dataMax']} type="number" tickFormatter={(unixTime) => formatDate(new Date(unixTime))} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value as number).toLocaleString()}`} />
                <Tooltip content={<CustomCumulativeTooltip activeCurrency={activeCurrency} distanceUnit={distanceUnit} selectedData={selectedData} view={view} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} isAnimationActive={false} />
                <Area type="monotone" dataKey={metric.dataKey} stroke={metric.color} fillOpacity={1} fill={`url(#colorCumulative-${metric.yAxisId})`} name={metric.name} isAnimationActive={false} />
                {selection.start && selection.end && (
                  <ReferenceArea x1={selection.start} x2={selection.end} strokeOpacity={0.3} fill={`${metric.color}33`} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CumulativeStatsChart;
