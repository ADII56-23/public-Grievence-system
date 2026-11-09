import React, { useState } from "react";
import { X, UserPlus, Check, ArrowRight } from "lucide-react";

export default function GoogleSignInModal({ isOpen, onClose, onSelectAccount }) {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState("");

  if (!isOpen) return null;

  const GOOGLE_ACCOUNTS = [
    {
      fullName: "Aditya Kumar",
      email: "aditya.kumar@gmail.com",
      avatarBg: "bg-blue-600",
      letter: "A",
      subtitle: "Personal Account",
    },
    {
      fullName: "Priya Mohanty",
      email: "priya.mohanty@gmail.com",
      avatarBg: "bg-emerald-600",
      letter: "P",
      subtitle: "Citizen Account",
    },
  ];

  const handleAccountClick = (acc) => {
    setSelectedEmail(acc.email);
    setIsVerifying(true);
    setTimeout(() => {
      onSelectAccount({
        fullName: acc.fullName,
        email: acc.email,
      });
      setIsVerifying(false);
      onClose();
    }, 700);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      setCustomError("Please enter your name");
      return;
    }
    if (!customEmail.trim() || !customEmail.includes("@")) {
      setCustomError("Please enter a valid Google email address");
      return;
    }
    setCustomError("");
    setSelectedEmail(customEmail.trim());
    setIsVerifying(true);
    setTimeout(() => {
      onSelectAccount({
        fullName: customName.trim(),
        email: customEmail.trim(),
      });
      setIsVerifying(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header with Google Logo */}
        <div className="p-6 text-center border-b border-slate-100 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Google 'G' Logo */}
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center p-2.5">
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>

          <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose an account to continue to <span className="font-semibold text-slate-700">CivicFlow</span>
          </p>
        </div>

        {/* Verifying Indicator */}
        {isVerifying ? (
          <div className="py-12 px-6 text-center space-y-4">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-800">Signing in to CivicFlow...</p>
              <p className="text-xs text-slate-400 mt-1">{selectedEmail}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
            {/* Account List */}
            {GOOGLE_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleAccountClick(acc)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    {acc.letter}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 truncate">
                      {acc.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))}

            {/* Custom Account Option */}
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer text-slate-600 text-xs font-semibold"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Use another Google account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-fadeIn">
                <p className="text-xs font-bold text-slate-800">Enter your Google credentials</p>
                {customError && <p className="text-[11px] text-red-600 font-semibold">{customError}</p>}
                <input
                  type="text"
                  placeholder="Your Full Name (e.g. Ramesh Patra)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 outline-none focus:border-blue-500"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            To continue, Google will share your name, email address, and language preference with CivicFlow.
          </p>
        </div>
      </div>
    </div>
  );
}

