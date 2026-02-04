import { useEffect, useState } from "react";
import { getEvents } from "./events";
import type { Event } from "./events";
import EventList from "./components/EventList";
import LoginForm from "./components/LoginForm";
import "./App.css";

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!loggedIn) return;

    const load = async () => {
      const data = await getEvents();
      setEvents(data);
      setUsername(data[0]?.user_name ?? "");
    };

    void load();
  }, [loggedIn]);

  if (!loggedIn) return <LoginForm onLogin={() => setLoggedIn(true)} />;

  return (
    <div>
      <h1>{username ? `${username}'s events` : "Events"}</h1>
      <EventList />
    </div>
  );
}

export default App;
