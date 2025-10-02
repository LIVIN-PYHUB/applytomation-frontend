import { Navigate, Outlet } from "react-router-dom";
import React from "react";
import { getToken } from "../utills/auth";

const AuthRoutes: React.FC = () => {
  // const validUser: string | null = getToken(); // assuming getToken returns string or null
  const validUser: any =  getToken() // assuming getToken returns string or null


  return validUser ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthRoutes;
