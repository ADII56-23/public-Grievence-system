import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/navbar";
import Footer from "../../components/Footer/footer";
import {
  getStoredComplaints,
  matchesDepartment,
  updateComplaintRecord
} from "../../utils/departmentRouting";
import {
  ClipboardList, CheckCircle2, Clock, Search, Filter,
  ChevronDown, Eye, Edit3, Building2, User, Calendar,
  MapPin, Tag, X, TrendingUp, RefreshCw, FileText,
  Shield, AlertCircle, Download, Printer, Phone,
  ArrowRight, ShieldCheck, BarChart3, History,
  UserCheck, AlertTriangle, Flame, Zap, Check, CheckSquare, ArrowUpRight
} from "lucide-react";

/* ─── Mock grievance data ─── */
const MOCK_TICKETS = [
  {
    id: "PG261100019",
    title: "Broken Streetlight on Lane 4, Sahid Nagar",
    category: "Electricity & Street Lights",
    citizen: "Aditya Kumar",
    phone: "+91 98765 43210",
    address: "Lane 4, Sahid Nagar, Bhubaneswar",
    priority: "High",
    status: "In Progress",
    submittedDate: "05 Nov 2026",
    expectedResolution: "09 Nov 2026",
    description: "The streetlight near the lane 4 entrance has been non-functional for over a week posing safety risks at night.",
    timeline: [
      { stage: "Grievance Registered", date: "05 Nov 2026, 10:15 AM", done: true, details: "Complaint logged successfully." },
      { stage: "Department Assigned", date: "05 Nov 2026, 02:30 PM", done: true, details: "Forwarded to Electrical Division Ward 28." },
      { stage: "On-Site Inspection", date: "06 Nov 2026, 11:00 AM", done: true, details: "Junior Engineer visited site; replacement dispatched." },
      { stage: "Final Resolution", date: "Pending (Est. 09 Nov)", done: false, details: "Repair work in progress." },
    ],
  },
  {
    id: "PG261100042",
    title: "Pothole on Main Road, IRC Village",
    category: "Roads & Potholes",
    citizen: "Sunita Patra",
    phone: "+91 94370 11111",
    address: "IRC Village Main Road, near Gate 3",
    priority: "Urgent",
    status: "Pending",
    submittedDate: "04 Nov 2026",
    expectedResolution: "08 Nov 2026",
    description: "A large pothole has formed near the IRC village market gate causing daily accidents.",
    timeline: [
      { stage: "Grievance Registered", date: "04 Nov 2026", done: true, details: "Complaint logged with photo." },
      { stage: "Department Assigned", date: "Pending", done: false, details: "Awaiting assignment." },
      { stage: "On-Site Inspection", date: "Pending", done: false, details: "" },
      { stage: "Final Resolution", date: "Pending", done: false, details: "" },
    ],
  },
  {
    id: "CF-849201",
    title: "Road Repair & Pothole Patchwork near Jayadev Vihar",
    category: "Roads & Potholes",
    citizen: "Ramesh Nayak",
    phone: "+91 94371 98765",
    address: "Near Jayadev Vihar Overbridge, Bhubaneswar",
    priority: "Medium",
    status: "Resolved",
    submittedDate: "01 Nov 2026",
    expectedResolution: "04 Nov 2026",
    description: "Multiple potholes near Jayadev Vihar overbridge repaired. Bitumen patchwork completed.",
    timeline: [
      { stage: "Grievance Registered", date: "01 Nov 2026, 09:00 AM", done: true, details: "Logged with photo attachment." },
      { stage: "Department Assigned", date: "01 Nov 2026, 01:20 PM", done: true, details: "Assigned to PWD Road Maintenance Cell." },
      { stage: "On-Site Repair", date: "03 Nov 2026, 04:00 PM", done: true, details: "Bitumen patchwork completed." },
      { stage: "Closed", date: "04 Nov 2026, 10:00 AM", done: true, details: "Grievance closed with citizen satisfaction feedback." },
    ],
  },
  {
    id: "PG261100088",
    title: "Garbage Not Collected for 5 Days – Satya Nagar",
    category: "Sanitation & Garbage",
    citizen: "Priya Mohanty",
    phone: "+91 99380 55555",
    address: "Satya Nagar, Plot 12, Bhubaneswar",
    priority: "High",
    status: "Under Review",
    submittedDate: "03 Nov 2026",
    expectedResolution: "07 Nov 2026",
    description: "Door-to-door garbage collection has been skipped for 5 consecutive days causing unhygienic conditions.",
    timeline: [
      { stage: "Grievance Registered", date: "03 Nov 2026", done: true, details: "Complaint logged." },
      { stage: "Under Nodal Review", date: "03 Nov 2026", done: true, details: "Reviewing and routing to sanitation division." },
      { stage: "Field Action", date: "Pending", done: false, details: "" },
      { stage: "Final Resolution", date: "Pending", done: false, details: "" },
    ],
  },
  {
    id: "PG261100103",
    title: "Stray Dogs Menace Near School",
    category: "Stray Animals",
    citizen: "Deepak Sahoo",
    phone: "+91 90405 22222",
    address: "DPS School Road, Chandrasekharpur",
    priority: "Normal",
    status: "Pending",
    submittedDate: "02 Nov 2026",
    expectedResolution: "10 Nov 2026",
    description: "Pack of stray dogs near the school causing fear among students. One bite incident reported.",
    timeline: [
      { stage: "Grievance Registered", date: "02 Nov 2026", done: true, details: "Complaint received." },
      { stage: "Department Assigned", date: "Pending", done: false, details: "" },
      { stage: "Field Action", date: "Pending", done: false, details: "" },
      { stage: "Final Resolution", date: "Pending", done: false, details: "" },
    ],
  },
];

const STATUS_STYLE = {
  "Resolved": { pill: "bg-emerald-100 text-emerald-800 border border-emerald-300", dot: "bg-emerald-500" },
  "In Progress": { pill: "bg-amber-100 text-amber-800 border border-amber-300", dot: "bg-amber-500" },
  "Pending": { pill: "bg-red-100 text-red-800 border border-red-300", dot: "bg-red-500" },
  "Under Review": { pill: "bg-blue-100 text-blue-800 border border-blue-300", dot: "bg-blue-500" },
};

const PRIORITY_STYLE = {
  "Urgent": "bg-red-100 text-red-700 border border-red-200",
  "High": "bg-orange-100 text-orange-700 border border-orange-200",
  "Medium": "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "Normal": "bg-slate-100 text-slate-600 border border-slate-200",
};

const STATUS_OPTIONS = ["All", "Pending", "Under Review", "In Progress", "Resolved"];

export default function Dashboard() {
  const { user, isLoggedIn, isAuthority } = useAuth();
  const navigate = useNavigate();

  const officerDepartment = user?.department || "Electricity Board";
  const officerNameLower = (user?.fullName || "officer").toLowerCase().trim();

  const [allTickets, setAllTickets] = useState(() => getStoredComplaints());
  const [selectedDeptFilter, setSelectedDeptFilter] = useState(officerDepartment);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlView = new URLSearchParams(location.search).get("view") || searchParams.get("view");
  const [dashboardView, setDashboardView] = useState(urlView || "assigned"); // "assigned" | "critical" | "active" | "history_logs" | "history" | "all"
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updateNote, setUpdateNote] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [updatePriority, setUpdatePriority] = useState("");
  const [updateAssignedOfficer, setUpdateAssignedOfficer] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Sync dashboardView whenever URL location.search changes (from Sidebar navigation menu, browser navigation, or tab clicks)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = params.get("view");
    if (v) {
      setDashboardView(v);
    }
  }, [location.search]);

  const handleViewChange = (newView) => {
    setDashboardView(newView);
    setStatusFilter("All");
    navigate(`/dashboard?view=${newView}`);
  };

  // Sync latest stored complaints on mount or department change
  useEffect(() => {
    setAllTickets(getStoredComplaints());
    if (user?.department) {
      setSelectedDeptFilter(user.department);
    }
  }, [user?.department]);

  // Sync if another tab or submit page dispatches a new complaint
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "civicflow_complaints") {
        setAllTickets(getStoredComplaints());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* ── Helper: Check if ticket is assigned to current officer ── */
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
    return (
      t.id === "PG261100019" ||
      t.id === "PG261100014" ||
      t.id === "PG261100088" ||
      t.id === "PG261100115" ||
      t.id === "PG261100054"
    );
  };

  /* ── Helper: Check if ticket is critical / high urgency ── */
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

  /* ── Access guard ── */
  if (!isLoggedIn || !isAuthority) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
            This dashboard is only accessible to verified government authority officers. Please login with your official credentials.
          </p>
          <Link
            to="/login"
            className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" /> Login as Authority
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Strict Department Isolation Filtering ── */
  const departmentTickets = allTickets.filter((t) =>
    matchesDepartment(t, selectedDeptFilter)
  );

  /* ── Search, Status & View Filters on Department Tickets ── */
  const filtered = departmentTickets.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.id.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.citizen.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.address && t.address.toLowerCase().includes(q)) ||
      (t.assignedOfficer && t.assignedOfficer.toLowerCase().includes(q));

    // Dashboard View Filter (Assigned vs Critical vs Active vs History vs All)
    let matchView = true;
    if (dashboardView === "assigned") {
      matchView = isTicketAssignedToMe(t) && t.status !== "Resolved";
    } else if (dashboardView === "critical") {
      matchView = isTicketCritical(t) && t.status !== "Resolved";
    } else if (dashboardView === "active") {
      matchView = t.status !== "Resolved";
    } else if (dashboardView === "history") {
      matchView = t.status === "Resolved";
    }

    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchView && matchStatus;
  });

  const stats = {
    total: departmentTickets.length,
    assigned: departmentTickets.filter((t) => isTicketAssignedToMe(t) && t.status !== "Resolved").length,
    critical: departmentTickets.filter((t) => isTicketCritical(t) && t.status !== "Resolved").length,
    active: departmentTickets.filter((t) => t.status !== "Resolved").length,
    resolved: departmentTickets.filter((t) => t.status === "Resolved").length,
    totalUpdates: departmentTickets.reduce((acc, t) => {
      const hCount = Array.isArray(t.statusHistory) && t.statusHistory.length > 0
        ? t.statusHistory.length
        : (t.timeline ? t.timeline.length : 1);
      return acc + hCount;
    }, 0)
  };

  /* ── Compute All Update Status History Audit Logs across department tickets ── */
  const allHistoryLogs = departmentTickets.flatMap((t) => {
    const list = Array.isArray(t.statusHistory) && t.statusHistory.length > 0
      ? t.statusHistory
      : [
          {
            id: `HIST-${t.id}-init`,
            timestamp: `${t.submittedDate || "05 Nov 2026"}, 10:15 AM`,
            date: t.submittedDate || "05 Nov 2026",
            previousStatus: "Initiated",
            newStatus: "Grievance Registered",
            officer: "System Gateway",
            designation: "Auto-Routing",
            department: t.department || selectedDeptFilter,
            action: "Grievance Logged",
            remarks: "Public grievance recorded and routed to department nodal authority."
          },
          ...(Array.isArray(t.timeline) && t.timeline.length > 1
            ? t.timeline.slice(1).filter((s) => s.done || s.completed).map((s, idx) => ({
                id: `HIST-${t.id}-${idx + 1}`,
                timestamp: s.date || "Recent",
                date: s.date || "Recent",
                previousStatus: idx === 0 ? "Pending" : "In Progress",
                newStatus: s.stage || "In Progress",
                officer: t.assignedOfficer || user?.fullName || "Assigned Officer",
                designation: "Executive Officer",
                department: t.department || selectedDeptFilter,
                action: s.stage || "Stage Update",
                remarks: s.details || "Grievance stage updated."
              }))
            : [])
        ];

    return list.map((h) => ({
      ...h,
      ticketId: t.id,
      ticketTitle: t.title,
      ticketCategory: t.category,
      ticketPriority: t.priority,
      currentStatus: t.status,
      ticket: t
    }));
  }).sort((a, b) => (b.id || "").localeCompare(a.id || ""));

  /* ── 1-Click Feature: Claim / Assign Ticket to Current Officer ── */
  const handleAssignToMe = (ticketId) => {
    const officerStr = `${user?.fullName || "Officer"} (${user?.designation || "Executive Officer"})`;
    const targetTicket = allTickets.find((t) => t.id === ticketId);
    if (!targetTicket) return;

    const prevHistory = Array.isArray(targetTicket.statusHistory) ? targetTicket.statusHistory : [];
    const newHistoryItem = {
      id: "HIST-" + Date.now().toString().slice(-6),
      timestamp: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      previousStatus: targetTicket.status || "Pending",
      newStatus: targetTicket.status === "Pending" ? "Under Review" : targetTicket.status,
      officer: user?.fullName || "Officer",
      designation: user?.designation || "Executive Officer",
      department: user?.department || selectedDeptFilter,
      action: "Officer Assigned",
      remarks: `Claimed and assigned to ${officerStr} for investigation.`
    };

    const updatedFields = {
      assignedOfficer: officerStr,
      status: targetTicket.status === "Pending" ? "Under Review" : targetTicket.status,
      statusHistory: [newHistoryItem, ...prevHistory],
      lastUpdated: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    };

    updateComplaintRecord(ticketId, updatedFields);

    setAllTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, ...updatedFields } : t))
    );

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => ({ ...prev, ...updatedFields }));
      setUpdateAssignedOfficer(officerStr);
    }

    setToastMsg(`Ticket #${ticketId} has been successfully assigned to you!`);
    setTimeout(() => setToastMsg(""), 3500);
  };

  /* ── Save Update with Detailed Status History Logging ── */
  const handleSaveUpdate = () => {
    if (!updateStatus && !updateNote.trim() && !updatePriority && !updateAssignedOfficer) return;

    const prevTimeline = Array.isArray(selectedTicket.timeline) ? selectedTicket.timeline : [];
    const prevHistory = Array.isArray(selectedTicket.statusHistory) ? selectedTicket.statusHistory : [];

    const newStatus = updateStatus || selectedTicket.status;
    const newPriority = updatePriority || selectedTicket.priority || "High";
    const newOfficer = updateAssignedOfficer || selectedTicket.assignedOfficer || `${user?.fullName || "Officer"} (${user?.designation || "Executive Officer"})`;

    const newHistoryItem = {
      id: "HIST-" + Date.now().toString().slice(-6),
      timestamp: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      previousStatus: selectedTicket.status,
      newStatus: newStatus,
      officer: user?.fullName || "Officer",
      designation: user?.designation || "Executive Officer",
      department: user?.department || selectedDeptFilter,
      action: newStatus !== selectedTicket.status ? `Status changed to ${newStatus}` : "Officer Remark Added",
      remarks: updateNote.trim() || `Status updated from ${selectedTicket.status} to ${newStatus}`
    };

    const newTimelineItem = updateNote.trim()
      ? {
          stage: "Officer Remark",
          date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          done: true,
          completed: true,
          details: `${updateNote.trim()} (${user?.fullName || "Officer"}, ${user?.department || selectedDeptFilter})`,
        }
      : null;

    const updatedTimeline = [
      ...prevTimeline.map((s) => ({
        ...s,
        done: Boolean(s.done || s.completed),
        completed: Boolean(s.done || s.completed),
      })),
      ...(newTimelineItem ? [newTimelineItem] : []),
    ];

    // If marked as Resolved, append resolution step if not present
    if (newStatus === "Resolved" && !updatedTimeline.some((s) => s.stage?.toLowerCase().includes("resol"))) {
      updatedTimeline.push({
        stage: "Grievance Redressed & Resolved",
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        done: true,
        completed: true,
        details: `Issue verified and resolved by ${user?.fullName || "Assigned Officer"} (${user?.department || selectedDeptFilter}).`,
      });
    }

    const updatedFields = {
      status: newStatus,
      priority: newPriority,
      assignedOfficer: newOfficer,
      timeline: updatedTimeline,
      statusHistory: [newHistoryItem, ...prevHistory],
      contactNumber: user?.phone || user?.mobile || "+91 94370 12345",
      lastUpdated: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    };

    // Persist in localStorage department routing database
    updateComplaintRecord(selectedTicket.id, updatedFields);

    setAllTickets((prev) =>
      prev.map((t) =>
        t.id && t.id.toLowerCase() === selectedTicket.id.toLowerCase()
          ? { ...t, ...updatedFields }
          : t
      )
    );

    setSelectedTicket((prev) => (prev ? { ...prev, ...updatedFields } : null));
    setUpdateNote("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
      <Navbar />

      <main className="flex-1">

        {/* ── HERO BANNER (same Govt of Odisha style as Home, Submit & Track pages) ── */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#083b77] via-[#1e3a8a] to-[#1e293b] py-10 lg:py-14 px-4 sm:px-6 lg:px-8 text-white shadow-inner">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Odisha Govt Authority Ribbon */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-200 bg-blue-900/70 px-3 py-1 rounded-full border border-blue-700/80 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Govt. of Odisha
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-100 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  🏛️ Public Grievance Redressal Authority
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Nodal Desk Active
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Officer Redressal & Authority Desk
              </h1>
              <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
                Review, investigate, assign, and update citizen grievances registered in your department's jurisdiction with end-to-end accountability.
              </p>
            </div>

            {/* Officer card */}
            <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl px-5 py-4 flex items-center gap-4 shrink-0 shadow-lg">
              <div className="w-13 h-13 rounded-full bg-white text-[#1e3a8a] font-bold text-xl flex items-center justify-center shadow-md shrink-0 border-2 border-blue-200">
                {user?.fullName ? user.fullName[0].toUpperCase() : "O"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-white text-base">{user?.fullName || "Officer"}</p>
                  <span className="text-emerald-400 text-xs" title="Verified Authority Officer">✓</span>
                </div>
                <p className="text-blue-200 text-xs font-medium">{user?.designation || "Executive Engineer"}</p>
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-[11px] font-semibold text-white">
                  <span>🏢</span>
                  <span>{user?.department || officerDepartment}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAST-TRACK URGENCY ALERT BANNER (styled identically to Home Page urgency card) ── */}
        {stats.critical > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-2 relative z-20">
            <button
              onClick={() => handleViewChange("critical")}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.99] text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group cursor-pointer text-left border border-orange-400/40"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base sm:text-lg">
                      Priority Grievance Alert ({stats.critical} Critical Complaints)
                    </span>
                    <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      24h SLA Mandate
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-orange-100 font-medium mt-0.5">
                    Urgent public safety hazards require prompt inspection, resource dispatch, and verified redressal.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden md:inline text-xs font-bold text-white bg-white/20 px-3 py-1.5 rounded-xl">
                  Triage Urgent Tickets
                </span>
                <ChevronRight className="w-5 h-5 text-white/90 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </section>
        )}

        {/* ── STATS CARDS ── */}
        <section className="bg-slate-50 border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Assigned to Me */}
            <button
              type="button"
              onClick={() => handleViewChange("assigned")}
              className={`rounded-2xl border ${
                dashboardView === "assigned"
                  ? "border-blue-600 ring-2 ring-blue-500 bg-blue-50/50"
                  : "border-blue-200 bg-white"
              } p-4 sm:p-5 flex items-center gap-3.5 shadow-xs text-left cursor-pointer hover:shadow-md transition-all active:scale-[0.98]`}
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm text-white">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-slate-900 leading-none">{stats.assigned}</p>
                <p className="text-xs text-slate-700 font-bold mt-1 truncate">Assigned to Me</p>
                <span className="text-[10px] text-blue-600 font-semibold">My grievance desk</span>
              </div>
            </button>

            {/* 2. Critical Complaints */}
            <button
              type="button"
              onClick={() => handleViewChange("critical")}
              className={`rounded-2xl border ${
                dashboardView === "critical"
                  ? "border-red-600 ring-2 ring-red-500 bg-red-100/60"
                  : "border-red-200 bg-red-50/70"
              } p-4 sm:p-5 flex items-center gap-3.5 shadow-xs text-left cursor-pointer hover:shadow-md transition-all active:scale-[0.98]`}
            >
              <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-sm text-white relative">
                <AlertTriangle className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-red-700 leading-none">{stats.critical}</p>
                <p className="text-xs text-red-900 font-bold mt-1 truncate">Critical Complaints</p>
                <span className="text-[10px] text-red-600 font-semibold">Urgent safety SLA</span>
              </div>
            </button>

            {/* 3. Active Department Complaints */}
            <button
              type="button"
              onClick={() => handleViewChange("active")}
              className={`rounded-2xl border ${
                dashboardView === "active"
                  ? "border-amber-600 ring-2 ring-amber-500 bg-amber-50"
                  : "border-amber-200 bg-white"
              } p-4 sm:p-5 flex items-center gap-3.5 shadow-xs text-left cursor-pointer hover:shadow-md transition-all active:scale-[0.98]`}
            >
              <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm text-white">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-slate-900 leading-none">{stats.active}</p>
                <p className="text-xs text-slate-700 font-bold mt-1 truncate">Active Complaints</p>
                <span className="text-[10px] text-amber-700 font-semibold">Pending & in progress</span>
              </div>
            </button>

            {/* 4. Update Status History */}
            <button
              type="button"
              onClick={() => handleViewChange("history_logs")}
              className={`rounded-2xl border ${
                dashboardView === "history_logs"
                  ? "border-indigo-600 ring-2 ring-indigo-500 bg-indigo-50/70"
                  : "border-indigo-200 bg-white"
              } p-4 sm:p-5 flex items-center gap-3.5 shadow-xs text-left cursor-pointer hover:shadow-md transition-all active:scale-[0.98]`}
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm text-white">
                <History className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-indigo-900 leading-none">{stats.totalUpdates}</p>
                <p className="text-xs text-slate-700 font-bold mt-1 truncate">Update Status History</p>
                <span className="text-[10px] text-indigo-600 font-semibold">Live audit trail</span>
              </div>
            </button>
          </div>
        </section>

        {/* ── TICKET LIST & AUDIT VIEWS ── */}
        <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Global toast notification */}
            {toastMsg && (
              <div className="p-4 rounded-xl bg-blue-900 text-white text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{toastMsg}</span>
                </div>
                <button onClick={() => setToastMsg("")} className="text-white/70 hover:text-white p-1">
                  ✕
                </button>
              </div>
            )}


            {/* View Selector Tabs (Assigned vs Critical vs Active vs History Logs vs Resolution History) */}
            <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto scrollbar-none pb-px">
              {/* 1. Assigned Grievances */}
              <button
                onClick={() => handleViewChange("assigned")}
                className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  dashboardView === "assigned"
                    ? "border-blue-700 text-blue-800 bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                }`}
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Assigned Grievances ({stats.assigned})</span>
              </button>

              {/* 2. Critical Complaints */}
              <button
                onClick={() => handleViewChange("critical")}
                className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  dashboardView === "critical"
                    ? "border-red-600 text-red-700 bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-slate-500 hover:text-red-700 hover:bg-red-50/60"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Critical Complaints ({stats.critical})</span>
              </button>

              {/* 3. Active Department Complaints */}
              <button
                onClick={() => handleViewChange("active")}
                className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  dashboardView === "active"
                    ? "border-amber-600 text-amber-800 bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ClipboardList className="w-4 h-4 text-amber-600" />
                <span>Active Department ({stats.active})</span>
              </button>

              {/* 4. Update Status History */}
              <button
                onClick={() => handleViewChange("history_logs")}
                className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  dashboardView === "history_logs"
                    ? "border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <History className="w-4 h-4 text-indigo-600" />
                <span>Update Status History</span>
              </button>

              {/* 5. Resolution History */}
              <button
                onClick={() => handleViewChange("history")}
                className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  dashboardView === "history"
                    ? "border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resolution History ({stats.resolved})</span>
              </button>

              {/* 6. All Tickets */}
              <button
                onClick={() => handleViewChange("all")}
                className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  dashboardView === "all"
                    ? "border-slate-800 text-slate-900 bg-white rounded-t-xl shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>All Tickets ({stats.total})</span>
              </button>
            </div>

            {/* Context Banners for Selected View */}
            {dashboardView === "assigned" && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between gap-4 text-blue-900 text-xs sm:text-sm animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>
                    <strong>Assigned Grievances Desk:</strong> Showing tickets assigned directly to <strong>{user?.fullName || "You"}</strong> ({user?.designation || "Officer"}). You can investigate, inspect, or resolve these tickets.
                  </span>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold border border-blue-300 shrink-0">
                  {stats.assigned} Assigned
                </span>
              </div>
            )}

            {dashboardView === "critical" && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center justify-between gap-4 text-red-900 text-xs sm:text-sm animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 animate-pulse" />
                  <span>
                    <strong>Critical & High Urgency Escalation:</strong> Public safety hazards, live electrical cables, pipeline bursts, and CM-priority complaints requiring expedited action within 24–48 hours.
                  </span>
                </div>
                <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold border border-red-300 shrink-0">
                  {stats.critical} Critical
                </span>
              </div>
            )}

            {dashboardView === "history" && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl flex items-center justify-between gap-4 text-emerald-900 text-xs sm:text-sm animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Resolution History Archive:</strong> Displaying all completed and resolved grievances for <strong>{selectedDeptFilter}</strong>.
                  </span>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold border border-emerald-300 shrink-0">
                  {stats.resolved} Resolved
                </span>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════ */}
            {/* VIEW A: UPDATE STATUS HISTORY AUDIT LOGS (If history_logs) */}
            {/* ═════════════════════════════════════════════════════════════ */}
            {dashboardView === "history_logs" ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn space-y-4">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <History className="w-5 h-5 text-indigo-600" />
                      <span>Status Update History & Redressal Audit Trail</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Chronological log of all status transitions, officer actions, and field remarks recorded for {selectedDeptFilter}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full self-start sm:self-auto">
                    {allHistoryLogs.length} Total Audit Records
                  </span>
                </div>

                <div className="p-4 sm:p-5 overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold">
                        <th className="pb-3 px-3">Date & Time</th>
                        <th className="pb-3 px-3">Ticket ID & Title</th>
                        <th className="pb-3 px-3">Status Transition</th>
                        <th className="pb-3 px-3">Updated By Officer</th>
                        <th className="pb-3 px-3">Remarks / Action</th>
                        <th className="pb-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allHistoryLogs.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 font-mono text-xs">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{log.timestamp || log.date}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 min-w-[180px]">
                            <span className="font-bold font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">
                              #{log.ticketId}
                            </span>
                            <p className="font-semibold text-slate-800 text-xs mt-1 line-clamp-1">
                              {log.ticketTitle}
                            </p>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px]">
                                {log.previousStatus || "Initiated"}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold">
                                {log.newStatus || "Updated"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="text-xs">
                              <span className="font-bold text-slate-900 block">{log.officer}</span>
                              <span className="text-[11px] text-slate-400">{log.designation || "Nodal Authority"}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 max-w-xs text-xs text-slate-600 leading-snug">
                            <p className="line-clamp-2 italic">"{log.remarks}"</p>
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                const matched = allTickets.find((t) => t.id === log.ticketId) || log.ticket;
                                setSelectedTicket(matched);
                                setUpdateStatus(matched?.status || "");
                                setUpdatePriority(matched?.priority || "High");
                                setUpdateAssignedOfficer(matched?.assignedOfficer || "");
                                setUpdateNote("");
                                setSaveSuccess(false);
                              }}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Ticket</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ═════════════════════════════════════════════════════════════ */
              /* VIEW B: TICKET CARDS (Assigned, Critical, Active, Resolved) */
              /* ═════════════════════════════════════════════════════════════ */
              <>
                {/* Toolbar */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        dashboardView === "critical"
                          ? "bg-red-600"
                          : dashboardView === "assigned"
                          ? "bg-blue-600"
                          : dashboardView === "history"
                          ? "bg-emerald-600"
                          : "bg-[#1e3a8a]"
                      }`}
                    >
                      {dashboardView === "critical" ? (
                        <AlertTriangle className="w-4 h-4 text-white" />
                      ) : dashboardView === "assigned" ? (
                        <UserCheck className="w-4 h-4 text-white" />
                      ) : dashboardView === "history" ? (
                        <History className="w-4 h-4 text-white" />
                      ) : (
                        <ClipboardList className="w-4 h-4 text-white" />
                      )}
                    </span>
                    <span>
                      {dashboardView === "assigned"
                        ? "Assigned Grievances"
                        : dashboardView === "critical"
                        ? "Critical & Urgent Complaints"
                        : dashboardView === "history"
                        ? "Resolution History"
                        : "Grievance Tickets"}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {filtered.length} of {departmentTickets.length}
                    </span>
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tickets, citizen, address..."
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56 transition-all"
                      />
                    </div>
                    {/* Status filter */}
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tickets Grid */}
                {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-16 text-center space-y-3">
                    {dashboardView === "assigned" ? (
                      <>
                        <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
                        <h3 className="font-bold text-slate-700 text-sm">No Grievances Currently Assigned to You</h3>
                        <p className="text-slate-400 text-xs max-w-sm mx-auto">
                          You can claim and assign incoming department grievances using the "Assign to Me" button on any active complaint.
                        </p>
                        <button
                          onClick={() => handleViewChange("active")}
                          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                        >
                          <span>Browse Active Complaints</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : dashboardView === "critical" ? (
                      <>
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                        <h3 className="font-bold text-slate-700 text-sm">No Critical Emergencies Pending</h3>
                        <p className="text-slate-400 text-xs max-w-sm mx-auto">
                          All high-urgency public safety hazards in {selectedDeptFilter} have been reviewed.
                        </p>
                      </>
                    ) : dashboardView === "history" ? (
                      <>
                        <History className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="text-slate-400 font-medium text-xs">No resolved grievances found in history for {selectedDeptFilter}</p>
                      </>
                    ) : (
                      <>
                        <ClipboardList className="w-12 h-12 text-slate-200 mx-auto" />
                        <p className="text-slate-400 font-medium text-xs">No tickets match your search or filter</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((ticket) => {
                      const sc = STATUS_STYLE[ticket.status] || STATUS_STYLE["Pending"];
                      const pc = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE["Normal"];
                      const isCritical = isTicketCritical(ticket);
                      const isAssignedToMe = isTicketAssignedToMe(ticket);

                      return (
                        <div
                          key={ticket.id}
                          className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all p-5 space-y-4 group relative ${
                            isCritical && ticket.status !== "Resolved"
                              ? "border-red-300 ring-1 ring-red-200 bg-red-50/15"
                              : "border-slate-200"
                          }`}
                        >
                          {/* Critical Highlight Badge */}
                          {isCritical && ticket.status !== "Resolved" && (
                            <div className="flex items-center justify-between pb-1 border-b border-red-100 text-[11px] font-bold text-red-700">
                              <span className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                </span>
                                🚨 Critical Public Safety SLA
                              </span>
                              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-mono">
                                24h Emergency Response
                              </span>
                            </div>
                          )}

                          {/* Ticket header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                  #{ticket.id}
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  🏢 {ticket.department || ticket.category}
                                </span>
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${sc.pill}`}>
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dot} mr-1.5`} />
                                  {ticket.status}
                                </span>
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${pc}`}>
                                  {ticket.priority}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                                {ticket.title}
                              </h3>
                            </div>
                          </div>

                          {/* Meta Details */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{ticket.citizen}</span>
                            </span>
                            <span className="flex items-center gap-1.5 truncate">
                              <Tag className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{ticket.category}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              <span>{ticket.submittedDate}</span>
                            </span>
                            <span className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{ticket.address?.split(",")[0] || "Location"}</span>
                            </span>
                          </div>

                          {/* Assigned Officer Row & 1-Click Assignment */}
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <UserCheck className={`w-3.5 h-3.5 ${isAssignedToMe ? "text-blue-600 font-bold" : "text-slate-400"}`} />
                              <span className="text-[11px] text-slate-600 truncate">
                                Assigned: <strong className="text-slate-800">{ticket.assignedOfficer || "Unassigned"}</strong>
                              </span>
                            </div>

                            {!isAssignedToMe && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignToMe(ticket.id);
                                }}
                                className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition-colors cursor-pointer shrink-0"
                              >
                                + Assign to Me
                              </button>
                            )}
                          </div>

                          {/* Mini progress bar & Update History counter */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                              <span>Redressal Progress</span>
                              <span className="flex items-center gap-1 text-slate-500 font-semibold">
                                <History className="w-3 h-3 text-indigo-500" />
                                {Array.isArray(ticket.statusHistory) && ticket.statusHistory.length > 0
                                  ? `${ticket.statusHistory.length} status logs`
                                  : `${ticket.timeline?.filter((s) => s.done).length || 1} logs`}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500 bg-[#1e3a8a]"
                                style={{
                                  width: `${
                                    ((ticket.timeline?.filter((s) => s.done).length || 1) /
                                      (ticket.timeline?.length || 4)) *
                                    100
                                  }%`
                                }}
                              />
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setUpdateStatus(ticket.status);
                              setUpdatePriority(ticket.priority || "High");
                              setUpdateAssignedOfficer(ticket.assignedOfficer || `${user?.fullName || "Officer"} (${user?.designation || "Executive Engineer"})`);
                              setUpdateNote("");
                              setSaveSuccess(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#1e293b] text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Review & Update Ticket</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </div>
        </section>

      </main>

      <Footer />

      {/* ══════════ TICKET DETAIL DRAWER ══════════ */}
      {selectedTicket && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs animate-fadeIn"
            onClick={() => setSelectedTicket(null)}
          />

          {/* Drawer panel */}
          <div className="fixed right-0 top-0 h-full z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideInRight overflow-hidden">

            {/* Drawer header */}
            <div className="bg-[#1e3a8a] px-6 py-5 flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                    Ticket #{selectedTicket.id}
                  </span>
                  {isTicketCritical(selectedTicket) && (
                    <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      🚨 Critical Issue
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white leading-tight line-clamp-2">
                  {selectedTicket.title}
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(() => {
                    const sc = STATUS_STYLE[selectedTicket.status] || STATUS_STYLE["Pending"];
                    const pc = PRIORITY_STYLE[selectedTicket.priority] || PRIORITY_STYLE["Normal"];
                    return (
                      <>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${sc.pill}`}>
                          ● {selectedTicket.status}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${pc}`}>
                          {selectedTicket.priority} Priority
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-700/60 text-blue-100 border border-blue-500">
                          👤 {selectedTicket.assignedOfficer || "Unassigned"}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Citizen & Location cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-2">
                  <h3 className="text-xs font-bold text-[#1e3a8a] flex items-center gap-1.5 uppercase tracking-wider">
                    <User className="w-3.5 h-3.5" /> Citizen Info
                  </h3>
                  <div className="text-xs text-slate-700 space-y-1.5">
                    <p><span className="font-semibold">Name:</span> {selectedTicket.citizen}</p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {selectedTicket.phone}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-2">
                  <h3 className="text-xs font-bold text-[#1e3a8a] flex items-center gap-1.5 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" /> Location & Category
                  </h3>
                  <div className="text-xs text-slate-700 space-y-1.5">
                    <p><span className="font-semibold">Department:</span> {selectedTicket.department}</p>
                    <p><span className="font-semibold">Category:</span> {selectedTicket.category}</p>
                    <p className="truncate"><span className="font-semibold">Address:</span> {selectedTicket.address}</p>
                    <p><span className="font-semibold">Est. SLA:</span> {selectedTicket.expectedResolution}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Description
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Redressal Progress Timeline */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#1e3a8a]" />
                    Redressal Progress Timeline
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Target: {selectedTicket.expectedResolution}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {selectedTicket.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          step.done ? "bg-emerald-600 text-white shadow-xs" : "bg-slate-100 text-slate-400 border border-slate-300"
                        }`}
                      >
                        {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-slate-800 leading-tight">{step.stage}</p>
                        <p className="text-[10px] text-slate-400">{step.date}</p>
                        {step.details && (
                          <p className="text-[11px] text-slate-600 leading-snug">{step.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── NEW FEATURE: Detailed Status Update History Audit Trail ── */}
              <div className="bg-indigo-50/40 rounded-xl border border-indigo-100 p-4 space-y-3">
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-600" />
                    Status Update History & Audit Trail
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                    {Array.isArray(selectedTicket.statusHistory) && selectedTicket.statusHistory.length > 0
                      ? `${selectedTicket.statusHistory.length} Logged Updates`
                      : "1 Log"}
                  </span>
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {(Array.isArray(selectedTicket.statusHistory) && selectedTicket.statusHistory.length > 0
                    ? selectedTicket.statusHistory
                    : [
                        {
                          timestamp: `${selectedTicket.submittedDate || "Recent"}, 10:00 AM`,
                          action: "Grievance Registered",
                          officer: "System Gateway",
                          remarks: "Complaint logged and routed to department."
                        }
                      ]
                  ).map((hist, hIdx) => (
                    <div
                      key={hIdx}
                      className="bg-white p-3 rounded-lg border border-indigo-100 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-900">
                          {hist.action || hist.newStatus || "Status Updated"}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {hist.timestamp || hist.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">"{hist.remarks || hist.remark}"</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-indigo-500" />
                        <span>By {hist.officer || hist.updatedBy || "Nodal Officer"}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print / Download actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => alert(`Downloading official redressal report for Ticket #${selectedTicket.id}`)}
                  className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Report
                </button>
              </div>

              {/* ── UPDATE CONTROLS ── */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#1e3a8a] flex items-center justify-center shrink-0">
                    <Edit3 className="w-3.5 h-3.5 text-white" />
                  </span>
                  Update Grievance Status & Officer Assignment
                </h3>

                {/* Success toast */}
                {saveSuccess && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Status updated and recorded in audit history successfully!
                  </div>
                )}

                {/* Controls Grid: Status & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Status Dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Update Redressal Status
                    </label>
                    <div className="relative">
                      <select
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-800 font-medium cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Priority Dropdown (allows marking Critical) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Priority Level (Critical Escalation)
                    </label>
                    <select
                      value={updatePriority}
                      onChange={(e) => setUpdatePriority(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-800 font-medium cursor-pointer"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">🚨 Urgent / Critical Emergency</option>
                    </select>
                  </div>
                </div>

                {/* Officer Assignment Dropdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Assigned Officer
                    </label>
                    <button
                      type="button"
                      onClick={() => setUpdateAssignedOfficer(`${user?.fullName || "Officer"} (${user?.designation || "Executive Officer"})`)}
                      className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                    >
                      Assign to Me ({user?.fullName || "Officer"})
                    </button>
                  </div>
                  <input
                    type="text"
                    value={updateAssignedOfficer}
                    onChange={(e) => setUpdateAssignedOfficer(e.target.value)}
                    placeholder="e.g. Rajesh Kumar Das (Executive Engineer) or Junior Line Inspector"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-800"
                  />
                </div>

                {/* Officer Remarks */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Official Remark / Note for Citizen & Audit
                  </label>
                  <textarea
                    rows={3}
                    value={updateNote}
                    onChange={(e) => setUpdateNote(e.target.value)}
                    placeholder="e.g. On-site technical inspection complete. Replacement materials dispatched; repairs will finish by 5 PM..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm text-slate-800 placeholder-slate-400 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveUpdate}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Update & Log to Status History</span>
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}