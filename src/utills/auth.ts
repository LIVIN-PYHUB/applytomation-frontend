import Cookies from "js-cookie";

export const setToken = (token: string, path: string = "/") => {
  Cookies.set("token", token, { path });
};

export const getToken = (): string | null => {
  const cookieToken = Cookies.get("token");
  return cookieToken || null;
};

export const removeToken = (path: string = "/") => {
  Cookies.remove("token", { path });
 
};