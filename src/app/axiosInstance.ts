import axios from "axios";

const instance = axios.create({
  baseURL: "https://front-mission.bigs.or.kr",
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post(
            "https://front-mission.bigs.or.kr/auth/refresh",
            { refreshToken }
          );
          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }
    }
    return Promise.reject(error);
  }
);

instance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      console.log("AccessToken from localStorage >>>", accessToken);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        console.log("Authorization header set >>>", config.headers.Authorization);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
