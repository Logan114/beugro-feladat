import API from "./api";

export const login = async (email: string, password: string) => {
  const res = await API.post("/login", { email, password });
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("is_agent", String(res.data.is_agent ?? false));
  return res.data;
};

export const logout = async () => {
  await API.post("/logout");
  localStorage.removeItem("token");
};
