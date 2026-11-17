
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Prevent multiple simultaneous refresh requests.
let refreshPromise = null;

// Do not attempt refresh for these authentication endpoints.
const isAuthEndpoint = (url = "") => {
  return [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout",
  ].some((endpoint) => url.includes(endpoint));
};

// Attach access token to outgoing requests.
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired access tokens.
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    // No existing access token means there is no active local session
    // to refresh.
    const currentToken = localStorage.getItem("accessToken");

    if (!currentToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Share one refresh request between simultaneous failed requests.
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_BASE_URL.replace(/\/$/, "")}/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          .then((response) => {
            const newAccessToken = response.data?.accessToken;

            if (!newAccessToken) {
              throw new Error("Access token missing from refresh response");
            }

            localStorage.setItem("accessToken", newAccessToken);

            return newAccessToken;
          })
          .catch((refreshError) => {
            localStorage.removeItem("accessToken");

            window.dispatchEvent(
              new Event("auth:session-expired")
            );

            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      // Retry the original request with the new access token.
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
