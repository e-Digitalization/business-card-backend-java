import React from 'react';
import { isUpcomingEvent, parseEventDate } from '../utils/cardCategories.js';

const part = (date, options) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options }).format(date);

// Calendar-style date tile: month band, big day number, year. Upcoming events use the accent colour.
// Free-text dates that can't be parsed (e.g. "Q4 2026") fall back to a simple label.
const EventDateTile = ({ value, size = 'md' }) => {
  const date = parseEventDate(value);
  const upcoming = isUpcomingEvent(value);
  if (!date) {
    return value ? <span className="km-event-date-text">{value}</span> : null;
  }
  return (
    <time
      className={`km-date-tile km-date-tile--${size} ${upcoming ? 'is-upcoming' : ''}`}
      dateTime={String(value).trim()}
      aria-label={part(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
    >
      <span className="km-date-tile-month">{part(date, { month: 'short' })}</span>
      <span className="km-date-tile-day">{part(date, { day: 'numeric' })}</span>
      <span className="km-date-tile-year">{part(date, { year: 'numeric' })}</span>
    </time>
  );
};

export default EventDateTile;
