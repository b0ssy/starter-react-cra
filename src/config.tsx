import { ChartBarIcon as DashboardIcon } from "@heroicons/react/24/outline";
import { z } from "zod";

import Dashboard from "./containers/pages/Dashboard";
import { configure } from "./lib/config";

export const CONFIG = configure({
  routes: z.enum([
    "/",
    "/login",
    "/signup",
    "/signup/verify",
    "/resetpw",
    "/resetpw/verify",
    "/setpw",
  ]),
  menuItems: [
    {
      type: "page",
      route: "/",
      label: "Dashboard",
      icon: <DashboardIcon className="w-5 h-5" />,
      content: <Dashboard />,
    },
  ],
});
