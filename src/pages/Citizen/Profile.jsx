import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import Footer from "../../components/Footer/footer";
import { useAuth } from "../../context/AuthContext";
import { getStoredComplaints, matchesDepartment, DEPARTMENT_OPTIONS } from "../../utils/departmentRouting";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  Edit3,
  Save,
  Key,
  LogOut,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Camera,
  Building2,
  Bell,
  Award,
  ArrowRight,
  Lock,
  Check,
  ChevronRight,
  History,
  ShieldCheck,
  Star,
  MessageSquarePlus,
  ThumbsUp,
  ThumbsDown,
  Send,
  MessageSquare
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoggedIn, logout, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "info"); // "info", "complaints", "feedback", "security", "notifications"
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  // Clean user data: ensures no fake dummy addresses, phones, or contacts are autofilled
  const getCleanProfile = (u) => {
    if (!u) return {};
    const isOfficerUser = u.role === "authority";
    if (isOfficerUser) {
      return {
        fullName: u.fullName || "Officer",
        email: u.email || u.officialEmail || "",
        officialEmail: u.officialEmail || u.email || "",
        phone: u.phone || u.mobile || "",
        employeeId: u.employeeId || "BMC-OFFICER-2026",
        department: u.department || "Electricity Board",
        designation: u.designation || "Executive Engineer",
        jurisdiction: u.jurisdiction || "Municipal Division",
        role: "authority",
        joinedDate: u.joinedDate || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        preferredLanguage: u.preferredLanguage || "English"
      };
    }
    const isDemo = u.email === "citizen@civicflow.gov.in";
    const rawAddress = u.address || "";
    const isDummyAddress = !isDemo && (rawAddress === "Plot 124, Saheed Nagar" || rawAddress === "Odisha, India");
    const rawCity = u.city || "";
    const isDummyCity = !isDemo && (isDummyAddress || !rawAddress) && rawCity === "Bhubaneswar";
    const rawState = u.state || "";
    const isDummyState = !isDemo && (isDummyAddress || !rawAddress) && rawState === "Odisha";
    const rawPin = u.pincode || "";
    const isDummyPin = !isDemo && (rawPin === "751007" || rawPin === "751001");
    const rawEmerg = u.emergencyContact || "";
    const isDummyEmerg = !isDemo && rawEmerg === "+91 91234 56789";
    const rawPhone = u.phone || u.mobile || "";
    const isDummyPhone = !isDemo && rawPhone === "+91 98765 43210" && !u.mobile;

    return {
      fullName: u.fullName || "",
      email: u.email || "",
      phone: isDummyPhone ? "" : rawPhone,
      citizenId: u.citizenId || "",
      govIdVerified: Boolean(u.govIdVerified),
      address: isDummyAddress ? "" : rawAddress,
      city: isDummyCity ? "" : rawCity,
      state: isDummyState ? "" : rawState,
      pincode: isDummyPin ? "" : rawPin,
      joinedDate: u.joinedDate || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      emergencyContact: isDummyEmerg ? "" : rawEmerg,
      preferredLanguage: u.preferredLanguage || "English",
      role: "citizen"
    };
  };

  const isOfficer = user?.role === "authority";
  const officerDepartment = user?.department || "Electricity Board";

  const userProfile = getCleanProfile(user);
  const [formData, setFormData] = useState(() => getCleanProfile(user));

  // Security password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    smsUpdates: true,
    emailAlerts: true,
    weeklyDigest: false,
    resolutionReminders: true
  });

  // Load user's actual submitted complaints (for citizens) or resolved department issues (for officers)
  const [userComplaints, setUserComplaints] = useState([]);
  const [resolvedComplaints, setResolvedComplaints] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData(getCleanProfile(user));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUserComplaints([]);
      setResolvedComplaints([]);
      return;
    }
    const allComplaints = getStoredComplaints();

    if (isOfficer) {
      const resolved = allComplaints.filter((c) => {
        const isResolved = (c.status || "").toLowerCase().includes("resolve") || (c.status || "").toLowerCase().includes("closed");
        return isResolved && matchesDepartment(c, officerDepartment);
      });
      setResolvedComplaints(resolved);
    } else {
      const uEmail = (user.email || "").toLowerCase().trim();
      const uPhone = (user.phone || user.mobile || "").replace(/\D/g, "");
      const uId = String(user.id || user._id || "");

      const filtered = allComplaints.filter((c) => {
        // 1. Explicit userId match
        if (uId && c.userId && String(c.userId) === uId) return true;

        // 2. Email match
        const cEmail = (c.email || "").toLowerCase().trim();
        if (uEmail && cEmail && uEmail === cEmail) return true;

        // 3. User's phone number match (if verified/custom and at least 7 digits)
        const cPhone = (c.phone || "").replace(/\D/g, "");
        if (uPhone && cPhone && uPhone.length >= 7 && (uPhone.endsWith(cPhone) || cPhone.endsWith(uPhone))) {
          if (c.phone !== "+91 98765 43210" || (uEmail && cEmail && uEmail === cEmail)) {
            return true;
          }
        }

        return false;
      });

      setUserComplaints(filtered);
    }
  }, [user, activeTab, isOfficer, officerDepartment]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    const preselectedTicket = searchParams.get("ticketId");
    if (preselectedTicket) {
      setFeedbackTicketId(preselectedTicket);
    }
  }, [searchParams]);

  // ── Citizen Feedback States ──
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackCategory, setFeedbackCategory] = useState("Overall Redressal Speed");
  const [feedbackTicketId, setFeedbackTicketId] = useState("");
  const [feedbackDepartment, setFeedbackDepartment] = useState("Electricity Board");
  const [feedbackSatisfaction, setFeedbackSatisfaction] = useState("yes");
  const [feedbackComments, setFeedbackComments] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbacksList, setFeedbacksList] = useState(() => {
    try {
      const raw = localStorage.getItem("civicflow_citizen_feedbacks");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore read error
    }
    return [
      {
        id: "FB-894201",
        citizenName: "Aditya Kumar",
        citizenEmail: "citizen@civicflow.gov.in",
        rating: 5,
        category: "Overall Redressal Speed",
        ticketId: "PG261100019",
        department: "Electricity Board",
        satisfaction: "yes",
        comments: "The street light in Sahid Nagar was inspected and repaired promptly within 48 hours. Thank you to the Electricity Board!",
        date: "06 Nov 2026",
        status: "Acknowledged by Redressal Cell"
      }
    ];
  });

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackComments.trim()) {
      return;
    }
    const newEntry = {
      id: "FB-" + Date.now().toString().slice(-6),
      citizenName: user?.fullName || "Citizen",
      citizenEmail: user?.email || "",
      rating: feedbackRating,
      category: feedbackCategory,
      ticketId: feedbackTicketId || null,
      department: feedbackDepartment || "General",
      satisfaction: feedbackSatisfaction,
      comments: feedbackComments.trim(),
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Acknowledged by Redressal Cell"
    };

    const updated = [newEntry, ...feedbacksList];
    setFeedbacksList(updated);
    try {
      localStorage.setItem("civicflow_citizen_feedbacks", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save feedback:", err);
    }
    setFeedbackComments("");
    setFeedbackSuccess("Thank you! Your feedback has been recorded and submitted to the department redressal cell.");
    setTimeout(() => setFeedbackSuccess(""), 5000);
  };

  // Access guard: If user is not logged in, show access restriction prompt
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-sm">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Please Sign In</h1>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
            You need to be logged in to view your citizen profile, personal details, and track your filed grievances.
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" /> Go to Login
            </Link>
            <Link
              to="/signup"
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-6 py-2.5 rounded-xl text-sm shadow-sm transition-all"
            >
              Create Account
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || "Pending").toLowerCase();
    if (s.includes("resolve") || s.includes("closed")) {
      return {
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        Icon: CheckCircle2
      };
    }
    if (s.includes("progress")) {
      return {
        color: "bg-amber-100 text-amber-800 border-amber-300",
        Icon: Clock
      };
    }
    if (s.includes("review")) {
      return {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        Icon: AlertCircle
      };
    }
    return {
      color: "bg-slate-100 text-slate-700 border-slate-300",
      Icon: Clock
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
    setSaveSuccess("Profile updated successfully!");
    setTimeout(() => setSaveSuccess(""), 4000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setPasswordMsg({ type: "success", text: "Password updated successfully!" });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setPasswordMsg({ type: "", text: "" }), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e40af] to-[#2563eb] rounded-2xl shadow-xl p-6 sm:p-8 text-white relative overflow-hidden mb-8">
          {/* Subtle wave pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="profile-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="20" fill="none" stroke="#ffffff" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#profile-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with Camera Icon */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/90 bg-slate-200 text-[#1e3a8a] font-bold text-3xl sm:text-4xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                {((userProfile.fullName || "Citizen").trim().split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2)) || "C"}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-md border-2 border-white transition-all cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info Summary */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {userProfile.fullName || (isOfficer ? "Officer" : "Citizen")}
                </h1>
                {isOfficer ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/40 backdrop-blur-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                      Government Authority
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-100 border border-blue-400/40 backdrop-blur-xs">
                      🏢 {userProfile.department || officerDepartment}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 backdrop-blur-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {userProfile.govIdVerified ? "Verified Citizen" : "Citizen Account"}
                  </span>
                )}
              </div>

              {isOfficer ? (
                <p className="text-blue-100 text-sm flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-300" />
                    Officer ID: <strong className="text-white font-mono">{userProfile.employeeId || "OFFICER-GOV"}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-300" />
                    Designation: <strong className="text-white">{userProfile.designation || "Executive Engineer"}</strong>
                  </span>
                </p>
              ) : (
                <p className="text-blue-100 text-sm flex flex-wrap items-center justify-center sm:justify-start gap-4">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-blue-300" />
                    Citizen ID: <strong className="text-white font-mono">{userProfile.citizenId || "Pending Verification"}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-300" />
                    Member Since: {userProfile.joinedDate || "Recent"}
                  </span>
                </p>
              )}

              <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3 text-xs">
                {isOfficer ? (
                  <>
                    <span className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-xs text-blue-50 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      Jurisdiction: {userProfile.jurisdiction || "Municipal Division"}
                    </span>
                    <span className="bg-emerald-500/20 px-3 py-1 rounded-md backdrop-blur-xs text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      Resolved Issues: {resolvedComplaints.length}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-xs text-blue-50 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      {userProfile.city || userProfile.state
                        ? `${userProfile.city || ""}${userProfile.city && userProfile.state ? ", " : ""}${userProfile.state || ""}`
                        : "Location: Not Provided"}
                    </span>
                    <span className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-xs text-blue-50 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      Grievances Filed: {userComplaints.length}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Logout Action */}
            <div className="shrink-0 pt-2 sm:pt-0">
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-red-500/80 text-white hover:text-white border border-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Notification Banner */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{saveSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "info"
                ? "border-blue-600 text-blue-600 bg-white/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isOfficer ? "Officer Details" : "Personal Details"}</span>
          </button>

          <button
            onClick={() => setActiveTab("complaints")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "complaints"
                ? "border-blue-600 text-blue-600 bg-white/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {isOfficer ? (
              <>
                <History className="w-4 h-4 text-emerald-600" />
                <span>Resolution History ({resolvedComplaints.length})</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>My Grievances ({userComplaints.length})</span>
              </>
            )}
          </button>

          {/* Citizen Feedback Tab */}
          <button
            onClick={() => setActiveTab("feedback")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "feedback"
                ? "border-blue-600 text-blue-600 bg-white/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <MessageSquarePlus className="w-4 h-4 text-rose-500" />
            <span>Citizen Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "security"
                ? "border-blue-600 text-blue-600 bg-white/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === "notifications"
                ? "border-blue-600 text-blue-600 bg-white/50 rounded-t-lg"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Tab 1: Personal Details (Citizen) / Officer Credentials (Officer) */}
        {activeTab === "info" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  {isOfficer ? "Officer Profile Information" : "Citizen Profile Information"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isOfficer
                    ? "Official departmental credentials, designation, and administrative zone"
                    : "Manage your personal contact details and residential address"}
                </p>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-lg text-sm border border-blue-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFormData(getCleanProfile(user));
                    setIsEditing(false);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {isOfficer ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Officer Full Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      Officer Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                      required
                    />
                  </div>

                  {/* Official Email */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      Official Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                      required
                    />
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-slate-400" />
                      Employee / Officer ID
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-mono focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Official Phone */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-slate-400" />
                      Contact Mobile
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={isEditing ? "e.g. +91 94370 12345" : "Not provided"}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Assigned Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Official Designation
                    </label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                    />
                  </div>

                  {/* Jurisdiction */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Jurisdiction / Administrative Zone
                    </label>
                    <input
                      type="text"
                      name="jurisdiction"
                      value={formData.jurisdiction}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder={isEditing ? "Enter your full name" : "Not provided"}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                      required
                    />
                  </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter your email address" : "Not provided"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "e.g. +91 98765 43210" : "Not provided"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "e.g. +91 91234 56789 (optional)" : "Not provided"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                  />
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Residential Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter house/plot no, street name, area" : "Not provided"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    District / City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "e.g. Bhubaneswar" : "Not provided"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "e.g. Odisha" : "Not provided"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    Postal Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={isEditing ? "e.g. 751001" : "Not provided"}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:bg-white focus:border-blue-600 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {isEditing && (
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Tab 2: Resolution History (Officer) OR My Grievances History (Citizen) */}
        {activeTab === "complaints" && (
          isOfficer ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Department Archive
                    </span>
                  </div>
                  <h2 className="text-xl font-serif font-bold text-slate-900 mt-1">
                    Resolution History
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Archived record of all successfully redressed public grievances for {userProfile.department || officerDepartment}
                  </p>
                </div>

                <Link
                  to="/dashboard"
                  className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 shrink-0"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Go to Officer Dashboard</span>
                </Link>
              </div>

              {resolvedComplaints.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No Resolved Issues Yet</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    When public grievances assigned to {userProfile.department || officerDepartment} are completed and updated to Resolved, they will be archived here.
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#1e293b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    <span>View Active Tickets on Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {resolvedComplaints.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-emerald-200/80 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                            #{item.id}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Resolved
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Resolved on {item.expectedResolution || item.submittedDate || "Completed"}
                          </span>
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            🏢 {item.department || item.category}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-800">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Citizen: <strong className="text-slate-700">{item.citizen || "Citizen"}</strong> • Location: <span className="text-slate-700">{item.address || "Area"}</span>
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <Link
                        to={`/track?id=${item.id}`}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg border border-emerald-200 transition-colors shrink-0"
                      >
                        <span>View Resolution</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-xl font-serif font-bold text-slate-900">
                    Submitted Grievances
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Track progress and view details of your filed public complaints
                  </p>
                </div>

                <Link
                  to="/submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>Submit New Complaint</span>
                </Link>
              </div>

              {userComplaints.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
                  <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">No Grievances Filed Yet</h3>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    You haven't submitted any complaints with this account. When you submit a civic issue, you can track its progress and department resolution right here.
                  </p>
                  <Link
                    to="/submit"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>File Your First Grievance</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userComplaints.map((item) => {
                    const badge = getStatusBadge(item.status);
                    const StatusIcon = badge.Icon;
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                              {item.id}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.color}`}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {item.status || "Pending"}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.submittedDate || item.date || "Recent"}
                            </span>
                            {item.department && (
                              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {item.department}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-slate-800">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Category: <span className="text-slate-700">{item.category}</span>
                          </p>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <Link
                          to={`/track?id=${item.id}`}
                          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 transition-colors shrink-0"
                        >
                          <span>Track Status</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}

        {/* Tab 3: Security & Password */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-2xl">
            <div className="pb-6 mb-6 border-b border-slate-100">
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span>Security & Password Settings</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Keep your CivicFlow citizen account secure with a strong password
              </p>
            </div>

            {passwordMsg.text && (
              <div
                className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
                  passwordMsg.type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {passwordMsg.type === "error" ? (
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Notification Preferences */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 max-w-2xl">
            <div className="pb-6 mb-6 border-b border-slate-100">
              <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span>Notification Preferences</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Choose how CivicFlow updates you about your grievance resolution status
              </p>
            </div>

            <div className="space-y-5">
              {[
                {
                  key: "smsUpdates",
                  title: "SMS Alerts",
                  desc: "Receive real-time text message alerts when grievance status changes."
                },
                {
                  key: "emailAlerts",
                  title: "Email Notifications",
                  desc: "Get detailed progress reports and officer remarks sent to your email."
                },
                {
                  key: "resolutionReminders",
                  title: "Feedback & Escalation Alerts",
                  desc: "Reminders to rate resolved complaints or escalate pending issues."
                },
                {
                  key: "weeklyDigest",
                  title: "CivicFlow Digest",
                  desc: "Receive periodic civic updates and community improvement reports."
                }
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="pr-4 space-y-0.5">
                    <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) =>
                        setNotifications({ ...notifications, [item.key]: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Citizen Feedback & Redressal Rating */}
        {activeTab === "feedback" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Feedback Success Toast */}
            {feedbackSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 shadow-xs animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{feedbackSuccess}</span>
              </div>
            )}

            {/* Top Overview Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-semibold backdrop-blur-xs">
                    <MessageSquarePlus className="w-3.5 h-3.5 text-rose-300" />
                    <span>Citizen Voice & Accountability Cell</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif">
                    Citizen Feedback & Service Rating
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Your real ratings and reviews directly guide department heads and nodal officers to improve service response time, field worker accountability, and overall civic maintenance.
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/15 shrink-0 self-start md:self-auto">
                  <div className="text-center px-2">
                    <span className="block text-2xl font-bold text-amber-300">
                      {(
                        feedbacksList.reduce((acc, curr) => acc + (curr.rating || 5), 0) /
                        (feedbacksList.length || 1)
                      ).toFixed(1)} ★
                    </span>
                    <span className="text-[11px] text-slate-300">Citizen Satisfaction</span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="text-center px-2">
                    <span className="block text-2xl font-bold text-white">
                      {feedbacksList.filter((f) => !f.citizenEmail || f.citizenEmail === user?.email).length}
                    </span>
                    <span className="text-[11px] text-slate-300">My Reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Submission Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>Share Your Experience</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Rate the redressal process and help us maintain high government service standards
                </p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                {/* 1. Star Rating Selector */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-800">
                    How would you rate the service experience? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (hoverRating || feedbackRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                              isActive
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300 hover:text-amber-200"
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-3 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                      {feedbackRating === 5 && "⭐ 5/5 – Excellent & Prompt"}
                      {feedbackRating === 4 && "⭐ 4/5 – Good Resolution"}
                      {feedbackRating === 3 && "⭐ 3/5 – Satisfactory / Average"}
                      {feedbackRating === 2 && "⭐ 2/5 – Below Expectation"}
                      {feedbackRating === 1 && "⭐ 1/5 – Needs Urgent Improvement"}
                    </span>
                  </div>
                </div>

                {/* 2. Grid for Category & Linked Ticket */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Category Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                      Feedback Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Overall Redressal Speed">Overall Redressal Speed</option>
                      <option value="Water Supply & Drainage">Water Supply & Drainage</option>
                      <option value="Electricity & Street Lights">Electricity & Street Lights</option>
                      <option value="Sanitation & Garbage Disposal">Sanitation & Garbage Disposal</option>
                      <option value="Roads & Pothole Patchwork">Roads & Pothole Patchwork</option>
                      <option value="Officer & Field Inspection Conduct">Officer & Field Inspection Conduct</option>
                      <option value="CivicFlow Website & Tracking Usability">CivicFlow Website & Usability</option>
                      <option value="General Public Suggestion">General Public Suggestion</option>
                    </select>
                  </div>

                  {/* Grievance Ticket Link (Optional) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                      Link to Filed Grievance Ticket (Optional)
                    </label>
                    <select
                      value={feedbackTicketId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFeedbackTicketId(val);
                        const matchTicket = userComplaints.find((c) => c.id === val);
                        if (matchTicket && matchTicket.department) {
                          setFeedbackDepartment(matchTicket.department);
                        }
                      }}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="">General Feedback (Not tied to specific ticket)</option>
                      {userComplaints.map((c) => (
                        <option key={c.id} value={c.id}>
                          #{c.id} - {c.title.slice(0, 35)}... ({c.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Department & Satisfaction */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                      Target Department
                    </label>
                    <select
                      value={feedbackDepartment}
                      onChange={(e) => setFeedbackDepartment(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                    >
                      <option value="Electricity Board">Electricity Board</option>
                      <option value="Water Corporation">Water Corporation</option>
                      <option value="Municipal Corporation">Municipal Corporation (Sanitation)</option>
                      <option value="Public Works Department">Public Works Department (Roads)</option>
                      <option value="Traffic Police">Traffic Police</option>
                      <option value="General Administration">General Civic Administration</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                      Was your grievance resolved to your satisfaction?
                    </label>
                    <div className="flex items-center gap-3 pt-1">
                      {[
                        { val: "yes", label: "Yes, Satisfied", icon: ThumbsUp, color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
                        { val: "partial", label: "Partially", icon: Clock, color: "text-amber-700 bg-amber-50 border-amber-300" },
                        { val: "no", label: "Not Satisfied", icon: ThumbsDown, color: "text-red-700 bg-red-50 border-red-300" }
                      ].map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = feedbackSatisfaction === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setFeedbackSatisfaction(opt.val)}
                            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? `${opt.color} ring-2 ring-blue-500 shadow-xs`
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Detailed Comments & Suggestions */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700">
                      Your Detailed Remarks & Suggestions <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {feedbackComments.length}/500 characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Describe how the department handled your issue, promptness of field personnel, or suggestions to make the portal better..."
                    className="w-full border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    required
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={!feedbackComments.trim()}
                    className="bg-[#1e3a8a] hover:bg-[#1d4ed8] disabled:opacity-40 text-white font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Citizen Feedback</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Previous Feedback History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    <span>Feedback & Redressal Audit History</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Your submitted ratings and departmental review records
                  </p>
                </div>
                <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs border border-blue-200">
                  {feedbacksList.filter((f) => !f.citizenEmail || f.citizenEmail === user?.email).length} Total
                </span>
              </div>

              {feedbacksList.filter((f) => !f.citizenEmail || f.citizenEmail === user?.email).length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-slate-700 text-sm">No feedback submitted yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Use the form above to rate your experience with government department responses or civic grievances.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacksList
                    .filter((f) => !f.citizenEmail || f.citizenEmail === user?.email)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/40 hover:bg-white transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            {/* Star Rating Display */}
                            <div className="flex items-center text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-4 h-4 ${
                                    s <= (item.rating || 5)
                                      ? "text-amber-400 fill-amber-400"
                                      : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              {item.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-mono text-slate-400 text-[11px]">#{item.id}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {item.date}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-100">
                          "{item.comments}"
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {item.ticketId && (
                              <Link
                                to={`/track?id=${encodeURIComponent(item.ticketId)}`}
                                className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200"
                              >
                                <span>Ticket #{item.ticketId}</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            )}

                            {item.department && (
                              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                                🏢 {item.department}
                              </span>
                            )}

                            <span
                              className={`px-2.5 py-1 rounded-md font-semibold border ${
                                item.satisfaction === "yes"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : item.satisfaction === "partial"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-red-50 text-red-800 border-red-200"
                              }`}
                            >
                              {item.satisfaction === "yes" && "👍 Satisfied"}
                              {item.satisfaction === "partial" && "⚠️ Partially Satisfied"}
                              {item.satisfaction === "no" && "👎 Not Satisfied"}
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.status || "Acknowledged"}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
