import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { tokenStore } from "./utils/tokenStore";

interface RefreshResponse {
  accessToken: string,
  refreshToken?: string,
}

const instance = axios.create({
  baseURL: "https://front-mission.bigs.or.kr",
  headers: {
    "Content-Type": "application/json",
  },
});

function applyAuthHeader(
  config: InternalAxiosRequestConfig,
  token: string
): InternalAxiosRequestConfig {
  if (!config.headers) {
    config.headers = new AxiosHeaders({ Authorization: `Bearer ${token}` });
    return config;
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  }

  (config.headers as Record<string, unknown>)["Authorization"] = `Bearer ${token}`;
  return config;
}

instance.interceptors.request.use(
  (config) => {
    const url = (config.url || "").toLowerCase();
    if (url.includes("/auth/refresh") || url.includes("/auth/login") || url.includes("/auth/signup")) {
      return config;
    }

    if (typeof window !== "undefined") {
      const accessToken = tokenStore.getAccess();
      if (accessToken) {
        config = applyAuthHeader(config, accessToken);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let subscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  subscribers.push(cb);
}

function onRefreshed(token: string | null) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean};
    if (status === 401) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) return reject(error);
            try {
              const cfg = originalRequest;
              applyAuthHeader(cfg, newToken);
              resolve(instance(cfg));
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    }
    if (!originalRequest._retry) {
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken =
          typeof window !== "undefined" ? tokenStore.getRefresh() : null;
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post<RefreshResponse>(
          "https://front-mission.bigs.or.kr/auth/refresh",
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

        if (!newAccessToken) throw new Error("No access token in refresh");

        tokenStore.setRespectActive(newAccessToken, newRefreshToken);

        onRefreshed(newAccessToken);
        applyAuthHeader(originalRequest, newAccessToken);
        return instance(originalRequest);
      } catch (refreshErr) {
        tokenStore.clear();
        onRefreshed(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
