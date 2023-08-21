import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

export type MenuItem<TRoutes extends string> =
  | {
      type: "page";
      route: TRoutes;
      label: string;
      icon: React.ReactNode;
      content: React.ReactNode;
    }
  | {
      type: "header";
      label: string;
    }
  | {
      type: "divider";
    };

export const zEnv = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PUBLIC_URL: z.string().optional(),
  TZ: z.string().optional(),
  REACT_APP_PROXY_AUTH: z.string().default(""),
  REACT_APP_PROXY_BACKEND: z.string().default(""),
});

export const configure = <
  TRoutes extends [string, ...string[]],
  TRoutesEnum extends z.ZodEnum<TRoutes>
>(options: {
  routes: TRoutesEnum;
  menuItems: MenuItem<keyof TRoutes>[];
  env?: z.AnyZodObject;
  auth?: {
    enabled?: boolean;
  };
  backend?: {
    enabled?: boolean;
  };
}) => {
  const env = zEnv.merge(options.env ?? z.object({})).parse(process.env);

  function useNav() {
    const navigate = useNavigate();
    return {
      route: (route: TRoutes, query?: string) =>
        navigate(`${route}${query ? `/${query}` : ""}`),
      to: (route: string) => navigate(route),
      back: (count?: number) => navigate(count ?? -1),
    };
  }

  return {
    ...options,
    routes: options.routes.Values,
    env,
    useNavigate: useNav,
    useLocation,
  };
};

export default configure;
