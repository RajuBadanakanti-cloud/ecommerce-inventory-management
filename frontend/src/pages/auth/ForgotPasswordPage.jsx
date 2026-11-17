import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, LoaderCircle, CheckCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axiosInstance.post(
        "/auth/forgot-password",
        { email: email.trim() }
      );

      setSuccessMsg(
        response.data.message ||
          "If an account exists with that email, a password reset link will be sent."
      );

      setEmail("");
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
          "Unable to process your request. Please try again."
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
            <Mail size={26} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900">
            Forgot Password?
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your registered email address. We'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                placeholder="Enter your registered email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-950 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
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
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Reset Link
                <Send size={17} />
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
