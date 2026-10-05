import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { TrackingEvent } from '../../types/shipment';

interface TrackingTimelineProps {
  events: TrackingEvent[];
}

export default function TrackingTimeline({ events }: TrackingTimelineProps) {
  return (
    <div className="timeline">
      {events.map((ev, i) => {
        const isDone    = !ev.upcoming && !ev.current;
        const isCurrent = !!ev.current;
        const isLast    = i === events.length - 1;

        return (
          <div key={i} className="timeline-item">
            <div className="timeline-connector">
              <div className={`timeline-dot ${isDone ? 'done' : isCurrent ? 'current' : 'upcoming'}`}>
                {isDone
                  ? <CheckCircle2 size={12} color="#fff" />
                  : isCurrent
                    ? <Clock size={12} color="#fff" />
                    : <Circle size={10} color="#d1d5db" />}
              </div>
              {!isLast && (
                <div className={`timeline-line ${isDone ? 'done' : 'upcoming'}`} />
              )}
            </div>
            <div className="timeline-content">
              <p className={`timeline-status ${ev.upcoming && !ev.current ? 'upcoming' : ''}`}>
                {ev.status}
              </p>
              {ev.location && ev.location !== '—' && (
                <p className="timeline-location">{ev.location}</p>
              )}
              {ev.time && <p className="timeline-time">{ev.time}</p>}
              {!ev.time && !ev.upcoming && <p className="timeline-time">—</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
