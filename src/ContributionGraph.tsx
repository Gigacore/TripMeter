import React from 'react';

interface ContributionGraphProps {
  data: { [key: string]: number };
  view: 'last-12-months' | number;
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({ data, view }) => {
  const getLevel = (count: number) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
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
  const emptyDays = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="contribution-graph-day" style={{ visibility: 'hidden' }} />);

  const weeks: JSX.Element[][] = [];
  let currentWeek: JSX.Element[] = [...emptyDays];

  dayData.forEach((day, index) => {
    currentWeek.push(
      <div
        key={day.date}
        className="contribution-graph-day"
        data-level={day.level}
        title={`${day.count} trips on ${new Date(day.date).toDateString()}`}
      />
    );

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
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
      <div className="contribution-graph-months">
        {monthLabels.map((label, index) => {
          const prevWeekIndex = index > 0 ? monthLabels[index - 1].weekIndex : 0;
          const weekSpan = label.weekIndex - prevWeekIndex;
          return (
            <div key={label.name + label.weekIndex} className="contribution-graph-month" style={{ flexGrow: weekSpan }}>
              {label.name}
            </div>
          );
        })}
      </div>
      <div className="contribution-graph-body">
        <div className="contribution-graph-week text-xs text-slate-500">
          <div className="contribution-graph-day" />
          <div className="contribution-graph-day">Mon</div>
          <div className="contribution-graph-day" />
          <div className="contribution-graph-day">Wed</div>
          <div className="contribution-graph-day" />
          <div className="contribution-graph-day">Fri</div>
          <div className="contribution-graph-day" />
        </div>
        {weeks.map((week, i) => <div key={i} className="contribution-graph-week">{week}</div>)}
      </div>
    </div>
  );
};

export default ContributionGraph;