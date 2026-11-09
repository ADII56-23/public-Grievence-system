import React from "react";
import { Link } from "react-router-dom";
import { ChevronUp, MessageSquare, ArrowRight, Landmark } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function Footer() {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#083b77] text-white relative font-sans">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Logo & Description (4 cols) */}
          <div className="md:col-span-4 flex items-start gap-4">
            {/* Circular Emblem */}
            <div className="w-20 h-20 rounded-full border-2 border-emerald-400 bg-emerald-700/20 p-1 flex items-center justify-center shrink-0 shadow-lg">
              <div className="w-full h-full rounded-full border border-emerald-300 flex flex-col items-center justify-center bg-[#052b57] text-white text-center p-1">
                <Landmark className="w-6 h-6 text-emerald-400" />
                <span className="text-[9px] font-bold tracking-tighter uppercase leading-none mt-0.5">CivicFlow</span>
              </div>
            </div>

            {/* Description Text */}
            <p className="text-sm text-slate-200 leading-relaxed font-normal pt-1">
              {t("footer.mission", "Redressal of Citizen grievances is our priority. You can register your grievance at your convenience.")}
            </p>
          </div>

          {/* Column 1 Links (2.5 cols) */}
          <div className="md:col-span-2 space-y-3 text-sm">
            <Link
              to="/track"
              className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              <span>{t("footer.checkStatus", "Check Status")}</span>
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              <span>{t("footer.adminLogin", "Admin Login")}</span>
            </Link>
            <a
              href="#"
              className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              <span>{t("footer.userManual", "User Manual")}</span>
            </a>
          </div>

          {/* Column 2 Links (2.5 cols) */}
          <div className="md:col-span-2 space-y-3 text-sm">
            <a
              href="#"
              className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              <span>{t("footer.faq", "FAQ")}</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              <span>{t("footer.contact", "Contact")}</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors group"
            >
              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-1 transition-transform" />
              <span>{t("footer.sitemap", "Sitemap")}</span>
            </a>
          </div>

          {/* Social Links & Mobile App Badges (3.5 cols) */}
          <div className="md:col-span-4 space-y-5">
            {/* Follow Us */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">
                {t("footer.followUs", "Follow Us")}
              </h4>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors shadow-xs"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white transition-colors shadow-xs"
                  aria-label="Twitter"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center text-white transition-colors shadow-xs"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Download Mobile App */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">
                {t("footer.downloadApp", "Download Mobile App")}
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#"
                  className="flex items-center gap-2 bg-black hover:bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-lg transition-all shadow-xs"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.04.24-9.97-1.85-14.8-6.28-3.12-2.73-7.06-7.44-11.83-14.13-6.66-9.43-12.07-20.2-16.21-32.33-4.14-12.13-6.21-23.75-6.21-34.86 0-14.45 3.65-26.63 10.96-36.56 7.31-9.93 16.59-14.97 27.84-15.13 4.77 0 10.05 1.25 15.86 3.75 5.8 2.5 9.76 3.79 11.87 3.87 1.85 0 5.86-1.33 12.04-3.99 6.18-2.66 11.39-3.91 15.63-3.75 12.08.97 21.73 5.48 28.94 13.54-10.74 6.49-16.01 15.42-15.81 26.79.2 8.92 3.62 16.34 10.26 22.25 6.64 5.91 14.51 9.4 23.6 10.47-2.36 6.94-5.39 13.88-9.09 20.82zM119.22 31.07c0-6.73 2.45-13.25 7.35-19.57 4.9-6.32 11.02-10.3 18.36-11.94-.8 7.02-3.41 13.67-7.83 19.95-4.42 6.28-10.42 10.15-18.01 11.62-.12-.06-.12-.06-.12-.06z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-300 leading-tight">
                      {t("footer.appStoreDesc", "Download on the")}
                    </div>
                    <div className="text-xs font-semibold leading-tight">App Store</div>
                  </div>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-2 bg-black hover:bg-slate-900 border border-slate-700 text-white px-3 py-1.5 rounded-lg transition-all shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current text-emerald-400" viewBox="0 0 512 512">
                    <path d="M325.8 256L60.6 470.2c-5.8 4.7-12.7 7.8-20.6 7.8-17.7 0-32-14.3-32-32V66c0-17.7 14.3-32 32-32 7.9 0 14.8 3.1 20.6 7.8L325.8 256zM358.4 282.1l65.8-53.1c11.5-9.3 11.5-26.7 0-36l-65.8-53.1-40 44.5 40 47.7zM74.4 492.3l242.4-195.4-38.3-45.7L74.4 492.3zM74.4 19.7l204.1 241.1 38.3-45.7L74.4 19.7z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-wider text-slate-300 leading-tight">
                      {t("footer.playStoreDesc", "GET IT ON")}
                    </div>
                    <div className="text-xs font-semibold leading-tight">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer Copyright Bar */}
      <div className="bg-[#042852] border-t border-blue-900/50 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div>
            Copyright © {new Date().getFullYear()} {t("footer.copyright", "CivicFlow Public Grievance Redressal Portal, All Rights Reserved")}
          </div>
          <div className="flex items-center gap-2">
            <span>{t("footer.poweredBy", "Powered by")}</span>
            <div className="bg-white/10 px-2 py-0.5 rounded text-white font-semibold text-[11px] border border-white/20 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CivicFlow AI
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons (Scroll to top - elevated above chatbot) */}
      <div className="fixed bottom-22 right-6 flex flex-col items-end gap-3 z-40">
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer border-2 border-white/30"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
