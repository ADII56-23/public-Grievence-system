import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import Footer from "../../components/Footer/footer";
import grievancePuzzleImg from "../../assets/grievance-puzzle.png";
import grievanceResolutionImg from "../../assets/grievance-resolution.png";
import {
  CalendarDays,
  FileEdit,
  Search,
  Bot,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Sparkles,
  ChevronRight,
  Receipt
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [grievanceId, setGrievanceId] = useState("");
  const [homeChatInput, setHomeChatInput] = useState("");

  const handleSearchStatus = (e) => {
    e.preventDefault();
    if (grievanceId.trim()) {
      navigate(`/track?id=${encodeURIComponent(grievanceId.trim())}`);
    } else {
      navigate("/track");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
      {/* Top Navbar Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* SECTION 1: HERO / CM APPOINTMENT & GRIEVANCE REGISTRATION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* CM Grievance Appointment Banner Card */}
              <div className="space-y-2 max-w-xl">
                <button
                  onClick={() => navigate("/submit?type=cm_appointment")}
                  className="w-full bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.99] text-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                      <CalendarDays className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-base sm:text-lg">
                      {t("home.urgencyBanner", "Click here for urgency Grievance")}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <div className="pl-1">
                  <span className="text-xs text-slate-500 font-medium">
                    {t("home.alreadyBooked", "Already Booked!")}{" "}
                  </span>
                  <Link
                    to="/track"
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Receipt className="w-3 h-3" />{" "}
                    {t("home.getReceipt", "Get your Acknowledgement Receipt")}
                  </Link>
                </div>
              </div>

              {/* Main Heading & Subtext */}
              <div className="space-y-3 pt-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1e3a8a] leading-tight max-w-2xl">
                  {t(
                    "home.heroTitle",
                    "This platform aims to register your grievance and assist you in its redressal"
                  )}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                  {t(
                    "home.heroDesc",
                    "To proceed, please provide details about your grievance. Your information is secure with us."
                  )}
                </p>
              </div>

              {/* Citizen Register Grievance Button */}
              <div>
                <button
                  onClick={() => navigate("/submit")}
                  className="bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 text-sm sm:text-base cursor-pointer"
                >
                  <FileEdit className="w-5 h-5" />
                  <span>{t("home.registerGrievanceBtn", "Register Grievance")}</span>
                </button>
              </div>

              {/* Govt. Employee Section */}
              <div className="pt-4 border-t border-slate-200/80 space-y-3 max-w-xl">
                <p className="text-xs sm:text-sm text-slate-600 leading-normal">
                  {t(
                    "home.govtEmployeeDesc",
                    "Govt Employee please provide details of your grievance to proceed. Your information will remain secure with us."
                  )}
                </p>
                <button
                  onClick={() => navigate("/submit?userType=govt")}
                  className="bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.99] text-white font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>
                    {t("home.govtEmployeeBtn", "Register Grievance Govt. Employee")}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Side: Hero Grievance Puzzle & Concept Image Cards */}
            <div className="lg:col-span-5 relative flex justify-center py-4">
              <div className="relative w-full max-w-md">
                {/* Main Hero Card: Grievance Puzzle */}
                <div className="relative z-10 bg-white p-3 rounded-2xl shadow-xl border border-slate-200">
                  <div className="rounded-xl overflow-hidden shadow-inner aspect-[4/3] bg-slate-900">
                    <img
                      src={grievancePuzzleImg}
                      alt="Grievance Puzzle Redressal"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-3 px-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{t("home.transparent", "100% Transparent")}</span>
                    </span>
                  </div>
                </div>

                {/* Secondary Floating Concept Card: Resolution */}
                <div className="absolute -bottom-6 -left-6 z-20 w-44 sm:w-52 bg-white p-2 rounded-xl shadow-2xl border border-slate-200">
                  <div className="rounded-lg overflow-hidden aspect-[4/3] bg-slate-100">
                    <img
                      src={grievanceResolutionImg}
                      alt="Grievance Resolution"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-1.5 text-center">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                      {t("home.fastTrackResolution", "Fast-Track Resolution")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: KNOW YOUR GRIEVANCE STATUS (SEARCH BANNER) */}
        <section className="bg-[#083b77] text-white py-12 sm:py-16 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="max-w-4xl mx-auto relative z-10 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                {t("home.statusHeading", "Know your Grievance Status")}
              </h2>
              <div className="w-28 h-1 bg-[#f97316] rounded-full" />
            </div>

            {/* Grievance ID Search Form */}
            <form onSubmit={handleSearchStatus} className="max-w-xl">
              <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden p-1">
                <input
                  type="text"
                  value={grievanceId}
                  onChange={(e) => setGrievanceId(e.target.value)}
                  placeholder={t(
                    "home.statusPlaceholder",
                    "Your Grievance ID (e.g. PG201100019)"
                  )}
                  className="flex-1 px-4 py-3 text-slate-800 placeholder-slate-400 text-sm sm:text-base outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.98] text-white px-6 py-3 rounded-md transition-all flex items-center justify-center cursor-pointer shrink-0"
                  aria-label={t("home.searchBtn", "Search")}
                >
                  <Search className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* SECTION 3: KEY METRICS & PORTAL STATS */}
        <section className="py-12 bg-slate-50 border-b border-slate-200/60 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <FileEdit className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">1,24,890+</div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t("home.grievancesRegistered", "Grievances Registered")}
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">96.4%</div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t("home.resolutionRate", "Resolution Rate")}
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">48 Hrs</div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t("home.avgResponseTime", "Avg. Response Time")}
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">30+</div>
              <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t("home.govtDepartments", "Govt. Departments")}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CONNECT WITH AI HELPDESK */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Chat Button */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />{" "}
                  {t("home.aiAssistanceBadge", "24/7 AI Assistance")}
                </span>
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#1e3a8a] leading-tight">
                  {t("home.connectHelpdesk", "Connect with CivicFlow Helpdesk")}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                  {t(
                    "home.helpdeskDesc",
                    "Instant guidance for registering grievances, checking status updates, and resolving civic queries automatically."
                  )}
                </p>
              </div>

              <div>
                <button
                  onClick={() => setIsAiChatOpen(true)}
                  className="bg-[#22c55e] hover:bg-[#16a34a] active:scale-[0.99] text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <span>{t("home.letsChat", "Let's Chat!")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Illustration Widget */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200 p-6 shadow-xl relative">
                {/* Top Desktop Window Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {t("home.botName", "CivicFlow Helpdesk Bot")}
                  </span>
                </div>

                {/* Bot Communication Cards */}
                <div className="py-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-sky-500 text-white text-xs sm:text-sm p-3 rounded-2xl rounded-tl-none shadow-xs max-w-[80%]">
                      {t(
                        "chatbot.greeting",
                        "Hello! How can I assist you with your grievance registration today?"
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm p-3 rounded-2xl rounded-tr-none shadow-xs max-w-[80%]">
                      {t("home.sampleUserMsg", "I want to check the status of my complaint #CF-8492.")}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-sky-500 text-white text-xs sm:text-sm p-3 rounded-2xl rounded-tl-none shadow-xs max-w-[80%]">
                      {t(
                        "home.sampleBotMsg",
                        "Your complaint is currently assigned to the Municipal Officer and under review."
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Input Preview */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(
                      new CustomEvent("open-civicflow-chatbot", {
                        detail: { query: homeChatInput }
                      })
                    );
                    setHomeChatInput("");
                  }}
                  className="pt-2 flex gap-2"
                >
                  <input
                    type="text"
                    value={homeChatInput}
                    onChange={(e) => setHomeChatInput(e.target.value)}
                    placeholder={t("home.typeMessagePlaceholder", "Ask AI navigation or enter Ticket ID...")}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-3.5 py-2 rounded-lg font-medium cursor-pointer transition-colors"
                  >
                    {t("home.send", "Send")}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
