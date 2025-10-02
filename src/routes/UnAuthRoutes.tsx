import { Navigate, Outlet } from "react-router-dom";
import React from "react";
import { getToken } from "../utills/auth";

const UnAuthRoutes: React.FC = () => {
  // const validUser: boolean | null = getToken(); // assuming getToken returns string or null
  const validUser: any = getToken()// assuming getToken returns string or null


  return validUser ? <Navigate to="/" /> : <Outlet />;
};

export default UnAuthRoutes;
