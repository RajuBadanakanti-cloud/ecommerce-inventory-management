import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ShoppingBag,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  User,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const {
    login,
    logout,
    user,
    error,
    setError,
    errorMsg,
    setErrorMsg,
    loading,
  } = useAuth();

  const navigate = useNavigate();

  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
  });

  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(false);
    setErrorMsg("");

    const success = await login(formDetails);
    console.log("Login Status :", success)
    if(success) {
      setLoginAttempted(true);
    }

  };

  // Check the actual role returned by the backend after login
  useEffect(() => {
    if (!loginAttempted || !user) return;

    const verifyRoleAndNavigate = async () => {
      const isAdmin = user.role === "admin";

      if (selectedRole === "admin" && !isAdmin) {
           await logout();

        setError(true);
        setErrorMsg("This account does not have administrator access.");
        setLoginAttempted(false);

        return;
      }

      if (selectedRole === "customer" && isAdmin) {
        await logout();

        setError(true);
        setErrorMsg("Please select Admin Login for this account.");
        setLoginAttempted(false);
        return;
      }

      setLoginAttempted(false);
      navigate(isAdmin ? "/admin" : "/", { replace: true });
    };

    verifyRoleAndNavigate();
  }, [
    loginAttempted,
    user,
    selectedRole,
    logout,
    navigate,
    setError,
    setErrorMsg,
  ]);

  return (
    <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-12 sm:px-8 sm:py-16">
      <div className={`w-full max-w-md rounded-3xl border bg-white p-7 shadow-xl transition-all duration-300 sm:p-10 ${
        selectedRole === "admin"
          ? "border-blue-300/80 shadow-blue-600/10 ring-4 ring-blue-500/5"
          : "border-slate-200/80 shadow-slate-900/5"
      }`}>

        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-colors duration-300 ${
            selectedRole === "admin"
              ? "bg-slate-900 shadow-slate-900/25"
              : "bg-blue-600 shadow-blue-600/25"
          }`}>
            {selectedRole === "admin" ? <ShieldCheck size={26} /> : <ShoppingBag size={26} />}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {selectedRole === "admin" ? "Admin Portal" : "Welcome Back"}
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            {selectedRole === "admin"
              ? "Secure management access for store administrators"
              : "Your Shopping World, All in One Place"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Modern Interactive Role Toggle Switch */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Account Access Type
            </label>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole("customer");
                  setError(false);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                  selectedRole === "customer"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User size={15} />
                Customer
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole("admin");
                  setError(false);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                  selectedRole === "admin"
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck size={15} />
                Admin Portal
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 flex items-center text-xs font-bold uppercase tracking-wider text-slate-700">
              Email Address
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400"
              />

              <input
                type="email"
                required
                value={formDetails.email}
                onChange={(e) => {
                  setFormDetails({
                    ...formDetails,
                    email: e.target.value,
                  });
                  setError(false);
                }}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 flex items-center text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Password
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formDetails.password}
                onChange={(e) => {
                  setFormDetails({
                    ...formDetails,
                    password: e.target.value,
                  });
                  setError(false);
                }}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 transition-colors hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-xs sm:text-sm font-medium text-red-700 shadow-sm">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || loginAttempted}
            className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold text-white shadow-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
              selectedRole === "admin"
                ? "bg-slate-900 shadow-slate-900/25 hover:bg-slate-800"
                : "bg-blue-600 shadow-blue-600/25 hover:bg-blue-500"
            }`}
          >
            {loading || loginAttempted ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                {selectedRole === "admin" ? (
                  <ShieldCheck size={17} />
                ) : (
                  <User size={17} />
                )}
                Sign In
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Register */}
        {selectedRole === "customer" && (
          <p className="mt-8 text-center text-xs sm:text-sm text-slate-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Register here
            </Link>
          </p>
        )}

        {selectedRole === "admin" && (
          <p className="mt-8 text-center text-[11px] sm:text-xs text-slate-400">
            Administrator access is restricted to authorized credentials only.
          </p>
        )}
      </div>
    </div>
  );
}