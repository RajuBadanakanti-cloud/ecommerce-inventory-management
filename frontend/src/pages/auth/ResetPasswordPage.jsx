import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  LoaderCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg("");
    setSuccessMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!token) {
      setErrorMsg("Invalid password reset link.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.patch(
        `/auth/reset-password/${token}`,
        { password }
      );

      setSuccessMsg(
        response.data.message || "Password reset successful."
      );

      setPassword("");
      setConfirmPassword("");

      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);

    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Unable to reset password. Your link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-12 sm:px-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Lock size={26} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">
            Reset Password
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create a new password for your ShopSphere account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* New Password */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              New Password
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400"
              />

              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="mt-1.5 text-xs text-slate-500">
              Minimum 8 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
              Confirm Password
              <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400"
              />

              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-center text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="flex gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-3 text-sm text-green-800">
              <CheckCircle size={19} className="shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!successMsg}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                Reset Password
                <Lock size={17} />
              </>
            )}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

      </div>
    </div>
  );
}
