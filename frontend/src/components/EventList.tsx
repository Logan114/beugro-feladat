import { useEffect, useState } from "react";
import { deleteEvent, type Event } from "../events";
import { getEvents } from "../events";

interface Props{
  events: Event[];
  onDelete:()=>void;
}

export default function EventList({events,onDelete}:Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const handleDelete = async(id:number)=>{
    await deleteEvent(id)
    onDelete();
  }
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
            <button type="button" onClick={()=>handleDelete(event.id)}>Delete</button>

          </li>
        ))}
      </ul> 
    </div>
  );
}
