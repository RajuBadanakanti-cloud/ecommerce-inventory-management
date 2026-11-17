import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() =>
    localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isAuthenticated = !!user;

  // Keep AuthContext synchronized when refresh fails
  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
    };

    window.addEventListener(
      "auth:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  // Verify authentication on application startup
  useEffect(() => {
    let isActive = true;

    const verifyAuthentication = async () => {
      try {
        setLoading(true);

        // Axios automatically attempts refresh if this request returns 401
        const response = await axiosInstance.get("/auth/me");

        if (isActive) {
          setUser(response.data.user);
          setToken(localStorage.getItem("accessToken"));
        }
      } catch (err) {
        if (!isActive) return;

        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          setToken(null);
          setUser(null);
        } else {
          setError(true);
          setErrorMsg("Unable to verify authentication");
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

      const res = await axiosInstance.post(
        "/auth/login",
        credentials
      );

      const data = res.data;

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

      const res = await axiosInstance.post("/auth/register", userDetails);

      const data = res.data;

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
      // Always clear local session when the user chooses logout
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
      setLoading(false);
    }

    return success;
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
