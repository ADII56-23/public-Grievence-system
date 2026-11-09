import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Landmark, Globe, LogOut, Check } from "lucide-react";
import Sidebar from "../Sidebar/sidebar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const { user, isLoggedIn, isAuthority, logout } = useAuth();
  const { language, currentLanguageObj, setLanguage, t, SUPPORTED_LANGUAGES } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        {/* Left Section: Logo & Project Name */}
        <Link to="/" className="flex items-center gap-3 group text-slate-900 hover:opacity-95 transition-opacity">
          {/* Emblem / Logo Icon */}
          <div className="w-11 h-11 rounded-full border-2 border-slate-800 bg-slate-50 flex items-center justify-center p-1.5 shadow-xs shrink-0">
            <div className="w-full h-full rounded-full border border-slate-400 flex items-center justify-center bg-white text-slate-800">
              <Landmark className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          {/* Project Title & Tagline */}
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-slate-900 leading-tight tracking-tight">
              {t("nav.brandTitle", "CivicFlow Public Grievance")}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {t("nav.brandSubtitle", "Public Grievance Redressal System")}
            </span>
          </div>
        </Link>

        {/* Right Section: Language Selector, Auth state dependent Profile / Login */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
              aria-label="Select Language"
              aria-expanded={isLangOpen}
            >
              <Globe className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800">
                {currentLanguageObj.nativeName}
              </span>
              <span className="hidden md:inline text-xs text-slate-400">
                ({currentLanguageObj.name})
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  isLangOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-1.5 w-52 sm:w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn max-h-80 overflow-y-auto">
                <div className="px-3 pb-1.5 mb-1 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{t("nav.selectLanguage", "Select Language")}</span>
                  <span className="text-blue-600 font-semibold">{SUPPORTED_LANGUAGES.length}</span>
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-blue-50/90 text-blue-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{lang.nativeName}</span>
                        <span className="text-xs text-slate-400">({lang.name})</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logged In vs Logged Out Navigation Controls */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to={isAuthority ? "/dashboard" : "/profile"}
                className={`flex items-center gap-2 border text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-all shadow-2xs whitespace-nowrap ${
                  isAuthority
                    ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-700"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                    isAuthority ? "bg-white text-slate-800" : "bg-blue-600 text-white"
                  }`}
                >
                  {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline">
                  {isAuthority
                    ? user?.designation || t("nav.officerDashboard", "Dashboard")
                    : user?.fullName || t("nav.myProfile", "My Profile")}
                </span>
                <span className="sm:hidden">
                  {isAuthority
                    ? t("nav.officerDashboard", "Dashboard")
                    : t("nav.myProfile", "Profile")}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                title={t("nav.logout", "Logout")}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-lg transition-all shadow-2xs whitespace-nowrap"
            >
              {t("nav.loginSignup", "Login / Sign Up")}
            </Link>
          )}

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[2.2]" />
            )}
          </button>
        </div>
      </div>

      {/* Right-Side Navigation Sidebar Drawer */}
      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  );
}

export default Navbar;
