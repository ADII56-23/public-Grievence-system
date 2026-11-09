import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your registered Email ID or Mobile No");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans overflow-hidden">
      {/* Background Waves */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves-fp" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M 0 50 Q 25 30 50 50 T 100 50"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.75"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves-fp)" />
        </svg>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 p-6 sm:p-8 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1e3a8a]">
            Reset Password
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Reset Link Sent</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              We have sent password reset instructions to{" "}
              <span className="font-semibold text-slate-800">{identifier}</span>. Please check your inbox or SMS.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-block bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-6 py-2 rounded-lg text-sm transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs sm:text-sm text-slate-600">
              Enter your registered Mobile number or Email ID and we will send you a link to reset your password.
            </p>

            <div className="space-y-1">
              <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                Mobile no. / Email ID
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError("");
                }}
                placeholder="yourmailid@domain.com"
                className="w-full bg-transparent border-b border-slate-300 focus:border-blue-600 py-2 text-slate-800 placeholder-slate-400 text-sm outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium py-2.5 rounded-lg shadow-sm hover:shadow transition-all text-sm cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send Reset Instructions"
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
