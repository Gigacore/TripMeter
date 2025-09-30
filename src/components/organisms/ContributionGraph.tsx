import React from 'react';

interface ContributionGraphProps {
  data: { [key: string]: number };
  view: 'last-12-months' | number;
}

const CELL_SIZE = 12;
const LABEL_COLUMN_WIDTH = 32;
const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const ContributionGraph: React.FC<ContributionGraphProps> = ({ data, view }) => {
  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const getTooltipText = (count: number, dateStr: string) => {
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
    return `${count} trip${count === 1 ? '' : 's'} on ${formattedDate}`;
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

  const dayData: { date: string; count: number; level: number }[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const count = data[dateStr] || 0;
    dayData.push({
      date: dateStr,
      count,
      level: getLevel(count),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const firstDay = new Date(dayData[0].date).getDay();

  type WeekCell = {
    key: string;
    isPlaceholder: boolean;
    date?: string;
    count?: number;
    level?: number;
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
    <div className="contribution-graph">
      <div
        className="contribution-graph-months"
        style={{ gridTemplateColumns: `${LABEL_COLUMN_WIDTH}px repeat(${weeks.length}, ${CELL_SIZE}px)` }}
      >
        <div className="contribution-graph-month contribution-graph-month--spacer" aria-hidden />
        {monthLabels.map((label) => (
          <div
            key={label.name + label.weekIndex}
            className="contribution-graph-month"
            style={{ gridColumn: label.weekIndex + 2 }}
          >
            {label.name}
          </div>
        ))}
      </div>
      <div
        className="contribution-graph-body"
        style={{ gridTemplateColumns: `${LABEL_COLUMN_WIDTH}px repeat(${weeks.length}, ${CELL_SIZE}px)` }}
      >
        <div className="contribution-graph-week contribution-graph-week-labels text-xs text-slate-500">
          {WEEKDAY_LABELS.map((label, index) => (
            <div key={`weekday-${index}`} className="contribution-graph-day">
              {label}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="contribution-graph-week">
            {week.map((day) => (
              <div
                key={day.key}
                className={`contribution-graph-day${day.isPlaceholder ? ' contribution-graph-day--placeholder' : ''}`}
                data-level={day.level}
                title={day.isPlaceholder || !day.date ? undefined : getTooltipText(day.count ?? 0, day.date)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionGraph;
