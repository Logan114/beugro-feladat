import { useEffect, useState } from "react";
import { getEvents } from "./events";
import type { Event } from "./events";
import EventList from "./components/EventList";
import LoginForm from "./components/LoginForm";
import "./App.css";
import EventForm from "./components/EventForm";


function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  
  const loadEvents = async()=>{
    const data = await getEvents();
    setEvents(data)
  };

  useEffect(()=>{
    loadEvents();
  },[]);

  useEffect(() => {
    if (!loggedIn) return;
    loadEvents();

  }, [loggedIn]);

  if (!loggedIn) return <LoginForm onLogin={() => setLoggedIn(true)} />;

  return (
    <div>
      <h1>Your events:</h1>
      <EventList events={events} onDelete={loadEvents} />
      <EventForm onEventCreated={loadEvents} />
    </div>
  );
}

export default App;