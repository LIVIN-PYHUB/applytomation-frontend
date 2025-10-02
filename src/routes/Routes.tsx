import { lazy } from "react";
import type { ReactNode } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import UnAuthRoutes from "./UnAuthRoutes";
import AuthRoutes from "./AuthRoutes";
import Loadable from "../components/Loadable";

const Login = Loadable(lazy(() => import("../pages/login")));

const routes: RouteObject[] = [
  {
    path: "",
    element: <UnAuthRoutes />,
    children: [{ path: "/login", element: <Login /> }],
  },
  {
    path: "/",
    element: <AuthRoutes />,
    children: [
      {
        index: true,
        element: (
          <>
            <div className="text-black">Main Layout</div>
          </>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/page/404" />,
  },
];

export default function Routes(): ReactNode {
  return useRoutes(routes);
}
