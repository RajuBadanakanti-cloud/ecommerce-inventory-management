import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() =>
    localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isAuthenticated = Boolean(user);

  // Keep AuthContext synchronized when Axios reports an expired session.
  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
      setError(false);
      setErrorMsg("");
      setLoading(false);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  // Verify an existing session when the application starts.
  useEffect(() => {
    let isActive = true;

    const verifyAuthentication = async () => {
      const storedToken = localStorage.getItem("accessToken");

      // A visitor without an access token is a guest.
      // Do not call /auth/me or show an authentication error.
      if (!storedToken) {
        if (isActive) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        // Axios response interceptor should refresh the token and retry
        // this request if the access token has expired.
        const response = await axiosInstance.get("/auth/me");

        if (!isActive) return;

        setUser(response.data.user);
        setToken(localStorage.getItem("accessToken"));
        setError(false);
        setErrorMsg("");
      } catch (err) {
        if (!isActive) return;

        if (err.response?.status === 401) {
          // The session is no longer valid after refresh handling.
          localStorage.removeItem("accessToken");
          setToken(null);
          setUser(null);
        } else {
          // A network/server error is not proof that the user is logged out.
          // Keep the stored token so the user can retry when the server returns.
          console.error("Authentication verification failed:", err);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    verifyAuthentication();

    return () => {
      isActive = false;
    };
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(false);
      setErrorMsg("");

      const response = await axiosInstance.post(
        "/auth/login",
        credentials
      );

      const data = response.data;

      localStorage.setItem("accessToken", data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);

      return true;
    } catch (err) {
      setError(true);
      setErrorMsg(
        err.response?.data?.message || "Login Error"
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userDetails) => {
    try {
      setLoading(true);
      setError(false);
      setErrorMsg("");

      const response = await axiosInstance.post(
        "/auth/register",
        userDetails
      );

      const data = response.data;

      localStorage.setItem("accessToken", data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);

      return true;
    } catch (err) {
      setError(true);
      setErrorMsg(
        err.response?.data?.message || "Registration Error"
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    let success = true;

    try {
      setLoading(true);
      setError(false);
      setErrorMsg("");

      await axiosInstance.post("/auth/logout");
    } catch (err) {
      success = false;
      setError(true);
      setErrorMsg(
        err.response?.data?.message ||
          "Something went wrong! Try again later."
      );
    } finally {
      // Always clear the local session when the user chooses to log out.
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
      setLoading(false);
    }

    return success;
  };

  const value = {
    user,
    token,
    loading,
    setLoading,
    error,
    setError,
    errorMsg,
    setErrorMsg,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin: user?.role === "admin",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
