import { useEffect, useState } from "react";
import { getEvents } from "./events";
import type { Event } from "./events";
import EventList from "./components/EventList";
import LoginForm from "./components/LoginForm";
import "./App.css";
import EventForm from "./components/EventForm";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Agent from "./components/agent";
import AgentDashboard from "./components/AgentDashboard";

function App() {

  const [events, setEvents] = useState<Event[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const navigate = useNavigate();

  
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

  useEffect(() => {
    if (loggedIn && isAgent) {
      navigate("/agent/chats", { replace: true });
    }
  }, [loggedIn, isAgent, navigate]);

  if (!loggedIn)
    return (
      <LoginForm
        onLogin={({ isAgent: agent }) => {
          setLoggedIn(true);
          setIsAgent(agent);
        }}
      />
    );

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
              {isAgent ? (
                <Link to="/agent/chats">Helpdesk chats</Link>
              ) : (
                <Link to="/agent">Support agent aveliable here</Link>
              )}
            </>
          }
        />
        <Route path="/agent" element={<Agent />} />
        <Route
          path="/agent/chats"
          element={isAgent ? <AgentDashboard /> : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
