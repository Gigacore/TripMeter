import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';
import { formatDuration } from '../../utils/formatters';
import { DistanceUnit } from '../../App';

type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface DailyContribution {
  count: number;
  totalFare: { [currency: string]: number };
  totalDistance: number;
  totalWaitingTime: number;
  totalRidingTime: number;
}
interface ContributionGraphProps {
  data: { [key: string]: DailyContribution };
  view: 'last-12-months' | number;
  onDayClick?: (date: string) => void;
}

const LABEL_COLUMN_WIDTH = 'clamp(36px, 4vw, 64px)';
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const ContributionGraph: React.FC<ContributionGraphProps> = ({ data, view, onDayClick }) => {
  // TODO: This is a temporary solution. Ideally, distanceUnit and activeCurrency should be passed as props.
  const distanceUnit: DistanceUnit = 'miles';
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: React.ReactNode;
    x: number;
    y: number;
  }>({ visible: false, content: null, x: 0, y: 0 });

  const getLevel = (count: number): ContributionLevel => {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const levelColorMap: Record<ContributionLevel, string> = {
    0: 'bg-slate-100 dark:bg-slate-800',
    1: 'bg-blue-200 dark:bg-blue-900',
    2: 'bg-blue-400 dark:bg-blue-700',
    3: 'bg-blue-600 dark:bg-blue-500',
    4: 'bg-blue-800 dark:bg-blue-400',
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>, day: WeekCell) => {
    if (day.isPlaceholder || !day.date || !day.count) return;

    const dateStr = day.date;
    const dayStats = data[dateStr];
    const count = dayStats?.count ?? 0;
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });

    const content = (
      <div className="min-w-[250px] text-sm">
        <div className="mb-2 border-b border-slate-700 pb-2">
          <p className="font-bold text-base">{count} trip{count === 1 ? '' : 's'}</p>
          <p className="text-xs text-slate-400">{formattedDate}</p>
        </div>
        {dayStats && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="text-slate-400">Distance</div><div className="font-medium text-right">{dayStats.totalDistance.toFixed(2)} {distanceUnit}</div>
            <div className="text-slate-400">Riding Time</div><div className="font-medium text-right">{formatDuration(dayStats.totalRidingTime, true)}</div>
            <div className="text-slate-400">Waiting Time</div><div className="font-medium text-right">{formatDuration(dayStats.totalWaitingTime, true)}</div>
            {Object.entries(dayStats.totalFare).map(([currency, amount]) => (
              <React.Fragment key={currency}><div className="text-slate-400">Fare ({currency})</div><div className="font-medium text-right">{formatCurrency(amount, currency)}</div></React.Fragment>
            ))}
          </div>
        )}
      </div>
    );

    setTooltip({ visible: true, content, x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (tooltip.visible) {
      setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
    }
  };

  const handleClick = (day: WeekCell) => {
    if (!day.isPlaceholder && day.date && day.count && onDayClick) {
      onDayClick(day.date);
    }
  };

  const today = new Date();
  let startDate: Date;
  let endDate: Date;

  if (view === 'last-12-months') {
    endDate = new Date(today);
    startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setDate(startDate.getDate() + 1);
  } else {
    startDate = new Date(view, 0, 1);
    endDate = new Date(view, 11, 31);
  }

  const dayData: { date: string; count: number; level: ContributionLevel, stats: DailyContribution | null }[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const count = data[dateStr]?.count || 0;
    dayData.push({
      date: dateStr,
      count,
      level: getLevel(count),
      stats: data[dateStr] || null,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const firstDay = new Date(dayData[0].date).getDay();

  type WeekCell = {
    key: string;
    isPlaceholder: boolean;
    date?: string;
    count?: number;
    level?: ContributionLevel;
  };

  const weeks: WeekCell[][] = [];
  let currentWeek: WeekCell[] = Array.from({ length: firstDay }, (_, index) => ({
    key: `prefill-${index}`,
    isPlaceholder: true,
  }));

  dayData.forEach((day) => {
    currentWeek.push({
      key: day.date,
      isPlaceholder: false,
      date: day.date,
      count: day.count,
      level: day.level,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const index = currentWeek.length;
      currentWeek.push({
        key: `postfill-${weeks.length}-${index}`,
        isPlaceholder: true,
      });
    }
    weeks.push(currentWeek);
  }

  const monthLabels = React.useMemo(() => {
    const labels: { name: string, weekIndex: number }[] = [];
    let lastMonth = -1;
    dayData.forEach((day, index) => {
      const date = new Date(day.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        const weekIndex = Math.floor((firstDay + index) / 7);
        labels.push({ name: date.toLocaleString('default', { month: 'short' }), weekIndex });
        lastMonth = month;
      }
    });
    return labels;
  }, [dayData, firstDay]);

  return (
    <div className="relative p-4 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700" onMouseMove={handleMouseMove}>
      {tooltip.visible && (
        <div
          data-testid="contribution-tooltip"
          className="fixed rounded-lg border border-slate-700 bg-slate-800/80 p-4 text-slate-100 shadow-lg backdrop-blur-sm pointer-events-none z-20"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y + 15,
            transform: 'translate(-50%, -100%)',
            transition: 'opacity 0.2s',
            opacity: tooltip.visible ? 1 : 0,
          }}
        >
          {tooltip.content}
        </div>
      )}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `${LABEL_COLUMN_WIDTH} repeat(${weeks.length}, minmax(0, 1fr))` }}
      >
        {/* Spacer for weekday labels column */}
        <div />
        {monthLabels.map((label) => (
          <div
            key={label.name + label.weekIndex}
            className="text-xs text-slate-500 dark:text-slate-400"
            style={{ gridColumn: `${label.weekIndex + 2}` }}
          >
            {label.name}
          </div>
        ))}
      </div>
      <div className="grid gap-1 mt-2" style={{ gridTemplateColumns: `${LABEL_COLUMN_WIDTH} repeat(${weeks.length}, minmax(0, 1fr))` }}>
        <div className="grid grid-rows-7 gap-1">
          {WEEKDAY_LABELS.map((label, index) => (
            <div key={`weekday-${index}`} className="text-xs text-slate-500 dark:text-slate-400 text-center">
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-1">
            {week.map((day) => (
              <div
                key={day.key}
                data-testid={day.isPlaceholder ? 'placeholder-cell' : 'contribution-cell'}
                className={`aspect-square rounded-sm ${day.isPlaceholder ? 'bg-transparent' : `transition-transform duration-200 ease-in-out hover:scale-125 hover:shadow-lg hover:z-10 cursor-pointer ${levelColorMap[day.level ?? 0]}`
                  } `}
                onMouseEnter={(e) => handleMouseEnter(e, day)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(day)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionGraph;
