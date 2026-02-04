import { useEffect, useState } from "react";
import type { Event } from "../events";
import { getEvents } from "../events";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Events</h2>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.name}-{event.date}-{event.time}
          </li>
        ))}
      </ul>
    </div>
  );
}
