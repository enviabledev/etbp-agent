import Cookies from "js-cookie";
import api from "./api";

export async function login(email: string, password: string) {
  const { data } = await api.post("/api/v1/auth/login", { email, password });
  Cookies.set("agent_access_token", data.access_token, { expires: 1 });
  Cookies.set("agent_refresh_token", data.refresh_token, { expires: 30 });
  return data;
}

export async function logout() {
  const rt = Cookies.get("agent_refresh_token");
  try { if (rt) await api.post("/api/v1/auth/logout", { refresh_token: rt }); } catch {}
  Cookies.remove("agent_access_token");
  Cookies.remove("agent_refresh_token");
}

export function isAuthenticated() {
  return !!Cookies.get("agent_access_token");
}
