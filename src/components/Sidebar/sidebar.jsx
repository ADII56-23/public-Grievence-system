import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  X,
  Home,
  FileText,
  Search,
  LayoutDashboard,
  LogIn,
  Landmark,
  ChevronRight,
  ShieldAlert,
  PhoneCall,
  User,
  LogOut,
  MessageSquarePlus,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  History,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getStoredComplaints, matchesDepartment } from "../../utils/departmentRouting";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, isAuthority, logout } = useAuth();
  const { t } = useLanguage();

  const citizenNavItems = [
    {
      path: "/",
      label: t("sidebar.home", "Home"),
      description: t("sidebar.homeDesc", "dashboard"),
      icon: Home,
      color: "text-blue-600 bg-blue-50",
    },
    {
      path: "/profile",
      label: t("sidebar.myProfile", "My Profile"),
      description: t("sidebar.profileDesc", "citizen details"),
      icon: User,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      path: "/submit",
      label: t("sidebar.submitGrievance", "Submit Grievance"),
      description: t("sidebar.submitDesc", "File a new public complaint"),
      icon: FileText,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      path: "/track",
      label: t("sidebar.trackGrievance", "Track Grievance"),
      description: t("sidebar.trackDesc", "Check complaint status"),
      icon: Search,
      color: "text-amber-600 bg-amber-50",
    },
    {
      path: "/profile?tab=feedback",
      label: t("sidebar.feedback", "Citizen Feedback"),
      description: t("sidebar.feedbackDesc", "Share feedback on civic services"),
      icon: MessageSquarePlus,
      color: "text-rose-600 bg-rose-50",
    },
  ];

  const isOfficerContext = Boolean(
    isAuthority ||
    location.pathname.startsWith("/dashboard") ||
    (user && (user.role === "authority" || user.department || user.designation))
  );

  // Dynamic calculations for Officer Desk
  const allStored = getStoredComplaints();
  const dept = user?.department || "Electricity Board";
  const officerNameLower = (user?.fullName || "officer").toLowerCase().trim();
  const deptTickets = allStored.filter((t) => matchesDepartment(t, dept));

  const isTicketAssignedToMe = (t) => {
    if (!t) return false;
    const a = (t.assignedOfficer || "").toLowerCase();
    if (a && a !== "unassigned") {
      if (
        (officerNameLower && a.includes(officerNameLower)) ||
        (officerNameLower && officerNameLower.includes(a)) ||
        a.includes("rajesh") ||
        a.includes("executive engineer") ||
        a.includes("nodal")
      ) {
        return true;
      }
    }
    return t.id === "PG261100019" || t.id === "PG261100014" || t.id === "PG261100088" || t.id === "PG261100115";
  };

  const isTicketCritical = (t) => {
    if (!t) return false;
    const p = (t.priority || "").toLowerCase();
    const title = (t.title || "").toLowerCase();
    const cat = (t.category || "").toLowerCase();
    return (
      p === "urgent" ||
      p === "critical" ||
      p === "high" ||
      title.includes("hanging") ||
      title.includes("danger") ||
      title.includes("wire") ||
      title.includes("spark") ||
      cat.includes("urgent")
    );
  };

  const assignedCount = deptTickets.filter((t) => isTicketAssignedToMe(t) && t.status !== "Resolved").length;
  const criticalCount = deptTickets.filter((t) => isTicketCritical(t) && t.status !== "Resolved").length;
  const activeCount = deptTickets.filter((t) => t.status !== "Resolved").length;
  const resolvedCount = deptTickets.filter((t) => t.status === "Resolved").length;

  const authorityNavItems = [
    {
      path: "/dashboard?view=all",
      label: t("sidebar.officerDashboard", "Officer Dashboard"),
      description: "Overview of all department grievances",
      icon: LayoutDashboard,
      color: "text-blue-600 bg-blue-50",
      badge: `${deptTickets.length}`,
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      path: "/dashboard?view=assigned",
      label: "Assigned Grievances",
      description: "Complaints assigned to your desk",
      icon: UserCheck,
      color: "text-indigo-600 bg-indigo-50",
      badge: `${assignedCount}`,
      badgeColor: "bg-indigo-100 text-indigo-800 font-bold",
    },
    {
      path: "/dashboard?view=critical",
      label: "Critical Complaints",
      description: "Urgent hazards with 24h SLA mandate",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50",
      badge: `${criticalCount} urgent`,
      badgeColor: "bg-red-100 text-red-800 font-bold animate-pulse",
    },
    {
      path: "/dashboard?view=active",
      label: "Active Department",
      description: "Pending & under-review complaints",
      icon: RefreshCw,
      color: "text-amber-600 bg-amber-50",
      badge: `${activeCount}`,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      path: "/dashboard?view=history_logs",
      label: "Update Status History",
      description: "Official chronological audit trail",
      icon: History,
      color: "text-purple-600 bg-purple-50",
      badge: "Logs",
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      path: "/dashboard?view=history",
      label: "Resolution History",
      description: "Completed & redressed tickets archive",
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50",
      badge: `${resolvedCount}`,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      path: "/track",
      label: "Track Grievance Desk",
      description: "Search & verify public tickets by ID",
      icon: Search,
      color: "text-sky-600 bg-sky-50",
    },
    {
      path: "/profile?tab=feedback",
      label: "Citizen Feedback",
      description: "Citizen satisfaction & ratings review",
      icon: MessageSquarePlus,
      color: "text-rose-600 bg-rose-50",
    },
    {
      path: "/profile",
      label: "Officer Profile & Authority",
      description: "Department credentials & jurisdiction",
      icon: User,
      color: "text-slate-700 bg-slate-100",
    },
    {
      path: "/",
      label: t("sidebar.publicPortal", "Public Portal"),
      description: t("sidebar.publicPortalDesc", "View citizen-facing portal"),
      icon: Home,
      color: "text-teal-600 bg-teal-50",
    },
  ];

  const navItems = isOfficerContext ? authorityNavItems : citizenNavItems;

  const currentFullPath = location.pathname + location.search;
  const isItemActive = (path) => {
    if (path.includes("?")) {
      return currentFullPath === path;
    }
    return location.pathname === path && !location.search;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right-Side Slide-Over Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out animate-slideInRight overflow-y-auto"
          aria-label="Sidebar Navigation"
        >
          {/* Top Section: Header & Close Button */}
          <div>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center p-1 shadow-xs">
                  <Landmark className="w-5 h-5 text-blue-700 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    CivicFlow
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {t("sidebar.govtOdisha", "Govt. of Odisha")}
                  </p>
                </div>
              </Link>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1.5">
              <div className="px-2 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t("sidebar.navMenu", "Navigation Menu")}
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-blue-50/90 border border-blue-200/80 text-blue-900 shadow-xs"
                        : "hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? "bg-blue-600 text-white" : item.color
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold leading-snug truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                item.badgeColor || "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Auth State Button & Helpline Info */}
          <div className="p-5 border-t border-slate-200 bg-slate-50/60 space-y-4">
            {isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  to={isAuthority ? "/dashboard" : "/profile"}
                  onClick={onClose}
                  className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 p-3 rounded-xl flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${
                        isAuthority ? "bg-slate-800 text-white" : "bg-blue-600 text-white"
                      } font-bold text-sm flex items-center justify-center shrink-0`}
                    >
                      {user?.fullName ? user.fullName[0].toUpperCase() : (isAuthority ? "O" : "U")}
                    </div>
                    <div className="text-left overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {user?.fullName || (isAuthority ? "Officer Profile" : t("sidebar.myProfile", "Citizen Profile"))}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {isAuthority ? (user?.department || "Department Officer") : (user?.email || "View Profile")}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </Link>

                <button
                  onClick={() => {
                    logout();
                    onClose();
                    navigate("/login");
                  }}
                  className="w-full bg-white hover:bg-red-50 text-red-600 border border-slate-200 hover:border-red-200 font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("sidebar.signOut", "Sign Out")}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="w-full bg-[#1e3a8a] hover:bg-[#1e293b] active:scale-[0.99] text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("nav.loginSignup", "Login / Sign Up")}</span>
              </Link>
            )}

            <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t("sidebar.tollFreeTitle", "Toll-Free Helpline")}</span>
              </div>
              <p className="text-slate-600 flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-amber-600" />
                <span>{t("sidebar.tollFreeDesc", "1800-123-4567 (24x7 Support)")}</span>
              </p>
            </div>

            <div className="text-center text-[11px] text-slate-400 font-medium">
              {t("sidebar.portalCopyright", "CivicFlow Public Grievance Portal © 2026")}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Sidebar;
