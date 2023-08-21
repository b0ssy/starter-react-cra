import React, { createContext, useContext, useCallback, useMemo } from "react";
import axios, { AxiosError, AxiosInstance } from "axios";

import { Configuration, AdminApi } from "./api";
import { isJsonMime } from "../utils";

export type ResponseError = AxiosError<{ code: string; message: string }>;

export interface BackendProps {
  baseUrl?: string;
  accessToken?: string;
  children: React.ReactNode;
}

// Holds the core backend context
export function Backend(props: BackendProps) {
  // Create axios instance
  const createAxiosInstance = useCallback(
    (options?: { ignoreAccessToken?: boolean }) => {
      const axiosInstance = axios.create();
      const accessToken = props.accessToken;
      if (!options?.ignoreAccessToken && accessToken) {
        axiosInstance.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${accessToken}`;
          return config;
        });
      }
      return axiosInstance;
    },
    [props.accessToken]
  );

  // Create API configuration
  const createApiConfiguration = useCallback(
    (options?: { ignoreAccessToken?: boolean }) => {
      const config: Configuration = {
        isJsonMime,
        basePath: props.baseUrl || undefined,
        accessToken: !options?.ignoreAccessToken
          ? props.accessToken || undefined
          : undefined,
      };
      return config;
    },
    [props.baseUrl, props.accessToken]
  );

  return (
    <BackendContext.Provider
      value={{
        baseUrl: props.baseUrl,
        createAxiosInstance,
        createApiConfiguration,
      }}
    >
      {props.children}
    </BackendContext.Provider>
  );
}

// Hook to access backend related data
export function useBackend() {
  const { baseUrl, createAxiosInstance, createApiConfiguration } =
    useContext(BackendContext);

  // Create admin api client
  const createAdminApi = useCallback(() => {
    return new AdminApi(
      createApiConfiguration(),
      undefined,
      createAxiosInstance()
    );
  }, [createApiConfiguration, createAxiosInstance]);

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
      createAdminApi,
      isHealthy,
    }),
    [createAdminApi, isHealthy]
  );
}

const BackendContext = createContext<{
  baseUrl?: string;
  createAxiosInstance: () => AxiosInstance;
  createApiConfiguration: () => Configuration;
}>({
  createAxiosInstance: () => axios,
  createApiConfiguration: () => ({ isJsonMime }),
});
