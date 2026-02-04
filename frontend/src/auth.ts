import API from "./api";

export const login = async (email: string, password: string) => {
  const res = await API.post("/login", { email, password });
  localStorage.setItem("token", res.data.token);
  return res.data;
};

export const logout = async () => {
  await API.post("/logout");
  localStorage.removeItem("token");
};
