import { lazy } from "react";
import type { ReactNode } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import UnAuthRoutes from "./UnAuthRoutes";
import AuthRoutes from "./AuthRoutes";
import Loadable from "../components/Loadable";
import MainLayout from "../layout/MainLayout";

const Login = Loadable(lazy(() => import("../pages/login")));
const Home = Loadable(lazy(() => import("../pages/home")));
const Companies = Loadable(lazy(() => import("../pages/companies")));
const Profile = Loadable(lazy(() => import("../pages/profile")));
const History = Loadable(lazy(() => import("../pages/history")));
const Configure = Loadable(lazy(() => import("../pages/configure")));

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
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/home" />,
          },
          {
            path: "home",
            element: <Home />,
          },
          {
            path: "companies",
            element: <Companies />,
          },
          {
            path: "history",
            element: <History />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "configure",
            element: <Configure />,
          },
        ],
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
