import { useEffect, useState } from "react";
import { getEvents } from "./events";
import type { Event } from "./events";
import EventList from "./components/EventList";
import LoginForm from "./components/LoginForm";
import "./App.css";
import EventForm from "./components/EventForm";
import { Link, Route, Routes } from "react-router-dom";
import Agent from "./components/agent";
function App() {

  const [events, setEvents] = useState<Event[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);

  
  const loadEvents = async()=>{
    const data = await getEvents();
    setEvents(data)
  };

  useEffect(()=>{
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();
  },[]);

  useEffect(() => {
    if (!loggedIn) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();

  }, [loggedIn]);

  if (!loggedIn) return <LoginForm onLogin={() => setLoggedIn(true)} />;

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Your events:</h1>
              <EventList events={events} onDelete={loadEvents} />
              <EventForm onEventCreated={loadEvents} />
              <Link to="/agent">Support agent aveliable here</Link>
            </>
          }
        />
        <Route path="/agent" element={<Agent />} />
      </Routes>
    </div>
  );
}

export default App;
