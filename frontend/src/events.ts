import API from "./api";

export interface Event {
  id: number;
  user_id: number;
  user_name: string;
  name?: string;
  date: string;
  time: string;
}

export type CreateEventPayload = Omit<Event, "id" | "user_id" | "user_name">;

export const getEvents = async (): Promise<Event[]> => {
  const res = await API.get("/events");
  return res.data;
};

export const createEvent = async (event: CreateEventPayload) => {
  const res = await API.post("/events", event);
  return res.data;
};


export const deleteEvent = async (id: number) => {
  const res = await API.delete(`/events/${id}`);
  return res.data;
};
