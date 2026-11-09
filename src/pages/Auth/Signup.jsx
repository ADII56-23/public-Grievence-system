import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Eye, EyeOff, CheckCircle2, ShieldCheck,
  RefreshCw, User, Building2, AlertCircle, Info
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInModal from "../../components/Auth/GoogleSignInModal";

const DEPARTMENTS = [
  "Bhubaneswar Municipal Corporation (BMC)",
  "Public Works Department (PWD)",
  "Odisha Power Transmission Corporation (OPTCL)",
  "Phed – Water Supply Dept.",
  "Pollution Control Board (PCB)",
  "Urban Development Authority (UDA)",
  "Traffic Police HQ",
  "Animal Welfare Board",
  "General Administration Dept.",
];

function Signup() {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();

  const [role, setRole] = useState("citizen");
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  /* ─── Citizen form state ─── */
  const [citizenData, setCitizenData] = useState({
    fullName: "", email: "", mobile: "", password: "", confirmPassword: "",
  });

  /* ─── Authority form state ─── */
  const [authorityData, setAuthorityData] = useState({
    fullName: "", officialEmail: "", mobile: "", employeeId: "",
    department: "", designation: "", password: "", confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* OTP flow (citizen only) */
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /* ── helpers ── */
  const switchRole = (r) => {
    setRole(r);
    setError("");
    setSuccessMsg("");
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
  };

  const handleCitizenChange = (e) => {
    const { name, value } = e.target;
    setCitizenData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const handleAuthorityChange = (e) => {
    const { name, value } = e.target;
    setAuthorityData((p) => ({ ...p, [name]: value }));
    if (error) setError("");
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && element.nextSibling) element.nextSibling.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling)
      e.target.previousSibling.focus();
  };

  const startTimer = () => {
    setCanResend(false);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  /* ── Citizen validation ── */
  const validateCitizen = () => {
    if (!citizenData.fullName.trim()) return "Please enter your full name";
    if (!citizenData.email.trim() || !/\S+@\S+\.\S+/.test(citizenData.email))
      return "Please enter a valid email address";
    if (!citizenData.mobile.trim() || !/^\d{10}$/.test(citizenData.mobile.replace(/\D/g, "")))
      return "Please enter a valid 10-digit mobile number";
    if (!citizenData.password) return "Please enter a password";
    if (citizenData.password.length < 6) return "Password must be at least 6 characters";
    if (citizenData.password !== citizenData.confirmPassword) return "Passwords do not match";
    return "";
  };

  /* ── Authority validation ── */
  const validateAuthority = () => {
    if (!authorityData.fullName.trim()) return "Please enter your full name";
    if (!authorityData.officialEmail.trim() || !/\S+@\S+\.\S+/.test(authorityData.officialEmail))
      return "Please enter a valid official email";
    if (!authorityData.employeeId.trim()) return "Please enter your Employee / Officer ID";
    if (!authorityData.department) return "Please select your department";
    if (!authorityData.designation.trim()) return "Please enter your designation";
    if (!authorityData.password) return "Please enter a password";
    if (authorityData.password.length < 8) return "Authority password must be at least 8 characters";
    if (authorityData.password !== authorityData.confirmPassword) return "Passwords do not match";
    return "";
  };

  /* ── OTP send (citizen) ── */
  const handleSendOtp = (e) => {
    e.preventDefault();
    const err = validateCitizen();
    if (err) { setError(err); return; }
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setSuccessMsg(`OTP sent to +91 ${citizenData.mobile} (Enter any 6 digits, e.g. 123456, to verify)`);
      startTimer();
    }, 1000);
  };

  /* ── OTP verify & create citizen account ── */
  const handleVerifyCitizen = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) { setError("Please enter the complete 6-digit OTP"); return; }
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setIsLoading(false);
      const res = signup(citizenData, "citizen");
      if (res.success) {
        setSuccessMsg("Account created successfully! Redirecting to your profile...");
        setTimeout(() => navigate("/profile"), 700);
      } else {
        setError(res.message);
      }
    }, 700);
  };

  /* ── Authority register ── */
  const handleAuthorityRegister = (e) => {
    e.preventDefault();
    const err = validateAuthority();
    if (err) { setError(err); return; }
    setIsLoading(true);
    setError("");
    setTimeout(() => {
      setIsLoading(false);
      const res = signup(authorityData, "authority");
      if (res.success) {
        setSuccessMsg("Authority account created successfully! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 700);
      } else {
        setError(res.message);
      }
    }, 800);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setSuccessMsg(`New OTP sent to +91 ${citizenData.mobile}`);
    startTimer();
  };

  const handleGoogleAccountSelected = (account) => {
    setSuccessMsg(`Creating citizen account with Google (${account.email})...`);
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

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans overflow-hidden">
      {/* Bg grid */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-signup" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-signup)" />
        </svg>
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg relative z-10 animate-fadeIn">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* ── ROLE TOGGLE ── */}
          <div className="grid grid-cols-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => switchRole("citizen")}
              className={`flex items-center justify-center gap-2.5 py-4 px-4 text-sm font-bold transition-all cursor-pointer ${role === "citizen" ? "bg-[#1e3a8a] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
            >
              <User className="w-4 h-4" />
              Citizen Sign Up
            </button>
            <button
              type="button"
              onClick={() => switchRole("authority")}
              className={`flex items-center justify-center gap-2.5 py-4 px-4 text-sm font-bold transition-all cursor-pointer ${role === "authority" ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Authority Sign Up
            </button>
          </div>

          <div className="p-7 space-y-5">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {role === "authority" ? "Register as Authority Officer" : "Create Citizen Account"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {role === "authority"
                  ? "For verified government officers and department staff only"
                  : "Register to submit and track civic grievances"
                }
              </p>
            </div>

            {/* Notifications */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ══════════════════════════ CITIZEN FORM ══════════════════════════ */}
            {role === "citizen" && (
              <form onSubmit={otpSent ? handleVerifyCitizen : handleSendOtp} className="space-y-5 animate-fadeIn">

                <FormField label="Full Name" name="fullName" value={citizenData.fullName}
                  onChange={handleCitizenChange} placeholder="Your full name" disabled={otpSent} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Email ID" name="email" type="email" value={citizenData.email}
                    onChange={handleCitizenChange} placeholder="you@example.com" disabled={otpSent} />
                  <FormField label="Mobile No." name="mobile" type="tel" value={citizenData.mobile}
                    onChange={handleCitizenChange} placeholder="10-digit mobile" disabled={otpSent} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordField label="Password" name="password" value={citizenData.password}
                    onChange={handleCitizenChange} show={showPassword} toggle={() => setShowPassword(!showPassword)} disabled={otpSent} />
                  <PasswordField label="Confirm Password" name="confirmPassword" value={citizenData.confirmPassword}
                    onChange={handleCitizenChange} show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} disabled={otpSent} />
                </div>

                {/* OTP Box */}
                {otpSent && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Enter 6-Digit OTP
                      </label>
                      <button type="button" onClick={() => setOtpSent(false)} className="text-xs text-blue-600 hover:underline cursor-pointer">
                        Edit details
                      </button>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {otp.map((d, i) => (
                        <input key={i} type="text" maxLength="1" value={d}
                          onChange={(e) => handleOtpChange(e.target, i)}
                          onKeyDown={(e) => handleKeyDown(e, i)}
                          onFocus={(e) => e.target.select()}
                          className="w-10 h-12 text-center text-lg font-bold border border-slate-300 rounded-lg bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{timer > 0 ? `Resend in ${timer}s` : "Didn't receive OTP?"}</span>
                      <button type="button" onClick={handleResendOtp} disabled={!canResend}
                        className={`flex items-center gap-1 font-semibold cursor-pointer ${canResend ? "text-emerald-600 hover:underline" : "text-slate-400 cursor-not-allowed"}`}>
                        <RefreshCw className="w-3 h-3" /> Resend
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : otpSent ? "Verify & Create Account" : "Send OTP"
                  }
                </button>

                {/* Divider & Google Sign Up */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
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
                    Sign up with Google
                  </span>
                </button>

                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-[#1e3a8a] font-bold hover:underline">Login</Link>
                </p>
              </form>
            )}

            {/* ══════════════════════════ AUTHORITY FORM ══════════════════════════ */}
            {role === "authority" && (
              <form onSubmit={handleAuthorityRegister} className="space-y-5 animate-fadeIn">

                {/* Info banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-amber-800">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>Authority accounts require a valid <strong>Employee ID</strong> issued by your nodal department. Unverified accounts will be reviewed within 48 hours.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Full Name" name="fullName" value={authorityData.fullName}
                    onChange={handleAuthorityChange} placeholder="Officer full name" />
                  <FormField label="Mobile No." name="mobile" type="tel" value={authorityData.mobile}
                    onChange={handleAuthorityChange} placeholder="10-digit mobile" />
                </div>

                <FormField label="Official Email ID" name="officialEmail" type="email" value={authorityData.officialEmail}
                  onChange={handleAuthorityChange} placeholder="officer@dept.gov.in" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Employee / Officer ID" name="employeeId" value={authorityData.employeeId}
                    onChange={handleAuthorityChange} placeholder="e.g. BMC-ENG-2024" />
                  <FormField label="Designation" name="designation" value={authorityData.designation}
                    onChange={handleAuthorityChange} placeholder="e.g. Executive Engineer" />
                </div>

                {/* Department dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={authorityData.department}
                    onChange={handleAuthorityChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm text-slate-800 transition-all"
                  >
                    <option value="">Select your department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordField label="Password (min 8 chars)" name="password" value={authorityData.password}
                    onChange={handleAuthorityChange} show={showPassword} toggle={() => setShowPassword(!showPassword)} />
                  <PasswordField label="Confirm Password" name="confirmPassword" value={authorityData.confirmPassword}
                    onChange={handleAuthorityChange} show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                  {isLoading
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Building2 className="w-4 h-4" /> Register Authority Account</>
                  }
                </button>

                <p className="text-center text-sm text-slate-600">
                  Already registered?{" "}
                  <Link to="/login" className="text-slate-800 font-bold hover:underline">Login as Authority</Link>
                </p>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          CivicFlow Public Grievance Portal © 2026 · Govt. of Odisha
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

export default Signup;

/* ──────────── reusable sub-components ──────────── */
function FormField({ label, name, type = "text", value, onChange, placeholder, disabled = false, required = true }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} disabled={disabled} required={required}
        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 transition-all disabled:opacity-60"
      />
    </div>
  );
}

function PasswordField({ label, name, value, onChange, show, toggle, disabled = false }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"} name={name} value={value} onChange={onChange}
          placeholder="••••••••" disabled={disabled} required
          className="w-full px-4 py-3 pr-11 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 transition-all disabled:opacity-60"
        />
        <button type="button" onClick={toggle} tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
