import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, TooltipProps } from 'recharts';
import Stat from '../atoms/Stat';
import { CSVRow } from '../../services/csvParser';

interface CancellationBreakdownChartProps {
  rows: CSVRow[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc, entry) => acc + (entry.value as number), 0);
    return (
      <div className="min-w-[200px] rounded-lg border bg-background/80 p-4 text-sm text-foreground shadow-lg backdrop-blur-sm border-border">
        <p className="recharts-tooltip-label font-bold text-base mb-2 border-b border-border pb-2">{`Hour: ${label}:00`}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {payload.map(entry => (
            <React.Fragment key={entry.name}>
              <div style={{ color: entry.color }}>{entry.name}</div>
              <div className="font-medium text-right" style={{ color: entry.color }}>{entry.value?.toLocaleString()}</div>
            </React.Fragment>
          ))}
          <div className="text-muted-foreground border-t border-border/50 pt-1.5 mt-1">Total</div>
          <div className="font-medium text-right border-t border-border/50 pt-1.5 mt-1">{total.toLocaleString()}</div>
        </div>
      </div>
    );
  }
  return null;
};

const CancellationBreakdownChart: React.FC<CancellationBreakdownChartProps> = ({ rows }) => {
  const cancellationData = React.useMemo(() => {
    const hourlyCancellations: { [hour: number]: { rider: number; driver: number } } =
      Array.from({ length: 24 }, () => ({ rider: 0, driver: 0 }));

    rows.forEach(row => {
      const status = row.status?.toLowerCase();
      if ((status === 'rider_canceled' || status === 'driver_canceled') && row.request_time) {
        const date = new Date(row.request_time);
        if (!isNaN(date.getTime())) {
            const hour = date.getHours();
            if (status === 'rider_canceled') {
                hourlyCancellations[hour].rider++;
            } else {
                hourlyCancellations[hour].driver++;
            }
        }
      }
    });

    return Object.entries(hourlyCancellations).map(([hour, counts]) => ({
      hour: parseInt(hour, 10),
      riderCanceled: counts.rider,
      driverCanceled: counts.driver,
    }));
  }, [rows]);

  const hasData = cancellationData.some(d => d.riderCanceled > 0 || d.driverCanceled > 0);

  if (!hasData) {
    return <p className="text-muted-foreground text-sm mt-2">No cancellation data to display.</p>;
  }

  const totalRiderCanceled = cancellationData.reduce((sum, d) => sum + d.riderCanceled, 0);
  const totalDriverCanceled = cancellationData.reduce((sum, d) => sum + d.driverCanceled, 0);

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={cancellationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="hour" unit=":00" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
          <Bar
            dataKey="riderCanceled"
            stackId="a"
            fill="#f97316" // orange-500
            name="Rider Canceled"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="driverCanceled"
            stackId="a"
            fill="#ef4444" // red-500
            name="Driver Canceled"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 w-full mt-4">
        <Stat label="Rider Canceled" value={totalRiderCanceled} />
        <Stat label="Driver Canceled" value={totalDriverCanceled} />
      </div>
    </>
  );
};

export default CancellationBreakdownChart;