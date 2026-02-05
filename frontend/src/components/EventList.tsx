import { deleteEvent, type Event } from "../events";
import { Container } from "react-bootstrap";


interface Props{
  events: Event[];
  onDelete:()=>void;
}

export default function EventList({events, onDelete}:Props) {
  const handleDelete = async(id:number)=>{
    await deleteEvent(id)
    onDelete();
  }


  return (
    <Container className="py-3">
      <div className="table-responsive">
        <h2>Events</h2>
        <table className="table table-hover">
        <thead>
          <tr>
            <th>Event name</th>
            <th>Event date</th>
            <th>Event time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.name}</td>
              <td>{event.date}</td>
              <td>{event.time}</td>
              <td>
                <button type="button" onClick={() => handleDelete(event.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </Container>
  );
}
