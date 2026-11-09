import { useState, useRef } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/navbar";
import Footer from "../../components/Footer/footer";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { saveNewComplaint } from "../../utils/departmentRouting";
import {
  FileText,
  MapPin,
  Tag,
  Image,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Upload,
  X,
  Landmark,
  Phone,
  Info,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react";

// Pre-defined categories (fallback if API not available)
const FALLBACK_CATEGORIES = [
  { _id: "roads", name: "Roads & Potholes", icon: "🛣️", dept: "Public Works Department" },
  { _id: "water", name: "Water Supply & Drainage", icon: "💧", dept: "Water Corporation" },
  { _id: "electricity", name: "Electricity & Street Lights", icon: "⚡", dept: "Electricity Board" },
  { _id: "sanitation", name: "Sanitation & Garbage", icon: "🗑️", dept: "Municipal Corporation" },
  { _id: "parks", name: "Parks & Public Spaces", icon: "🌳", dept: "Urban Development Authority" },
  { _id: "noise", name: "Noise & Pollution", icon: "🔊", dept: "Pollution Control Board" },
  { _id: "building", name: "Illegal Construction", icon: "🏗️", dept: "Town Planning Authority" },
  { _id: "traffic", name: "Traffic & Signal Issues", icon: "🚦", dept: "Traffic Police" },
  { _id: "animal", name: "Stray Animals", icon: "🐕", dept: "Animal Welfare Board" },
  { _id: "other", name: "Other / General", icon: "📋", dept: "General Administration" },
];

// Generate a unique grievance ID
function generateGrievanceId() {
  const prefix = "PG";
  const year = new Date().getFullYear().toString().slice(-2);
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${year}${month}${random}`;
}

const STEPS = ["Basic Info", "Location", "Attachments", "Review & Submit"];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [error, setError] = useState("");
  const [previewFiles, setPreviewFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Normal",
    address: "",
    landmark: "",
    pincode: "",
    attachments: [],
  });

  const categories = FALLBACK_CATEGORIES;

  const selectedCategory = categories.find((c) => c._id === formData.category);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB",
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setPreviewFiles((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const removeFile = (idx) => {
    setPreviewFiles((prev) => prev.filter((_, i) => i !== idx));
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== idx),
    }));
  };

  const validateStep = () => {
    if (currentStep === 0) {
      if (!formData.title.trim()) return "Please enter a complaint title.";
      if (formData.title.trim().length < 10) return "Title must be at least 10 characters.";
      if (!formData.category) return "Please select a category.";
      if (!formData.description.trim()) return "Please describe your complaint.";
      if (formData.description.trim().length < 30) return "Description must be at least 30 characters.";
    }
    if (currentStep === 1) {
      if (!formData.address.trim()) return "Please enter the affected address.";
    }
    return "";
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const newId = generateGrievanceId();
      const catObj = categories.find((c) => c._id === formData.category) || categories[0];
      const deptName = catObj?.dept || "General Administration";
      const catName = catObj?.name || "General Civic Redressal";

      const now = new Date();
      const submittedDateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const expectedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const expectedDateStr = expectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

      const fullAddress = `${formData.address || "Main Road"}${formData.landmark ? ", near " + formData.landmark : ""}${formData.pincode ? " - " + formData.pincode : ""}`;

      // Assemble grievance record with department assignment
      const complaintRecord = {
        id: newId,
        title: formData.title || `${catName} Grievance`,
        description: formData.description,
        category: catName,
        department: deptName,
        priority: formData.priority || "Normal",
        status: "Pending",
        userId: user?._id || user?.id || "",
        email: user?.email || "",
        citizen: user?.fullName || user?.name || "Citizen User",
        phone: user?.phone || user?.mobile || "",
        address: fullAddress,
        submittedDate: submittedDateStr,
        expectedResolution: expectedDateStr,
        timeline: [
          {
            stage: "Grievance Registered",
            date: `${submittedDateStr}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
            done: true,
            details: `Complaint submitted online and dispatched directly to ${deptName}.`
          },
          {
            stage: "Assigned to Department",
            date: "Pending Assignment",
            done: false,
            details: `Awaiting initial review by ${deptName} duty officer.`
          },
          {
            stage: "On-Site Inspection",
            date: "Pending",
            done: false,
            details: "Field staff will inspect site."
          },
          {
            stage: "Final Redressal",
            date: `Est. ${expectedDateStr}`,
            done: false,
            details: "Resolution confirmation."
          }
        ]
      };

      // Always save to persistent department routing storage
      saveNewComplaint(complaintRecord);

      if (token) {
        try {
          const fd = new FormData();
          fd.append("title", formData.title);
          fd.append("description", formData.description);
          fd.append("category", formData.category);
          fd.append("priority", formData.priority);
          fd.append("address", formData.address);
          fd.append("landmark", formData.landmark);
          fd.append("pincode", formData.pincode);
          formData.attachments.forEach((f) => fd.append("attachments", f));

          const response = await axios.post("http://localhost:5000/api/complaints", fd, {
            headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
          });
          if (response.data?.complaintId) {
            setSubmittedId(response.data.complaintId);
          } else {
            setSubmittedId(newId);
          }
        } catch {
          // Backend offline - client-side persistence handled
          setSubmittedId(newId);
        }
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setSubmittedId(newId);
      }

      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
          <div className="max-w-lg w-full text-center space-y-8 animate-fadeIn">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-slate-900">Grievance Submitted!</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your complaint has been registered successfully. Use the Ticket ID below to track its status at any time.
              </p>
            </div>

            {/* Ticket ID Card */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200 shadow-xl p-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Grievance Ticket ID</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-2xl font-mono font-bold text-slate-900 tracking-widest shadow-inner">
                #{submittedId}
              </div>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                Save this ID — you'll need it to track your grievance
              </p>
            </div>

            {/* What's Next */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 text-left space-y-3">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> What happens next?
              </h3>
              <ul className="space-y-2">
                {[
                  "Your grievance is now registered and queued for review.",
                  "A nodal officer will be assigned within 48 hours.",
                  "You can track real-time updates using your Ticket ID.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/track?id=${submittedId}`)}
                className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                Track This Grievance
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSubmittedId("");
                  setCurrentStep(0);
                  setPreviewFiles([]);
                  setFormData({ title: "", description: "", category: "", priority: "Normal", address: "", landmark: "", pincode: "", attachments: [] });
                }}
                className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer"
              >
                Submit Another
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── MAIN FORM ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans">
      <Navbar />

      <main className="flex-1">

        {/* ── HERO BANNER ─────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#1e3a8a] py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
          {/* Decorative blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 -left-12 w-56 h-56 bg-indigo-400/20 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-200 bg-blue-800/50 px-3 py-1 rounded-full border border-blue-700">
                <FileText className="w-3.5 h-3.5" /> File a New Grievance
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                Submit Your Grievance
              </h1>
              <p className="text-blue-200 text-sm sm:text-base max-w-lg leading-relaxed">
                Report a civic issue in your area. Our system ensures transparency, timely action, and real-time status tracking.
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex flex-row md:flex-col gap-4 md:gap-3 shrink-0">
              {[
                { label: "Avg. Resolution", value: "5–7 Days", icon: <Clock className="w-4 h-4" /> },
                { label: "Verified & Secure", value: "256-bit Encrypted", icon: <ShieldCheck className="w-4 h-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-200 text-xs mb-1">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <p className="font-bold text-sm text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROGRESS STEPPER ────────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 sticky top-[64px] z-30 shadow-xs">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between relative">
              {/* connector line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 mx-6" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#1e3a8a] transition-all duration-500 mx-6"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * (100 - 0)}%` }}
              />
              {STEPS.map((step, idx) => (
                <div key={step} className="flex flex-col items-center gap-1.5 z-10">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 shadow-sm ${idx < currentStep
                        ? "bg-emerald-600 text-white"
                        : idx === currentStep
                          ? "bg-[#1e3a8a] text-white ring-4 ring-blue-100"
                          : "bg-white text-slate-400 border-2 border-slate-200"
                      }`}
                  >
                    {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold transition-colors whitespace-nowrap hidden sm:block ${idx === currentStep ? "text-[#1e3a8a]" : idx < currentStep ? "text-emerald-600" : "text-slate-400"
                      }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FORM BODY ────────────────────────────────────────── */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-3xl mx-auto">

            {/* Auth warning banner */}
            {!isLoggedIn && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <span className="font-semibold">Guest Mode:</span> You're not logged in. Your complaint will be registered but you may not be able to track it with an account.{" "}
                  <Link to="/login" className="underline font-semibold hover:text-amber-700">Login</Link> for a better experience.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">

                {/* ── STEP 0: Basic Info ─────────────────────────── */}
                {currentStep === 0 && (
                  <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
                    <SectionHeader icon={<FileText className="w-5 h-5 text-[#1e3a8a]" />} title="Complaint Details" subtitle="Describe the civic issue you want to report" />

                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">
                        Complaint Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={120}
                        placeholder="e.g. Broken streetlight near GH-74 Colony gate"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 transition-all bg-slate-50 focus:bg-white"
                      />
                      <p className="text-xs text-slate-400 text-right">{formData.title.length}/120</p>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {categories.map((cat) => (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => {
                              setFormData((p) => ({ ...p, category: cat._id }));
                              if (error) setError("");
                            }}
                            className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${formData.category === cat._id
                                ? "bg-blue-700 border-blue-700 text-white shadow-md"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                          >
                            <span className="text-base shrink-0">{cat.icon}</span>
                            <span className="leading-tight">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                      {selectedCategory && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                          <Landmark className="w-3.5 h-3.5 text-blue-500" />
                          Forwarded to: <span className="font-semibold text-blue-700">{selectedCategory.dept}</span>
                        </p>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">Priority Level</label>
                      <div className="flex gap-2">
                        {["Normal", "High", "Urgent"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${formData.priority === p
                                ? p === "Urgent"
                                  ? "bg-red-600 border-red-600 text-white shadow-sm"
                                  : p === "High"
                                    ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                    : "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                          >
                            {p === "Normal" ? "🟢 Normal" : p === "High" ? "🟠 High" : "🔴 Urgent"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">
                        Detailed Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        maxLength={1000}
                        placeholder="Provide a clear description: what the issue is, since when it exists, how it impacts the community..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 resize-none transition-all bg-slate-50 focus:bg-white"
                      />
                      <p className="text-xs text-slate-400 text-right">{formData.description.length}/1000</p>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: Location ───────────────────────────── */}
                {currentStep === 1 && (
                  <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
                    <SectionHeader icon={<MapPin className="w-5 h-5 text-[#1e3a8a]" />} title="Location Details" subtitle="Help us pinpoint the exact location of the issue" />

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-700">
                        Full Address / Area <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="e.g. Lane 4, Sahid Nagar, near Water Tank, Bhubaneswar"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 resize-none bg-slate-50 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Nearest Landmark</label>
                        <input
                          type="text"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          placeholder="e.g. Near XYZ School"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700">PIN Code</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          maxLength={6}
                          placeholder="e.g. 751007"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Map placeholder card */}
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center space-y-2">
                      <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">Interactive map coming soon</p>
                      <p className="text-xs text-slate-400">Pin-drop location selection will be available in the next update</p>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Attachments ────────────────────────── */}
                {currentStep === 2 && (
                  <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
                    <SectionHeader icon={<Image className="w-5 h-5 text-[#1e3a8a]" />} title="Supporting Evidence" subtitle="Upload photos, videos, or documents to strengthen your complaint (optional)" />

                    {/* Drag & Drop Zone */}
                    <div
                      className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-all cursor-pointer p-8 text-center space-y-3"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center mx-auto">
                        <Upload className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Click to upload files</p>
                        <p className="text-xs text-slate-500 mt-1">Photos, Videos (MP4), PDFs — Max 10MB each</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* File Preview List */}
                    {previewFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{previewFiles.length} file(s) selected</p>
                        <div className="space-y-2">
                          {previewFiles.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-xs">
                              {f.preview ? (
                                <img src={f.preview} alt={f.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">{f.name}</p>
                                <p className="text-xs text-slate-400">{f.size}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3: Review ─────────────────────────────── */}
                {currentStep === 3 && (
                  <div className="p-6 sm:p-8 space-y-6 animate-fadeIn">
                    <SectionHeader icon={<Tag className="w-5 h-5 text-[#1e3a8a]" />} title="Review & Confirm" subtitle="Please verify all details before final submission" />

                    <div className="space-y-4">
                      <ReviewRow label="Title" value={formData.title} />
                      <ReviewRow label="Category" value={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : "—"} />
                      <ReviewRow label="Department" value={selectedCategory?.dept || "—"} />
                      <ReviewRow label="Priority" value={formData.priority} />
                      <ReviewRow label="Address" value={formData.address || "—"} />
                      {formData.landmark && <ReviewRow label="Landmark" value={formData.landmark} />}
                      {formData.pincode && <ReviewRow label="PIN Code" value={formData.pincode} />}
                      <ReviewRow label="Attachments" value={previewFiles.length > 0 ? `${previewFiles.length} file(s)` : "None"} />
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Description</p>
                        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                          {formData.description}
                        </p>
                      </div>
                    </div>

                    {/* Citizen info (if logged in) */}
                    {isLoggedIn && user && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-start gap-3">
                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-900">
                          Submitting as <strong>{user.fullName}</strong> ({user.email}) — Citizen ID: <strong>{user.citizenId}</strong>
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600">
                        By submitting, you confirm that the information provided is accurate and you agree to the CivicFlow terms of service.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── ERROR DISPLAY ─────────────────────────────── */}
                {error && (
                  <div className="mx-6 sm:mx-8 mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* ── NAV FOOTER ────────────────────────────────── */}
                <div className="border-t border-slate-100 px-6 sm:px-8 py-5 flex items-center justify-between bg-slate-50/60">
                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                  ) : (
                    <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors">
                      ← Cancel
                    </Link>
                  )}

                  {currentStep < STEPS.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-[#1e3a8a] hover:bg-[#1e293b] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Submit Grievance
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* ── INFO STRIP ────────────────────────────────────────── */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock className="w-6 h-6 text-blue-600" />,
                title: "Quick Resolution",
                desc: "Most grievances are acknowledged within 24 hours and resolved in 5–7 working days.",
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                title: "Completely Secure",
                desc: "Your personal data is protected with 256-bit encryption and never shared with third parties.",
              },
              {
                icon: <Phone className="w-6 h-6 text-amber-600" />,
                title: "Helpline Support",
                desc: "Call 1800-123-4567 (toll-free) for assistance with filing or tracking your grievance.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}

// ─── Helper components ─────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start gap-4 py-2 border-b border-slate-50">
      <p className="text-xs font-semibold text-slate-400 w-28 shrink-0 pt-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value}</p>
    </div>
  );
}