import type { Todo } from '../../shared/types';

interface CalendarViewProps {
  displayedMonth: Date;
  selectedDate: string;
  todos: Todo[];
  onPreviousMonth(): void;
  onNextMonth(): void;
  onSelectDate(date: string): void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const CALENDAR_CELL_COUNT = 42;

function formatCalendarDate(
  year: number,
  month: number,
  day: number,
): string {
  const paddedMonth = String(month + 1).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');

  return `${year}-${paddedMonth}-${paddedDay}`;
}

export function CalendarView({
  displayedMonth,
  selectedDate,
  todos,
  onPreviousMonth,
  onNextMonth,
  onSelectDate,
}: CalendarViewProps) {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayDate = formatCalendarDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const calendarDays = Array.from(
    { length: CALENDAR_CELL_COUNT },
    (_, index) => {
      const day = index - firstWeekday + 1;
      return day >= 1 && day <= daysInMonth ? day : null;
    },
  );

  return (
    <div className="calendar-view">
      <div className="calendar-toolbar">
        <button
          type="button"
          onClick={onPreviousMonth}
          aria-label="이전 달"
        >
          ‹
        </button>
        <strong>{year}년 {month + 1}월</strong>
        <button type="button" onClick={onNextMonth} aria-label="다음 달">
          ›
        </button>
      </div>

      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <span key={`empty-${index}`} aria-hidden="true" />;
          }

          const date = formatCalendarDate(year, month, day);
          const isSelected = date === selectedDate;
          const isToday = date === todayDate;
          const hasTodo = todos.some((todo) => todo.remindDate === date);
          const className = [
            'calendar-day',
            isSelected ? 'is-selected' : '',
            isToday ? 'is-today' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={date}
              type="button"
              className={className}
              onClick={() => onSelectDate(date)}
              aria-label={`${date}${hasTodo ? ', 일정 있음' : ''}`}
            >
              <span>{day}</span>
              {hasTodo && <span className="calendar-todo-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
