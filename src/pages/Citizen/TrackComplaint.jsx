import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import Footer from "../../components/Footer/footer";
import {
  Search,
  FileSearch,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Calendar,
  AlertCircle,
  FileText,
  Printer,
  Download,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Star
} from "lucide-react";
import axios from "axios";
import { useLanguage } from "../../context/LanguageContext";
import { getStoredComplaints } from "../../utils/departmentRouting";

function TrackComplaint() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get("id") || "";

  const [ticketInput, setTicketInput] = useState(queryId);
  const [activeTicket, setActiveTicket] = useState(queryId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complaintData, setComplaintData] = useState(null);

  // Sample mock data for quick demo/testing
   const mockDatabase = {
    "PG201100019": {
      id: "PG201100019",
      title: "Broken Streetlight & Wiring Safety Hazard",
      category: "Electrical & Public Lighting",
      department: "Bhubaneswar Municipal Corporation (BMC)",
      submittedDate: "05 Aug 2026",
      expectedResolution: "09 Aug 2026",
      status: "In Progress",
      priority: "High",
      assignedOfficer: "Rajesh Kumar Das (Executive Engineer)",
      contactNumber: "+91 94370 12345",
      address: "Lane 4, Sahid Nagar, Bhubaneswar",
      timeline: [
        {
          stage: "Grievance Registered",
          date: "05 Aug 2026, 10:15 AM",
          completed: true,
          details: "Complaint logged successfully into CivicFlow portal."
        },
        {
          stage: "Department Assigned",
          date: "05 Aug 2026, 02:30 PM",
          completed: true,
          details: "Forwarded to Electrical Division Ward 28."
        },
        {
          stage: "On-Site Inspection",
          date: "06 Aug 2026, 11:00 AM",
          completed: true,
          details: "Junior Engineer visited site; replacement light dispatched."
        },
        {
          stage: "Final Resolution",
          date: "Pending (Est. 09 Aug)",
          completed: false,
          details: "Repair work in progress."
        }
      ]
    },
    "CF-849201": {
      id: "CF-849201",
      title: "Road Repair & Pothole Patchwork",
      category: "Public Works Department (PWD)",
      department: "Odisha PWD Works Division",
      submittedDate: "01 Aug 2026",
      expectedResolution: "04 Aug 2026",
      status: "Resolved",
      priority: "Medium",
      assignedOfficer: "Smt. Sunita Mohanty (Assistant Engineer)",
      contactNumber: "+91 94371 98765",
      address: "Near Jayadev Vihar Overbridge, Bhubaneswar",
      timeline: [
        {
          stage: "Grievance Registered",
          date: "01 Aug 2026, 09:00 AM",
          completed: true,
          details: "Logged with photo attachment."
        },
        {
          stage: "Department Assigned",
          date: "01 Aug 2026, 01:20 PM",
          completed: true,
          details: "Assigned to PWD Road Maintenance Cell."
        },
        {
          stage: "On-Site Repair Executed",
          date: "03 Aug 2026, 04:00 PM",
          completed: true,
          details: "Bitumen patchwork completed."
        },
        {
          stage: "Final Resolution & Closed",
          date: "04 Aug 2026, 10:00 AM",
          completed: true,
          details: "Grievance closed with citizen satisfaction feedback."
        }
      ]
    }
  }; 

  const fetchComplaintDetails = async (idToSearch) => {
    if (!idToSearch || !idToSearch.trim()) {
      setError("Please enter a valid Ticket ID or registered Mobile Number.");
      setComplaintData(null);
      return;
    }

    setLoading(true);
    setError("");
    setComplaintData(null);

    const cleanInput = idToSearch.trim();
    const cleanLower = cleanInput.toLowerCase();
    const cleanDigits = cleanInput.replace(/\D/g, "");

    try {
      // 1. Check local persistent complaints dataset (contains user complaints & officer updates)
      const storedComplaints = getStoredComplaints();
      const storedMatch = storedComplaints.find((c) => {
        if (!c) return false;
        const cId = (c.id || "").toLowerCase().trim();

        // Exact ID match (case-insensitive)
        if (cId === cleanLower) return true;

        // Partial ID match (if query is at least 4 chars)
        if (cleanLower.length >= 4 && (cId.includes(cleanLower) || cleanLower.includes(cId))) {
          return true;
        }

        // Phone / Mobile number search
        if (cleanDigits.length >= 7) {
          const cPhone = (c.phone || c.mobile || "").replace(/\D/g, "");
          if (cPhone && (cPhone.endsWith(cleanDigits) || cleanDigits.endsWith(cPhone))) {
            return true;
          }
        }

        return false;
      });

      if (storedMatch) {
        // Normalize timeline items so completed / done flags display consistently
        const rawTimeline = Array.isArray(storedMatch.timeline) ? storedMatch.timeline : [];
        const isResolved = (storedMatch.status || "").toLowerCase().includes("resol");

        const normalizedTimeline = rawTimeline.map((step) => ({
          stage: step.stage || "Stage",
          date: step.date || "Updated",
          completed: Boolean(step.completed || step.done || (isResolved && step.stage?.toLowerCase().includes("resol"))),
          details: step.details || "",
        }));

        setComplaintData({
          ...storedMatch,
          assignedOfficer: storedMatch.assignedOfficer || "Duty Officer, Grievance Cell",
          contactNumber: storedMatch.contactNumber || "1800-123-4567 (Toll Free)",
          timeline: normalizedTimeline.length > 0 ? normalizedTimeline : [
            {
              stage: "Grievance Registered",
              date: storedMatch.submittedDate || "Recent",
              completed: true,
              details: `Dispatched to ${storedMatch.department || "Department"}.`,
            },
            {
              stage: "Under Department Review",
              date: storedMatch.status === "Pending" ? "In Progress" : "Completed",
              completed: storedMatch.status !== "Pending",
              details: `Assigned to ${storedMatch.department || "Nodal Department"} duty officer.`,
            },
            {
              stage: "Resolution",
              date: isResolved ? (storedMatch.expectedResolution || "Resolved") : "Pending",
              completed: isResolved,
              details: isResolved ? "Grievance resolved and verified." : "Awaiting final redressal.",
            },
          ],
        });
        return;
      }

      // 2. Try backend API (if connected)
      try {
        const response = await axios.get(`http://localhost:5000/api/complaints/${cleanInput}`);
        if (response.data && response.data.id) {
          setComplaintData(response.data);
          return;
        }
      } catch {
        // Backend offline / not responding
      }

      // 3. Fallback: Check mock demo database
      if (mockDatabase[cleanInput]) {
        setComplaintData(mockDatabase[cleanInput]);
        return;
      }

      // 4. If no ticket matches the ID or number: SHOW ERROR (Do NOT generate fake mock tickets!)
      setError(`No tickets found on ID / Number "${cleanInput}". Please check your Ticket ID or registered mobile number.`);
      setComplaintData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setTicketInput(queryId);
      setActiveTicket(queryId);
      fetchComplaintDetails(queryId);
    }
  }, [queryId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) {
      setError("Please enter a valid Ticket / Grievance ID");
      return;
    }
    setActiveTicket(ticketInput.trim());
    setSearchParams({ id: ticketInput.trim() });
    fetchComplaintDetails(ticketInput.trim());
  };

  const loadSample = (sampleId) => {
    setTicketInput(sampleId);
    setActiveTicket(sampleId);
    setSearchParams({ id: sampleId });
    fetchComplaintDetails(sampleId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION: Split Layout with Organic Curved Shape */}
        <section className="relative overflow-hidden bg-white py-12 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* LEFT COLUMN: Heading & Ticket Form */}
            <div className="lg:col-span-7 space-y-8 z-10">

              {/* Title & Description */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1e3a8a] tracking-tight leading-tight">
                  {t("track.title", "Track Your Grievance Status")}
                </h1>
                <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed">
                  {t(
                    "track.subtitle",
                    "Provide your reference Ticket Number below to check the status, assigned nodal department, and resolution timeline."
                  )}
                </p>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSearchSubmit} className="space-y-6 max-w-xl">
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700">
                    {t("track.ticketLabel", "Ticket ID or Registered Mobile Number")}
                  </label>
                  <div className="relative flex items-center border-b-2 border-slate-300 focus-within:border-[#1e3a8a] transition-colors pb-1">
                    <input
                      type="text"
                      value={ticketInput}
                      onChange={(e) => {
                        setTicketInput(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder={t("track.placeholder", "Enter Ticket ID (e.g. PG261100019) or Mobile Number...")}
                      className="w-full py-2 pr-10 text-slate-900 text-base sm:text-lg font-semibold outline-none bg-transparent placeholder-slate-400 tracking-wide"
                    />
                    {ticketInput && (
                      <button
                        type="button"
                        onClick={() => { setTicketInput(""); setError(""); }}
                        className="text-slate-400 hover:text-slate-600 p-1 text-xs font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button & Sample Chips */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-white font-medium px-8 py-3 rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer shrink-0 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <span>{t("track.btnTrack", "Track Grievance")}</span>
                      </>
                    )}
                  </button>

                  {/* Sample Query Chips */}
                  {/*<div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium">Try Sample:</span>
                    <button
                      type="button"
                      onClick={() => loadSample("PG201100019")}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium transition-colors cursor-pointer"
                    >
                      #PG201100019
                    </button>
                    <button
                      type="button"
                      onClick={() => loadSample("CF-849201")}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium transition-colors cursor-pointer"
                    >
                      #CF-849201
                    </button>
                  </div>*/}
                </div>
              </form>

              {/* Security Note */}
               <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted 256-bit Public Grievance Database</span>
              </div>
            </div>

            {/* RIGHT COLUMN: Soft Blue Organic Background & Floating Ticket Card */}
            <div className="lg:col-span-5 relative flex justify-center py-6">
              
              {/* Organic Soft Blue Curved Backdrop Shape */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 sm:w-96 lg:w-[440px] h-80 sm:h-96 lg:h-[420px] bg-[#e0f2fe]/80 rounded-[40%_60%_70%_30%/50%_30%_70%_50%] pointer-events-none blur-xs animate-pulse duration-1000" />

              {/* Floating Ticket Illustration Card */}
              <div className="relative z-10 w-full max-w-xs sm:max-w-sm bg-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-6 transform hover:-translate-y-1 transition-transform">

                {/* Vector Document & Magnifying Glass Graphic Box */}
                <div className="w-24 h-24 rounded-2xl bg-sky-50 border-2 border-sky-200 flex items-center justify-center relative p-3 shadow-inner">
                  <FileSearch className="w-12 h-12 text-blue-600 stroke-[1.8]" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Search className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Ticket ID Display */}
                <div className="space-y-1 w-full">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Ticket ID
                  </span>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-lg sm:text-xl font-mono font-bold text-slate-800 tracking-wider shadow-2xs">
                    {ticketInput.trim() ? ticketInput.trim().toUpperCase() : "PGXXXX00X9"}
                  </div>
                </div>

                {/* Status Indicator Badge */}
                {/* <div className="w-full pt-2 flex items-center justify-between text-xs border-t border-slate-100 text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live Tracking
                  </span>
                  <span className="text-slate-400">CivicFlow Verified</span>
                </div> */}
              </div>

              {/* Background Mock Device Corner Graphic */}
              <div className="absolute -bottom-4 -right-4 w-40 h-32 bg-[#1e293b] rounded-t-2xl shadow-xl border-4 border-slate-900 z-0 opacity-90 hidden sm:block">
                <div className="w-full h-full bg-[#1e3a8a]/90 rounded-t-xl p-3 flex flex-col justify-end">
                  <div className="w-12 h-1.5 bg-white/40 rounded-full mb-2" />
                  <div className="w-20 h-1 bg-white/20 rounded-full" />
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 2A: NO TICKET FOUND NOTIFICATION (Shown when search fails or ticket does not exist) */}
        {error && !complaintData && !loading && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200 animate-fadeIn">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-red-200 p-8 sm:p-10 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">No Tickets Found</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  No grievance record exists matching <strong className="font-mono text-slate-900">"{activeTicket || ticketInput}"</strong>.
                  Please verify the Ticket Reference Number received upon filing, or search using your registered mobile number.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => { setTicketInput(""); setError(""); }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Clear & Try Again
                </button>
                <Link
                  to="/submit"
                  className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>File a New Grievance</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2B: TRACKING RESULTS DETAILS (Shown when complaintData exists) */}
        {complaintData && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200 animate-fadeIn">
            <div className="max-w-5xl mx-auto space-y-8">

              {/* Result Header Banner Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Reference ID:
                    </span>
                    <span className="text-lg font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                      #{complaintData.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        complaintData.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : complaintData.status === "In Progress"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-blue-100 text-blue-800 border border-blue-300"
                      }`}
                    >
                      ● {complaintData.status}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {complaintData.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{complaintData.department}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    to={`/profile?tab=feedback&ticketId=${encodeURIComponent(complaintData.id)}`}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <span>Rate / Feedback</span>
                  </Link>
                  <button
                    onClick={() => window.print()}
                    className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => alert(`Downloading Receipt for Ticket #${complaintData.id}`)}
                    className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Receipt PDF</span>
                  </button>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Redressal Progress Timeline</span>
                  <span className="text-xs font-normal text-slate-500">
                    Est. Completion: {complaintData.expectedResolution || "3-5 Working Days"}
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                  {complaintData.timeline.map((step, idx) => (
                    <div key={idx} className="relative flex md:flex-col items-start gap-4 md:gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      {/* Step Indicator Dot */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                          step.completed
                            ? "bg-emerald-600 text-white shadow-md"
                            : "bg-slate-200 text-slate-500 border border-slate-300"
                        }`}
                      >
                        {step.completed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          {step.stage}
                        </h4>
                        <p className="text-xs font-medium text-slate-500">
                          {step.date}
                        </p>
                        <p className="text-xs text-slate-600 leading-snug">
                          {step.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer & Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#1e3a8a]">
                    <UserCheck className="w-4 h-4" /> Assigned Department Officer
                  </h4>
                  <div className="text-xs sm:text-sm space-y-1.5 text-slate-700">
                    <p><span className="font-semibold text-slate-900">Officer:</span> {complaintData.assignedOfficer || "Nodal Grievance Officer"}</p>
                    <p><span className="font-semibold text-slate-900">Department:</span> {complaintData.department || "Municipal Authority"}</p>
                    <p><span className="font-semibold text-slate-900">Contact Helpline:</span> {complaintData.contactNumber || "1800-123-4567"}</p>
                    <p><span className="font-semibold text-slate-900">Priority Level:</span> {complaintData.priority || "Normal"}</p>
                    {complaintData.lastUpdated && (
                      <p><span className="font-semibold text-slate-900">Last Officer Update:</span> {complaintData.lastUpdated}</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-[#1e3a8a]">
                    <FileText className="w-4 h-4" /> Location & Citizen Details
                  </h4>
                  <div className="text-xs sm:text-sm space-y-1.5 text-slate-700">
                    <p><span className="font-semibold text-slate-900">Category:</span> {complaintData.category}</p>
                    <p><span className="font-semibold text-slate-900">Location Address:</span> {complaintData.address}</p>
                    <p><span className="font-semibold text-slate-900">Date Registered:</span> {complaintData.submittedDate}</p>
                    {complaintData.citizen && (
                      <p><span className="font-semibold text-slate-900">Submitted By:</span> {complaintData.citizen}</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* SECTION 3: HOW IT WORKS (3 Simple Steps Cards) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Simple & Transparent
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                How Grievance Tracking Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                CivicFlow ensures end-to-end visibility from registration to resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-base">Enter Ticket Number</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Use your unique Grievance ID sent via SMS upon submitting your complaint form.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base">View Real-Time Progress</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  See officer assignments, site inspection updates, and department response notes.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base">Download & Verify</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download official acknowledgment receipts and provide satisfaction rating after closure.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default TrackComplaint;