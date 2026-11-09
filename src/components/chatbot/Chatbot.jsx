import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Send,
  Bot,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getStoredComplaints } from "../../utils/departmentRouting";

function Chatbot({ isOpen: externalIsOpen, onClose: externalOnClose }) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user, isAuthority, isCitizen, isLoggedIn } = useAuth();
  const isOfficer = isAuthority;

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Controlled or uncontrolled state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = externalOnClose || (() => setInternalIsOpen(false));
  const handleOpen = () => {
    setInternalIsOpen(true);
  };

  // Natural welcome greeting
  const getGreeting = () => {
    if (isOfficer && user) {
      return `Hello Officer ${user.fullName || "Officer"}! 👋 (Dept: ${
        user.department || "Nodal Authority"
      }). I am your CivicFlow Assistant. You can ask me to check department complaints, track tickets, or guide you through the dashboard.`;
    }
    if (isCitizen && user) {
      return `Hello ${user.fullName || "Citizen"}! 👋 Welcome to CivicFlow. You can ask me how to file a complaint, check your grievance status, or find emergency helplines. How can I help you today?`;
    }
    return t(
      "chatbot.greeting",
      "Hello! 👋 I am your CivicFlow Assistant. You can ask me how to lodge a public grievance, track an existing ticket, find emergency contacts, or navigate the portal. How can I assist you today?"
    );
  };

  const [messages, setMessages] = useState([
    {
      id: "init",
      sender: "bot",
      text: getGreeting(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  // Update greeting if language or user changes
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([
        {
          id: "init",
          sender: "bot",
          text: getGreeting(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [language, user?.fullName, user?.department]);

  // Listen to global open event
  useEffect(() => {
    const handleExternalTrigger = (e) => {
      setInternalIsOpen(true);
      if (e?.detail?.query) {
        handleSendMessage(e.detail.query);
      }
    };

    window.addEventListener("open-civicflow-chatbot", handleExternalTrigger);
    return () => window.removeEventListener("open-civicflow-chatbot", handleExternalTrigger);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      scrollToBottom();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Reset conversation
  const handleResetChat = () => {
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: getGreeting(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setUserMsg("");
  };

  // Search ticket in localStorage dataset
  const searchTicket = (idQuery) => {
    const complaints = getStoredComplaints();
    const clean = idQuery.trim().toUpperCase();
    return complaints.find(
      (c) => c.id && c.id.trim().toUpperCase() === clean
    );
  };

  // Starter prompts when conversation is fresh
  const starterPrompts = [
    "How do I file a grievance?",
    "Check ticket status",
    "Emergency helplines",
    "Share citizen feedback"
  ];

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || userMsg).trim();
    if (!query) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Append user message
    const userMessageObj = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: currentTime
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setUserMsg("");
    setIsTyping(true);

    // AI Intent & Response Processing
    setTimeout(() => {
      let botResponse = "";
      let actionLink = null;
      const lower = query.toLowerCase();

      // 1. Direct Ticket ID Lookup
      const ticketMatch = query.match(/([a-zA-Z]{2,4}[-0-9]{4,15}|[0-9]{5,12})/);
      const possibleTicketId = ticketMatch ? ticketMatch[0] : null;

      if (
        (lower.includes("pg") || lower.includes("cf-") || (possibleTicketId && possibleTicketId.length >= 6)) &&
        !lower.includes("how to") &&
        !lower.includes("submit")
      ) {
        const found = searchTicket(possibleTicketId || query);
        if (found) {
          botResponse = `I found Ticket #${found.id} ("${found.title}").\n• Department: ${found.department}\n• Current Status: ${found.status}\n• Priority: ${found.priority || "Standard"}\n• Expected Resolution: ${found.expectedResolution || "In Progress"}`;
          actionLink = {
            label: `View Live Tracking for #${found.id}`,
            path: `/track?id=${encodeURIComponent(found.id)}`
          };
        } else {
          botResponse = `I searched our records but couldn't find an active grievance with ID "${
            possibleTicketId || query
          }". Please double-check the ticket number from your SMS receipt, or visit the tracking page.`;
          actionLink = {
            label: "Open Track Grievance Page",
            path: "/track"
          };
        }
      }
      // 2. Submit / Lodge Grievance
      else if (
        lower.includes("submit") ||
        lower.includes("lodge") ||
        lower.includes("file") ||
        lower.includes("register") ||
        lower.includes("complaint") ||
        lower.includes("pothole") ||
        lower.includes("garbage") ||
        lower.includes("drainage") ||
        lower.includes("streetlight") ||
        lower.includes("street light") ||
        lower.includes("water leak")
      ) {
        botResponse =
          "To file a grievance, head to the grievance form. Simply select your category (Electricity, Water, Roads, Sanitation, etc.), enter the location details, and optionally attach photos. Your complaint will be auto-routed to the concerned authority.";
        actionLink = {
          label: "Go to File Grievance",
          path: "/submit"
        };
      }
      // 3. Track Grievance
      else if (
        lower.includes("track") ||
        lower.includes("status") ||
        lower.includes("where is my") ||
        lower.includes("progress")
      ) {
        botResponse =
          "You can track any grievance live! Enter your ticket ID (e.g. PG261100019) right here in the chat, or open our tracking portal to see timeline updates from the field inspector.";
        actionLink = {
          label: "Open Track Grievance Portal",
          path: "/track"
        };
      }
      // 4. Citizen Profile
      else if (
        lower.includes("profile") ||
        lower.includes("my account") ||
        lower.includes("my grievances") ||
        lower.includes("my complaints")
      ) {
        if (isLoggedIn && !isOfficer) {
          botResponse = `You are signed in as ${user?.fullName || "Citizen"}. You can view all complaints you've submitted and manage your contact details in your Citizen Profile.`;
          actionLink = {
            label: "Open My Profile",
            path: "/profile"
          };
        } else if (isOfficer) {
          botResponse = `Welcome Officer ${user?.fullName || ""}! You can view department tickets and resolution history in your dashboard.`;
          actionLink = {
            label: "Go to Officer Dashboard",
            path: "/dashboard"
          };
        } else {
          botResponse =
            "To view your filed grievances and profile details, please sign in with your registered mobile number or email.";
          actionLink = {
            label: "Citizen Sign In",
            path: "/login"
          };
        }
      }
      // 5. Officer Dashboard / Authority Portal
      else if (
        lower.includes("officer") ||
        lower.includes("authority") ||
        lower.includes("dashboard") ||
        lower.includes("admin") ||
        lower.includes("nodal")
      ) {
        if (isOfficer) {
          botResponse = `Officer ${user?.fullName || ""}, you can access your assigned department grievances and update resolution stages on your dashboard.`;
          actionLink = {
            label: "Go to Officer Dashboard",
            path: "/dashboard"
          };
        } else {
          botResponse =
            "Nodal officers and municipal authorities can sign in to review routed complaints, assign inspectors, and resolve citizen issues.";
          actionLink = {
            label: "Authority Login Portal",
            path: "/admin/login"
          };
        }
      }
      // 6. Citizen Feedback
      else if (
        lower.includes("feedback") ||
        lower.includes("review") ||
        lower.includes("rating") ||
        lower.includes("rate") ||
        lower.includes("suggestion")
      ) {
        botResponse =
          "Your feedback directly helps government authorities evaluate redressal quality and speed. You can submit 1 to 5 star ratings and detailed suggestions in the Citizen Feedback section.";
        actionLink = {
          label: "Open Citizen Feedback",
          path: "/profile?tab=feedback"
        };
      }
      // 7. Urgent / CM Grievances
      else if (
        lower.includes("urgent") ||
        lower.includes("cm") ||
        lower.includes("emergency") ||
        lower.includes("critical")
      ) {
        botResponse =
          "For severe safety risks, live wire sparks, open manholes, or CM Public Grievance petitions, use our expedited priority channel.";
        actionLink = {
          label: "Lodge Urgent Grievance",
          path: "/submit?type=cm_appointment"
        };
      }
      // 8. Helplines & Emergency Numbers
      else if (
        lower.includes("helpline") ||
        lower.includes("call") ||
        lower.includes("contact") ||
        lower.includes("phone") ||
        lower.includes("number") ||
        lower.includes("toll free")
      ) {
        botResponse =
          "Here are key 24x7 emergency and civic helplines:\n• CivicFlow Toll-Free: 1800-123-4567\n• National Emergency: 112\n• Police Control: 100\n• Medical Ambulance: 108 / 102\n• Fire Service: 101\n• Electricity Emergency: 1912\n• Water Supply: 1916";
      }
      // 9. Department Information
      else if (
        lower.includes("department") ||
        lower.includes("water") ||
        lower.includes("electric") ||
        lower.includes("road") ||
        lower.includes("pwd") ||
        lower.includes("sanitat")
      ) {
        botResponse =
          "CivicFlow automatically routes complaints based on category to the Electricity Board, Water Corporation, Municipal Corporation (Sanitation), Public Works Department (Roads & Potholes), and Traffic Police.";
        actionLink = {
          label: "Lodge Grievance by Category",
          path: "/submit"
        };
      }
      // 10. Login / Signup
      else if (
        lower.includes("login") ||
        lower.includes("sign in") ||
        lower.includes("signup") ||
        lower.includes("register") ||
        lower.includes("create account")
      ) {
        botResponse =
          "Citizens can sign in with their mobile number or email. If you don't have an account yet, sign up in less than a minute!";
        actionLink = {
          label: "Go to Sign In / Register",
          path: "/login"
        };
      }
      // 11. Home
      else if (lower.includes("home") || lower.includes("main page")) {
        botResponse = "Click below to head back to the CivicFlow main homepage.";
        actionLink = {
          label: "Go to Homepage",
          path: "/"
        };
      }
      // 12. Default Conversational Fallback
      else {
        botResponse =
          "I can help you with anything on CivicFlow! For example, you can ask me:\n• \"How do I file a grievance?\"\n• \"Track ticket PG261100019\"\n• \"Emergency phone numbers\"\n• \"Where can I give feedback?\"";
      }

      const botMessageObj = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        link: actionLink
      };

      setMessages((prev) => [...prev, botMessageObj]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* ── Floating Launcher Button (Bottom Right) ── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 bg-[#083b77] hover:bg-[#0a4891] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/40 cursor-pointer flex items-center justify-center group"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-6 h-6 stroke-[2.2]" />

          {/* Green online indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white" />
          </span>

          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-semibold pl-0 group-hover:pl-2 pr-1">
            Chat Assistant
          </span>
        </button>
      )}

      {/* ── Normal Chat Window ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="CivicFlow Assistant"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn"
        >
          {/* Header */}
          <div className="bg-[#083b77] text-white px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-inner shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  CivicFlow Assistant
                </h3>
                <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset Chat */}
              <button
                onClick={handleResetChat}
                title="Restart chat"
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Restart chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                onClick={handleClose}
                title="Close (Esc)"
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Normal Messages Chat Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Clean inline action link button */}
                  {msg.link && (
                    <button
                      onClick={() => navigate(msg.link.path)}
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer w-full justify-between group"
                    >
                      <span>{msg.link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {/* Subtle starter prompts only when fresh conversation */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block px-1">
                  Suggested topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {starterPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left text-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bouncing dots typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-2xl rounded-bl-none shadow-2xs w-fit">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Normal Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              placeholder="Ask anything or enter Ticket ID..."
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={!userMsg.trim()}
              className="bg-[#083b77] hover:bg-[#0a4891] disabled:opacity-40 text-white p-2.5 rounded-xl transition-all cursor-pointer shrink-0 shadow-xs flex items-center justify-center"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
