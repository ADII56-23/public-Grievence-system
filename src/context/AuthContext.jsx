import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Pre-seeded verified demo accounts for quick testing
const DEFAULT_DEMO_USERS = [
  {
    identifier: "citizen@civicflow.gov.in",
    email: "citizen@civicflow.gov.in",
    mobile: "9876543210",
    phone: "+91 98765 43210",
    password: "password123",
    role: "citizen",
    fullName: "Aditya Kumar",
    citizenId: "CF-2026-8942",
    address: "Plot 124, Saheed Nagar",
    city: "Bhubaneswar",
    state: "Odisha",
    pincode: "751007",
    joinedDate: "February 2026",
    emergencyContact: "+91 91234 56789",
    preferredLanguage: "English"
  },
  {
    identifier: "officer@bmc.gov.in",
    email: "officer@bmc.gov.in",
    mobile: "9437012345",
    phone: "+91 94370 12345",
    employeeId: "BMC-ENG-2024",
    password: "officer123",
    role: "authority",
    fullName: "Rajesh Kumar Das",
    designation: "Executive Engineer",
    department: "Bhubaneswar Municipal Corporation (BMC)",
    jurisdiction: "Ward 28, Sahid Nagar Zone",
    joinedDate: "March 2022"
  }
];

export function sanitizeUserData(userObj) {
  if (!userObj || typeof userObj !== "object") return userObj;
  // If it's the pre-seeded official demo citizen account, keep it as demo
  if (userObj.email === "citizen@civicflow.gov.in" || userObj.identifier === "citizen@civicflow.gov.in") {
    return userObj;
  }
  const clean = { ...userObj };
  // Clean fake dummy address
  if (clean.address === "Plot 124, Saheed Nagar" || clean.address === "Odisha, India") {
    clean.address = "";
  }
  // Clean fake dummy city & state if they were paired with dummy addresses
  if (clean.city === "Bhubaneswar" && !clean.address) {
    clean.city = "";
  }
  if (clean.state === "Odisha" && !clean.address) {
    clean.state = "";
  }
  if (clean.pincode === "751007" || clean.pincode === "751001") {
    clean.pincode = "";
  }
  // Clean fake dummy emergency contact
  if (clean.emergencyContact === "+91 91234 56789") {
    clean.emergencyContact = "";
  }
  // Clean fake placeholder phone
  if (clean.phone === "+91 98765 43210" && (!userObj.mobile || userObj.mobile === "9876543210")) {
    clean.phone = "";
    if (clean.mobile === "9876543210") clean.mobile = "";
  }
  return clean;
}

function getStoredUsers() {
  try {
    const raw = localStorage.getItem("civicflow_registered_users");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Exclude any legacy dynamic test accounts created without signing up
        const validUsers = parsed
          .filter((u) => {
            if (!u || !u.email) return false;
            if (u.email.endsWith("@citizen.civicflow.in") && u.fullName === "Citizen User") return false;
            return true;
          })
          .map((u) => sanitizeUserData(u));
        return validUsers.length > 0 ? validUsers : DEFAULT_DEMO_USERS;
      }
    }
  } catch {
    // Ignore read errors
  }
  return DEFAULT_DEMO_USERS;
}

function saveUsers(usersList) {
  try {
    localStorage.setItem("civicflow_registered_users", JSON.stringify(usersList));
  } catch {
    // Ignore write errors
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // "citizen" | "authority"
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage safely (ensures clean logout state by default)
  useEffect(() => {
    try {
      // Ensure default registered accounts exist in storage
      const existing = getStoredUsers();
      saveUsers(existing);

      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");

      // Validate stored session strictly
      if (
        storedToken &&
        storedUser &&
        storedToken !== "null" &&
        storedToken !== "undefined" &&
        storedUser !== "null" &&
        storedUser !== "undefined"
      ) {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed === "object" && (parsed.email || parsed.fullName)) {
          const cleaned = sanitizeUserData(parsed);
          setToken(storedToken);
          setUser(cleaned);
          localStorage.setItem("user", JSON.stringify(cleaned));
          setRole(storedRole || parsed.role || "citizen");
        } else {
          // Clear invalid session
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          setToken(null);
          setUser(null);
          setRole(null);
        }
      } else {
        // Not logged in: ensure clean state
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        setToken(null);
        setUser(null);
        setRole(null);
      }
    } catch (e) {
      console.error("Auth initialization check:", e);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      setToken(null);
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (credentials, requestedRole = "citizen") => {
    const users = getStoredUsers();
    const identifier = (credentials.identifier || credentials.email || credentials.mobile || "").trim().toLowerCase();
    const password = (credentials.password || "").trim();
    const employeeId = (credentials.employeeId || "").trim().toLowerCase();

    if (!identifier && !employeeId) {
      return { success: false, message: "Please provide your login credentials." };
    }

    if (!password) {
      return { success: false, message: "Please enter your password." };
    }

    // Find user in stored users registry ("database")
    let match = users.find((u) => {
      const emailMatch = u.email && u.email.toLowerCase() === identifier;
      const rawUserPhone = (u.mobile || u.phone || "").replace(/\D/g, "");
      const cleanIdentifier = identifier.replace(/\D/g, "");
      const phoneMatch =
        cleanIdentifier.length >= 10 &&
        rawUserPhone.length >= 10 &&
        (rawUserPhone === cleanIdentifier || rawUserPhone.endsWith(cleanIdentifier) || cleanIdentifier.endsWith(rawUserPhone));
      const empMatch =
        requestedRole === "authority" &&
        (
          (employeeId && u.employeeId && u.employeeId.toLowerCase() === employeeId) ||
          (identifier && u.employeeId && u.employeeId.toLowerCase() === identifier)
        );

      const isTarget = requestedRole === "authority" ? emailMatch || empMatch : emailMatch || phoneMatch;
      return isTarget && u.role === requestedRole;
    });

    // Strictly enforce: users MUST sign up first before they can log in
    if (!match) {
      if (requestedRole === "authority") {
        return {
          success: false,
          message: "No registered authority account found matching this Email / Employee ID. Please verify your credentials or sign up first."
        };
      }
      return {
        success: false,
        message: "No registered account found with this Email or Mobile number. Please sign up first."
      };
    }

    // Verify password strictly
    if (match.password && match.password !== password) {
      return { success: false, message: "Incorrect password. Please verify your credentials." };
    }

    // If logging in as authority with an explicit department selection, update it
    if (requestedRole === "authority" && credentials.department) {
      match = { ...match, department: credentials.department };
      try {
        const updatedUsers = users.map((u) =>
          u.email === match.email || (match.employeeId && u.employeeId === match.employeeId)
            ? { ...u, department: credentials.department }
            : u
        );
        saveUsers(updatedUsers);
      } catch {
        // Ignore
      }
    }

    const sessionToken = "cf-jwt-" + Date.now();
    const cleanMatch = sanitizeUserData(match);
    setUser(cleanMatch);
    setToken(sessionToken);
    setRole(requestedRole);

    localStorage.setItem("token", sessionToken);
    localStorage.setItem("user", JSON.stringify(cleanMatch));
    localStorage.setItem("role", requestedRole);

    return { success: true, user: cleanMatch };
  };

  const signup = (userData, requestedRole = "citizen") => {
    const users = getStoredUsers();
    const email = (userData.email || userData.officialEmail || "").trim().toLowerCase();
    const mobile = (userData.mobile || userData.phone || "").replace(/\D/g, "");

    const exists = users.find((u) => {
      const emailDup = email && u.email && u.email.toLowerCase() === email;
      const phoneDup = mobile && u.mobile && u.mobile.replace(/\D/g, "") === mobile;
      return (emailDup || phoneDup) && u.role === requestedRole;
    });

    if (exists) {
      return { success: false, message: "An account with this email/mobile already exists. Please log in." };
    }

    const now = new Date();
    const joinedDateStr = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    let newUser;
    if (requestedRole === "authority") {
      newUser = {
        fullName: userData.fullName.trim(),
        email: email,
        officialEmail: email,
        mobile: userData.mobile,
        phone: userData.mobile,
        employeeId: (userData.employeeId || "").trim(),
        department: userData.department || "Bhubaneswar Municipal Corporation",
        designation: userData.designation || "Officer",
        jurisdiction: "Municipal Area",
        role: "authority",
        password: userData.password,
        joinedDate: joinedDateStr
      };
    } else {
      newUser = {
        fullName: userData.fullName.trim(),
        email: email,
        mobile: mobile,
        phone: userData.mobile || mobile || "",
        citizenId: `CF-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        address: "",
        city: "",
        state: "",
        pincode: "",
        role: "citizen",
        password: userData.password,
        joinedDate: joinedDateStr,
        emergencyContact: "",
        preferredLanguage: "English"
      };
    }

    saveUsers([...users, newUser]);

    const sessionToken = "cf-jwt-" + Date.now();
    const cleanUser = sanitizeUserData(newUser);
    setUser(cleanUser);
    setToken(sessionToken);
    setRole(requestedRole);

    localStorage.setItem("token", sessionToken);
    localStorage.setItem("user", JSON.stringify(cleanUser));
    localStorage.setItem("role", requestedRole);

    return { success: true, user: cleanUser };
  };

  const loginWithGoogle = (googleUserData = {}) => {
    const email = (googleUserData.email || "").trim().toLowerCase();
    const fullName = googleUserData.fullName || "Citizen User";

    const users = getStoredUsers();
    let match = email ? users.find((u) => u.email && u.email.toLowerCase() === email) : null;

    const now = new Date();
    const joinedDateStr = now.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    if (!match) {
      match = {
        fullName: fullName,
        email: email,
        phone: googleUserData.phone || "",
        citizenId: `CF-GOOG-${Math.floor(1000 + Math.random() * 9000)}`,
        address: "",
        city: "",
        state: "",
        pincode: "",
        role: "citizen",
        authProvider: "google",
        avatar: googleUserData.avatar || null,
        joinedDate: joinedDateStr,
        emergencyContact: "",
        preferredLanguage: "English"
      };
      saveUsers([...users, match]);
    } else {
      match = {
        ...match,
        authProvider: "google"
      };
    }

    const sessionToken = "cf-goog-jwt-" + Date.now();
    const cleanMatch = sanitizeUserData(match);
    setUser(cleanMatch);
    setToken(sessionToken);
    setRole("citizen");

    localStorage.setItem("token", sessionToken);
    localStorage.setItem("user", JSON.stringify(cleanMatch));
    localStorage.setItem("role", "citizen");

    return { success: true, user: cleanMatch };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  const updateUserProfile = (updatedFields) => {
    setUser((prev) => {
      const newProfile = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(newProfile));
      try {
        const users = getStoredUsers();
        const updated = users.map((u) => (u.email === prev?.email ? { ...u, ...updatedFields } : u));
        saveUsers(updated);
      } catch {
        // Ignore
      }
      return newProfile;
    });
  };

  // Strictly verify authentication: must have token AND valid user object
  const isLoggedIn = Boolean(token && user && (user.fullName || user.email));

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isLoggedIn,
        isAuthority: isLoggedIn && role === "authority",
        isCitizen: isLoggedIn && role === "citizen",
        loading,
        login,
        loginWithGoogle,
        signup,
        logout,
        updateUserProfile,
        demoUsers: DEFAULT_DEMO_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
