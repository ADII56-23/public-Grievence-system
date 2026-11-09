import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye, EyeOff, CheckCircle2, ArrowLeft,
  User, ShieldCheck, Landmark, Building2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DEPARTMENT_OPTIONS } from "../../utils/departmentRouting";
import GoogleSignInModal from "../../components/Auth/GoogleSignInModal";

function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  // "citizen" | "authority"
  const [role, setRole] = useState("citizen");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    employeeId: "",
    department: "Electricity Board"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setError("");
    setSuccessMsg("");
    setFormData({
      identifier: "",
      password: "",
      employeeId: "",
      department: newRole === "authority" ? "Electricity Board" : ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.identifier.trim()) {
      setError(role === "authority" ? "Please enter your official Email ID" : "Please enter your Mobile no. or Email ID");
      return;
    }
    if (role === "authority" && !formData.employeeId.trim()) {
      setError("Please enter your Employee / Officer ID");
      return;
    }
    if (role === "authority" && !formData.department) {
      setError("Please select your assigned department");
      return;
    }
    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    setTimeout(() => {
      setIsLoading(false);
      const res = login(
        {
          identifier: formData.identifier,
          password: formData.password,
          employeeId: formData.employeeId,
          department: formData.department,
        },
        role
      );

      if (res.success) {
        setSuccessMsg(
          role === "authority"
            ? `Authority login successful (${formData.department})! Redirecting...`
            : "Login successful! Redirecting..."
        );
        setTimeout(() => navigate(role === "authority" ? "/dashboard" : "/profile"), 700);
      } else {
        setError(res.message || "Invalid credentials. Please verify your details.");
      }
    }, 600);
  };

  const handleGoogleLogin = () => {
    if (role === "authority") {
      setError("Authority login does not support Google Sign-In. Use your official credentials.");
      return;
    }
    setError("");
    setIsGoogleModalOpen(true);
  };

  const handleGoogleAccountSelected = (account) => {
    setSuccessMsg(`Signing in as ${account.email}...`);
    const res = loginWithGoogle({
      fullName: account.fullName,
      email: account.email,
    });
    if (res.success) {
      setTimeout(() => {
        navigate("/profile");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-login" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-login)" />
        </svg>
      </div>

      {/* Glow blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg relative z-10 animate-fadeIn">

        {/* Back Arrow */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* ── ROLE TOGGLE HEADER ── */}
          <div className="grid grid-cols-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => switchRole("citizen")}
              className={`flex items-center justify-center gap-2.5 py-4 px-4 text-sm font-bold transition-all cursor-pointer ${role === "citizen"
                  ? "bg-[#1e3a8a] text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
            >
              <User className="w-4 h-4" />
              <span>Citizen</span>
            </button>
            <button
              type="button"
              onClick={() => switchRole("authority")}
              className={`flex items-center justify-center gap-2.5 py-4 px-4 text-sm font-bold transition-all cursor-pointer ${role === "authority"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authority / Officer</span>
            </button>
          </div>

          {/* ── FORM BODY ── */}
          <div className="p-7 space-y-6">

            {/* Role badge */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${role === "authority" ? "bg-slate-800" : "bg-[#1e3a8a]"
                }`}>
                {role === "authority"
                  ? <Building2 className="w-5 h-5 text-white" />
                  : <Landmark className="w-5 h-5 text-white" />
                }
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {role === "authority" ? "Authority Login" : "Citizen Login"}
                </h1>
                <p className="text-xs text-slate-500">
                  {role === "authority"
                    ? "Government officer & department access"
                    : "Submit, track & manage your grievances"
                  }
                </p>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm px-4 py-3 rounded-xl animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium leading-relaxed">{error}</p>
                  {error.toLowerCase().includes("sign up") && (
                    <div className="mt-1.5">
                      <Link
                        to={role === "authority" ? "/admin/signup" : "/signup"}
                        className="text-blue-700 hover:text-blue-900 underline font-semibold text-xs inline-flex items-center gap-1"
                      >
                        Don't have an account? Click here to Sign Up →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email / Mobile */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  {role === "authority" ? "Official Email ID" : "Mobile No. / Email ID"}
                </label>
                <input
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder={role === "authority" ? "officer@dept.gov.in" : "Enter mobile or email"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Employee ID (authority only) */}
              {role === "authority" && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-sm font-semibold text-slate-700">
                    Employee / Officer ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="e.g. BMC-ENG-2024"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 transition-all"
                  />
                </div>
              )}

              {/* Department Selection (authority only) */}
              {role === "authority" && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-sm font-semibold text-slate-700">
                    Assigned Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm text-slate-800 transition-all cursor-pointer font-medium"
                  >
                    <option value="">Select your Department...</option>
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.icon} {dept.name} ({dept.category})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Grievance complaints matching this department will be routed to your desk.
                  </p>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-3 rounded-xl text-white shadow-md text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 ${role === "authority"
                    ? "bg-slate-800 hover:bg-slate-900"
                    : "bg-[#22c55e] hover:bg-[#16a34a]"
                  }`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Login as {role === "authority" ? "Officer" : "Citizen"}</>
                )}
              </button>
            </form>

            {/* Divider */}
            {role === "citizen" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center overflow-hidden rounded-xl border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="bg-white p-3 flex items-center justify-center border-r border-slate-200">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.35 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-center text-sm font-semibold text-slate-700 group-hover:text-slate-900 py-3 px-4 bg-white transition-colors">
                    Continue with Google
                  </span>
                </button>
              </>
            )}

            {/* Authority info notice */}
            {role === "authority" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 flex items-start gap-2.5 animate-fadeIn">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Authority access is restricted to verified government officers. Credentials are issued by the nodal department administrator.
                </span>
              </div>
            )}

            {/* Footer link */}
            <p className="text-center text-sm text-slate-600">
              {role === "authority" ? (
                <>
                  Citizen?{" "}
                  <button onClick={() => switchRole("citizen")} className="text-blue-600 font-semibold hover:underline cursor-pointer">
                    Switch to Citizen Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-[#1e3a8a] font-bold hover:underline">
                    Sign Up
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          CivicFlow Public Grievance Portal &copy; 2026 · Govt. of Odisha
        </p>
      </div>

      {/* Google Account Selector Dialog */}
      <GoogleSignInModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelected}
      />
    </div>
  );
}

export default Login;