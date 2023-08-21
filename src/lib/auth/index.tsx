import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios, { AxiosError, AxiosInstance } from "axios";
import jwtDecode from "jwt-decode";
import moment from "moment";
import { z } from "zod";

import { Configuration, AuthenticationApi, AdminApi } from "./api";
import { sleepFn, isJsonMime } from "../utils";

export type StorageKey = "lastEnteredUsername" | "session";

export const zSession = z.object({
  userId: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type Session = z.infer<typeof zSession>;

export type ResponseError = AxiosError<{ code: string; message: string }>;

export interface AuthProps {
  storageKey?: string;
  baseUrl?: string;
  children: React.ReactNode;
}

// Holds the core auth context
export function Auth(props: AuthProps) {
  // Get storage key
  const getKey = useCallback(
    (key: StorageKey) => {
      return `${props?.storageKey || "dashboard"}.${key}`;
    },
    [props?.storageKey]
  );

  const [lastEnteredUsername, setLastEnteredUsername] = useState(() => {
    return localStorage.getItem(getKey("lastEnteredUsername")) ?? "";
  });
  const [session, setSession] = useState<Session | null>(() => {
    const item = localStorage.getItem(getKey("session"));
    const data = zSession.safeParse(JSON.parse(item ?? "{}"));
    return data.success ? data.data : null;
  });

  // Save session
  const saveSession = useCallback(
    (session: Session | null) => {
      setSession(session);
      if (session) {
        localStorage.setItem(getKey("session"), JSON.stringify(session));
      } else {
        localStorage.removeItem(getKey("session"));
      }
    },
    [getKey]
  );

  // Create axios instance
  const createAxiosInstance = useCallback(
    (options?: { ignoreAccessToken?: boolean }) => {
      const axiosInstance = axios.create();
      const accessToken = session?.accessToken;
      if (!options?.ignoreAccessToken && accessToken) {
        axiosInstance.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${accessToken}`;
          return config;
        });
      }
      return axiosInstance;
    },
    [session]
  );

  // Create API configuration
  const createApiConfiguration = useCallback(
    (options?: { ignoreAccessToken?: boolean }) => {
      const config: Configuration = {
        isJsonMime,
        basePath: props.baseUrl || undefined,
        accessToken: !options?.ignoreAccessToken
          ? session?.accessToken || undefined
          : undefined,
      };
      return config;
    },
    [props.baseUrl, session?.accessToken]
  );

  // Refresh token in background
  useEffect(() => {
    if (!session) {
      return;
    }
    const expiryThresholdMins = 30;
    const timer = setInterval(async () => {
      const decoded: any = jwtDecode(session.accessToken);
      if (decoded && typeof decoded.exp === "number") {
        const expiry = moment(decoded.exp * 1000);
        const isExpiring =
          expiry.diff(moment(), "minutes") <= expiryThresholdMins;
        if (isExpiring) {
          console.log("Renewing tokens...");
          // Do not use access token when renewing tokens since it can be expired
          const res = await new AuthenticationApi(
            createApiConfiguration({ ignoreAccessToken: true }),
            undefined,
            createAxiosInstance({ ignoreAccessToken: true })
          )
            .v1TokenPost({
              v1TokenPostRequestBody: {
                refreshToken: session.refreshToken,
              },
            })
            .catch(() => null);
          if (!res?.data.data) {
            console.error(`Failed to renew tokens: ${res?.data.code ?? "?"}`);
            return;
          }
          saveSession({
            userId: session.userId,
            ...res.data.data,
          });
          console.log("Renewed tokens");
        }
      }
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [session, saveSession, createApiConfiguration, createAxiosInstance]);

  return (
    <AuthContext.Provider
      value={{
        baseUrl: props.baseUrl,
        lastEnteredUsername,
        setLastEnteredUsername: (username) => {
          setLastEnteredUsername(username);
          if (username) {
            localStorage.setItem(getKey("lastEnteredUsername"), username);
          } else {
            localStorage.removeItem(getKey("lastEnteredUsername"));
          }
        },
        session: session ?? undefined,
        saveSession,
        createAxiosInstance,
        createApiConfiguration,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export interface LoggedInProps {
  children: React.ReactNode;
}

export function LoggedIn(props: LoggedInProps) {
  const { session } = useContext(AuthContext);

  return <>{!!session ? props.children : null}</>;
}

export interface LoggedOutProps {
  children: React.ReactNode;
}

export function LoggedOut(props: LoggedOutProps) {
  const { session } = useContext(AuthContext);

  return <>{!session ? props.children : null}</>;
}

// Hook to access auth related data
export function useAuth() {
  const {
    baseUrl,
    lastEnteredUsername,
    setLastEnteredUsername,
    session,
    saveSession,
    createAxiosInstance,
    createApiConfiguration,
  } = useContext(AuthContext);

  // Create admin api client
  const createAdminApi = useCallback(() => {
    return new AdminApi(
      createApiConfiguration(),
      undefined,
      createAxiosInstance()
    );
  }, [createApiConfiguration, createAxiosInstance]);

  // Create auth api client
  const createAuthApi = useCallback(() => {
    return new AuthenticationApi(
      createApiConfiguration(),
      undefined,
      createAxiosInstance()
    );
  }, [createApiConfiguration, createAxiosInstance]);

  // Signup new account by email and password
  const signupByEmailPw = useCallback(
    async (
      email: string,
      pw: string,
      options: {
        firstName?: string;
        lastName?: string;
        sleepMs?: number;
      }
    ) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1SignupEmailpwPost({
            v1SignupEmailpwPostRequestBody: {
              email,
              pw,
              firstName: options.firstName,
              lastName: options.lastName,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }
      return res.data.data;
    },
    [createAuthApi]
  );

  // Verify new signup by email
  const verifySignupByEmail = useCallback(
    async (
      email: string,
      code: string,
      options?: {
        sleepMs?: number;
      }
    ) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1SignupVerifyEmailPost({
            v1SignupVerifyEmailPostRequestBody: {
              email,
              code,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }
      return res.data.data;
    },
    [createAuthApi]
  );

  // Resend signup verification code by email
  const verifySignupResendByEmail = useCallback(
    async (
      email: string,
      options?: {
        sleepMs?: number;
      }
    ) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1SignupVerifyResendEmailPost({
            v1SignupVerifyResendEmailPostRequestBody: {
              email,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }
      return res.data.data;
    },
    [createAuthApi]
  );

  // Reset password by email
  const resetpwByEmail = useCallback(
    async (
      email: string,
      options?: {
        sleepMs?: number;
      }
    ) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1ResetpwEmailPost({
            v1ResetpwEmailPostRequestBody: {
              email,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }
      return res.data.data;
    },
    [createAuthApi]
  );

  // Verify resetpw account by email
  const verifyResetpwByEmail = useCallback(
    async (
      email: string,
      code: string,
      options?: {
        sleepMs?: number;
      }
    ) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1ResetpwVerifyEmailPost({
            v1ResetpwVerifyEmailPostRequestBody: {
              email,
              code,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }
      return res.data.data;
    },
    [createAuthApi]
  );

  // Verify resetpw account by email
  const setpw = useCallback(
    async (
      token: string,
      pw: string,
      options?: {
        sleepMs?: number;
      }
    ) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1SetpwPost({
            v1SetpwPostRequestBody: {
              token,
              pw,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }
      return res.data.data;
    },
    [createAuthApi]
  );

  // Login by email and password
  const loginByEmailPw = useCallback(
    async (
      email: string,
      pw: string,
      options?: {
        hasRoleNames?: string[];
        sleepMs?: number;
      }
    ) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1LoginPost({
            v1LoginPostRequestBody: {
              email,
              pw,
              hasRoleNames: options?.hasRoleNames,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }

      const session: Session = {
        userId: res.data.data.userId,
        accessToken: res.data.data.accessToken,
        refreshToken: res.data.data.refreshToken,
      };
      saveSession(session);

      return session;
    },
    [saveSession, createAuthApi]
  );

  // Login by username and password
  const loginByUsername = useCallback(
    async (
      username: string,
      pw: string,
      options?: {
        hasRoleNames?: string[];
        sleepMs?: number;
      }
    ) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1LoginPost({
            v1LoginPostRequestBody: {
              username,
              pw,
              hasRoleNames: options?.hasRoleNames,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }

      const session: Session = {
        userId: res.data.data.userId,
        accessToken: res.data.data.accessToken,
        refreshToken: res.data.data.refreshToken,
      };
      saveSession(session);

      return session;
    },
    [saveSession, createAuthApi]
  );

  // Logout current session
  const logout = useCallback(async () => {
    if (session) {
      createAuthApi()
        .v1LogoutPost({
          v1LogoutPostRequestBody: {
            refreshToken: session.refreshToken,
          },
        })
        // Ignore logout error
        .catch(() => null);
    }
    saveSession(null);
  }, [session, saveSession, createAuthApi]);

  // Change password
  const changepw = useCallback(
    async (oldPw: string, newPw: string, options?: { sleepMs?: number }) => {
      const sleepMs = options?.sleepMs ?? 1000;

      const res = await sleepFn(
        createAuthApi()
          .v1ChangepwPost({
            v1ChangepwPostRequestBody: {
              oldPw,
              newPw,
            },
          })
          .catch((err: ResponseError) => {
            throw new Error(
              err.response?.data.message ?? "An error has occurred"
            );
          }),
        sleepMs
      );
      if (res?.data.code !== "success") {
        throw new Error(res?.data.message ?? "An error has occurred");
      }
      return res.data.data;
    },
    [createAuthApi]
  );

  // Check if server is healthy
  const isHealthy = useCallback(async () => {
    if (!baseUrl) {
      return false;
    }
    const res = await axios.get(`${baseUrl}/health`).catch(() => null);
    return res?.status === 204;
  }, [baseUrl]);

  return useMemo(
    () => ({
      lastEnteredUsername,
      setLastEnteredUsername,
      session,
      signupByEmailPw,
      verifySignupByEmail,
      verifySignupResendByEmail,
      resetpwByEmail,
      verifyResetpwByEmail,
      setpw,
      loginByEmailPw,
      loginByUsername,
      logout,
      changepw,
      createAdminApi,
      isHealthy,
    }),
    [
      lastEnteredUsername,
      setLastEnteredUsername,
      session,
      signupByEmailPw,
      verifySignupByEmail,
      verifySignupResendByEmail,
      resetpwByEmail,
      verifyResetpwByEmail,
      setpw,
      loginByEmailPw,
      loginByUsername,
      logout,
      changepw,
      createAdminApi,
      isHealthy,
    ]
  );
}

export const AuthContext = createContext<{
  baseUrl?: string;
  lastEnteredUsername: string;
  setLastEnteredUsername: (lastEnteredUsername: string) => void;
  session?: Session;
  saveSession: (session: Session | null) => void;
  createAxiosInstance: () => AxiosInstance;
  createApiConfiguration: () => Configuration;
}>({
  lastEnteredUsername: "",
  setLastEnteredUsername: () => {},
  saveSession: () => {},
  createAxiosInstance: () => {
    return axios;
  },
  createApiConfiguration: () => ({ isJsonMime }),
});
