// Department Routing & Grievance Distribution System

export const DEPARTMENT_OPTIONS = [
  { id: "electricity", name: "Electricity Board", category: "Electricity & Street Lights", icon: "⚡" },
  { id: "water", name: "Water Corporation", category: "Water Supply & Drainage", icon: "💧" },
  { id: "roads", name: "Public Works Department", category: "Roads & Potholes", icon: "🛣️" },
  { id: "sanitation", name: "Municipal Corporation", category: "Sanitation & Garbage", icon: "🗑️" },
  { id: "parks", name: "Urban Development Authority", category: "Parks & Public Spaces", icon: "🌳" },
  { id: "noise", name: "Pollution Control Board", category: "Noise & Pollution", icon: "🔊" },
  { id: "building", name: "Town Planning Authority", category: "Illegal Construction", icon: "🏗️" },
  { id: "traffic", name: "Traffic Police", category: "Traffic & Signal Issues", icon: "🚦" },
  { id: "animal", name: "Animal Welfare Board", category: "Stray Animals", icon: "🐕" },
  { id: "other", name: "General Administration", category: "Other / General", icon: "📋" },
];

// Initial pre-seeded department grievances so every department officer has relevant tickets right away
export const SEED_COMPLAINTS = [
  // ── Electricity Board Tickets ──
  {
    id: "PG261100019",
    title: "Broken Streetlight on Lane 4, Sahid Nagar",
    category: "Electricity & Street Lights",
    department: "Electricity Board",
    citizen: "Aditya Kumar",
    phone: "+91 98765 43210",
    address: "Lane 4, Sahid Nagar, Bhubaneswar",
    priority: "High",
    status: "In Progress",
    assignedOfficer: "Rajesh Kumar Das (Executive Engineer)",
    submittedDate: "05 Nov 2026",
    expectedResolution: "09 Nov 2026",
    description: "The streetlight near lane 4 entrance has been non-functional for over a week posing safety risks at night.",
    timeline: [
      { stage: "Grievance Registered", date: "05 Nov 2026, 10:15 AM", done: true, details: "Complaint logged successfully." },
      { stage: "Department Assigned", date: "05 Nov 2026, 02:30 PM", done: true, details: "Forwarded to Electricity Board (Division 28)." },
      { stage: "On-Site Inspection", date: "06 Nov 2026, 11:00 AM", done: true, details: "Line inspector visited site; replacement lamp dispatched." },
      { stage: "Final Resolution", date: "Pending (Est. 09 Nov)", done: false, details: "Repair work in progress." },
    ],
    statusHistory: [
      {
        id: "HIST-PG261100019-02",
        timestamp: "06 Nov 2026, 11:00 AM",
        date: "06 Nov 2026",
        previousStatus: "Under Review",
        newStatus: "In Progress",
        officer: "Rajesh Kumar Das",
        designation: "Executive Engineer",
        department: "Electricity Board",
        action: "Status changed to In Progress",
        remarks: "Line inspector visited site; replacement LED lamp and driver unit dispatched."
      },
      {
        id: "HIST-PG261100019-01",
        timestamp: "05 Nov 2026, 02:30 PM",
        date: "05 Nov 2026",
        previousStatus: "Pending",
        newStatus: "Under Review",
        officer: "System Gateway",
        designation: "Auto-Routing",
        department: "Electricity Board",
        action: "Department Assigned",
        remarks: "Assigned to Electricity Board for inspection."
      }
    ]
  },
  {
    id: "PG261100025",
    title: "Overhead Electric Cable Hanging Low near Market",
    category: "Electricity & Street Lights",
    department: "Electricity Board",
    citizen: "Kavita Sahoo",
    phone: "+91 94380 99887",
    address: "Unit 4 Market Road, Bhubaneswar",
    priority: "Urgent",
    status: "Pending",
    assignedOfficer: "Unassigned",
    submittedDate: "07 Nov 2026",
    expectedResolution: "09 Nov 2026",
    description: "A low-hanging live wire poses serious threat to delivery trucks and pedestrians near the vegetable market.",
    timeline: [
      { stage: "Grievance Registered", date: "07 Nov 2026, 08:30 AM", done: true, details: "Reported with high urgency tag." },
      { stage: "Department Assigned", date: "07 Nov 2026, 09:15 AM", done: true, details: "Routed to Electricity Emergency Response." },
    ],
    statusHistory: [
      {
        id: "HIST-PG261100025-01",
        timestamp: "07 Nov 2026, 09:15 AM",
        date: "07 Nov 2026",
        previousStatus: "Initiated",
        newStatus: "Pending",
        officer: "Emergency Dispatch",
        designation: "Disaster Desk",
        department: "Electricity Board",
        action: "Urgent Safety Alert Registered",
        remarks: "Priority escalation triggered. Danger to market pedestrians flagged for 24h SLA redressal."
      }
    ]
  },
  {
    id: "PG261100014",
    title: "Frequent Power Tripping & Burnt Fuse Box on Lane 2",
    category: "Electricity & Street Lights",
    department: "Electricity Board",
    citizen: "Manas Ranjan",
    phone: "+91 94372 88899",
    address: "Lane 2, Sahid Nagar, Bhubaneswar",
    priority: "High",
    status: "Resolved",
    assignedOfficer: "Rajesh Kumar Das (Executive Engineer)",
    submittedDate: "01 Nov 2026",
    expectedResolution: "04 Nov 2026",
    description: "Substation junction fuse repeatedly tripping during peak evening hours.",
    timeline: [
      { stage: "Grievance Registered", date: "01 Nov 2026, 09:30 AM", done: true, completed: true, details: "Complaint registered." },
      { stage: "Department Assigned", date: "01 Nov 2026, 11:15 AM", done: true, completed: true, details: "Assigned to Division 28." },
      { stage: "Fuse & Cable Replacement", date: "02 Nov 2026, 03:00 PM", done: true, completed: true, details: "High-capacity fuse installed." },
      { stage: "Grievance Redressed & Resolved", date: "03 Nov 2026, 05:00 PM", done: true, completed: true, details: "Voltage verified stable; citizen signed acknowledgement." }
    ],
    statusHistory: [
      {
        id: "HIST-PG261100014-03",
        timestamp: "03 Nov 2026, 05:00 PM",
        date: "03 Nov 2026",
        previousStatus: "In Progress",
        newStatus: "Resolved",
        officer: "Rajesh Kumar Das",
        designation: "Executive Engineer",
        department: "Electricity Board",
        action: "Grievance Redressed & Resolved",
        remarks: "Technical inspection completed. Upgraded transformer fuse unit and restored 24x7 unhindered electricity supply."
      },
      {
        id: "HIST-PG261100014-02",
        timestamp: "02 Nov 2026, 03:00 PM",
        date: "02 Nov 2026",
        previousStatus: "Under Review",
        newStatus: "In Progress",
        officer: "Rajesh Kumar Das",
        designation: "Executive Engineer",
        department: "Electricity Board",
        action: "Field Work Commenced",
        remarks: "Dispatched line inspection team with replacement heavy-duty ceramic fuses."
      },
      {
        id: "HIST-PG261100014-01",
        timestamp: "01 Nov 2026, 11:15 AM",
        date: "01 Nov 2026",
        previousStatus: "Pending",
        newStatus: "Under Review",
        officer: "System Dispatcher",
        designation: "Nodal Authority",
        department: "Electricity Board",
        action: "Department Assigned",
        remarks: "Routed to Electricity Board Division 28."
      }
    ]
  },

  // ── Water Corporation Tickets ──
  {
    id: "PG261100115",
    title: "Contaminated Water Supply in Saheed Nagar Block C",
    category: "Water Supply & Drainage",
    department: "Water Corporation",
    citizen: "Bikash Jena",
    phone: "+91 94371 44444",
    address: "Block C, Saheed Nagar, Bhubaneswar",
    priority: "Urgent",
    status: "Pending",
    submittedDate: "06 Nov 2026",
    expectedResolution: "08 Nov 2026",
    description: "Tap water running muddy and foul smelling for 2 consecutive days. Immediate pipeline flush and water testing needed.",
    timeline: [
      { stage: "Grievance Registered", date: "06 Nov 2026, 07:45 AM", done: true, details: "Logged by resident with photos." },
      { stage: "Department Assigned", date: "06 Nov 2026, 09:00 AM", done: true, details: "Assigned to Water Quality & Supply Wing." },
      { stage: "Sample Collection", date: "07 Nov 2026, 11:00 AM", done: true, details: "Water testing team collected samples." },
      { stage: "Pipeline Repair", date: "Pending (Est. 08 Nov)", done: false, details: "Clearing blockage at junction valve." },
    ],
  },
  {
    id: "PG261100122",
    title: "Major Drinking Water Pipeline Burst on Rasulgarh Junction",
    category: "Water Supply & Drainage",
    department: "Water Corporation",
    citizen: "Sanjay Panda",
    phone: "+91 99370 23456",
    address: "Near Rasulgarh Flyover Pillar 14, Bhubaneswar",
    priority: "Urgent",
    status: "In Progress",
    submittedDate: "08 Nov 2026",
    expectedResolution: "10 Nov 2026",
    description: "Huge water leakage flooding the service road and causing loss of thousands of liters of clean drinking water.",
    timeline: [
      { stage: "Grievance Registered", date: "08 Nov 2026, 06:10 AM", done: true, details: "Urgent ticket created." },
      { stage: "Main Valve Closed", date: "08 Nov 2026, 07:00 AM", done: true, details: "Feed line isolated to prevent water wastage." },
      { stage: "Excavation & Repair", date: "In Progress", done: true, details: "Excavator team replacing ruptured ductile iron joint." },
    ],
  },

  // ── Public Works Department (Roads) Tickets ──
  {
    id: "PG261100042",
    title: "Deep Pothole on Main Road, IRC Village",
    category: "Roads & Potholes",
    department: "Public Works Department",
    citizen: "Sunita Patra",
    phone: "+91 94370 11111",
    address: "IRC Village Main Road, near Gate 3",
    priority: "Urgent",
    status: "Pending",
    submittedDate: "04 Nov 2026",
    expectedResolution: "08 Nov 2026",
    description: "A large pothole has formed near the IRC village market gate causing daily two-wheeler accidents.",
    timeline: [
      { stage: "Grievance Registered", date: "04 Nov 2026", done: true, details: "Complaint logged with photo." },
      { stage: "Department Assigned", date: "Pending", done: false, details: "Awaiting road contractor assignment." },
    ],
  },
  {
    id: "CF-849201",
    title: "Road Repair & Pothole Patchwork near Jayadev Vihar",
    category: "Roads & Potholes",
    department: "Public Works Department",
    citizen: "Ramesh Nayak",
    phone: "+91 94371 98765",
    address: "Near Jayadev Vihar Overbridge, Bhubaneswar",
    priority: "Medium",
    status: "Resolved",
    submittedDate: "01 Nov 2026",
    expectedResolution: "04 Nov 2026",
    description: "Multiple potholes near Jayadev Vihar overbridge repaired with cold mix bitumen patchwork.",
    timeline: [
      { stage: "Grievance Registered", date: "01 Nov 2026, 09:00 AM", done: true, details: "Logged with photo attachment." },
      { stage: "Department Assigned", date: "01 Nov 2026, 01:20 PM", done: true, details: "Assigned to PWD Road Maintenance Cell." },
      { stage: "On-Site Repair", date: "03 Nov 2026, 04:00 PM", done: true, details: "Bitumen patchwork completed." },
      { stage: "Closed", date: "04 Nov 2026, 10:00 AM", done: true, details: "Grievance closed with citizen verification." },
    ],
  },

  // ── Municipal Corporation (Sanitation) Tickets ──
  {
    id: "PG261100088",
    title: "Garbage Not Collected for 5 Days – Satya Nagar",
    category: "Sanitation & Garbage",
    department: "Municipal Corporation",
    citizen: "Priya Mohanty",
    phone: "+91 99380 55555",
    address: "Satya Nagar, Plot 12, Bhubaneswar",
    priority: "High",
    status: "Under Review",
    submittedDate: "03 Nov 2026",
    expectedResolution: "07 Nov 2026",
    description: "Door-to-door waste collection has been skipped for 5 consecutive days causing overflowing bins.",
    timeline: [
      { stage: "Grievance Registered", date: "03 Nov 2026", done: true, details: "Complaint logged." },
      { stage: "Under Nodal Review", date: "03 Nov 2026", done: true, details: "Sanitation inspector notified." },
    ],
  },

  // ── Animal Welfare Board Tickets ──
  {
    id: "PG261100103",
    title: "Aggressive Stray Dogs Pack Near Primary School",
    category: "Stray Animals",
    department: "Animal Welfare Board",
    citizen: "Deepak Sahoo",
    phone: "+91 90405 22222",
    address: "DPS School Road, Chandrasekharpur",
    priority: "Normal",
    status: "Pending",
    submittedDate: "02 Nov 2026",
    expectedResolution: "10 Nov 2026",
    description: "Pack of 8 stray dogs creating hazard for children walking to morning school. Catch and vaccinate team requested.",
    timeline: [
      { stage: "Grievance Registered", date: "02 Nov 2026", done: true, details: "Complaint received." },
      { stage: "Department Assigned", date: "03 Nov 2026", done: true, details: "Animal birth control van scheduled." },
    ],
  },
];

/**
 * Checks whether a given grievance ticket strictly belongs to an officer's assigned department.
 * Ensures strict department isolation (e.g. water issues NEVER show up on electric officer's desk).
 */
export function matchesDepartment(ticket, officerDept) {
  if (!ticket || typeof ticket !== "object") return false;
  if (!officerDept) return true;
  if (officerDept === "All" || officerDept === "All Departments") return true;

  const tDept = (ticket.department || "").toLowerCase().trim();
  const tCat = (ticket.category || "").toLowerCase().trim();
  const oDept = (officerDept || "").toLowerCase().trim();

  // 1. Direct equality or substring containment
  if (tDept === oDept || tDept.includes(oDept) || oDept.includes(tDept)) {
    return true;
  }

  // 2. Strict domain-based isolation rules:
  // Water department
  if (oDept.includes("water") || oDept.includes("phed")) {
    return tDept.includes("water") || tCat.includes("water") || tCat.includes("drainage");
  }

  // Electricity department
  if (oDept.includes("elect") || oDept.includes("optcl") || oDept.includes("power") || oDept.includes("light")) {
    return tDept.includes("elect") || tCat.includes("elect") || tCat.includes("light") || tCat.includes("wire");
  }

  // Public Works Department / Roads
  if (oDept.includes("road") || oDept.includes("pwd") || oDept.includes("public works")) {
    return tDept.includes("road") || tDept.includes("pwd") || tCat.includes("road") || tCat.includes("pothole");
  }

  // Sanitation / Municipal
  if (oDept.includes("sanitat") || oDept.includes("garbage") || oDept.includes("waste")) {
    return tDept.includes("sanitat") || tCat.includes("sanitat") || tCat.includes("garbage") || tCat.includes("waste");
  }

  // Traffic
  if (oDept.includes("traffic")) {
    return tDept.includes("traffic") || tCat.includes("traffic") || tCat.includes("signal");
  }

  // Animal Welfare
  if (oDept.includes("animal")) {
    return tDept.includes("animal") || tCat.includes("animal") || tCat.includes("dog");
  }

  // Pollution
  if (oDept.includes("pollut") || oDept.includes("pcb") || oDept.includes("noise")) {
    return tDept.includes("pollut") || tCat.includes("pollut") || tCat.includes("noise");
  }

  // Town Planning / Construction
  if (oDept.includes("town") || oDept.includes("building") || oDept.includes("construction")) {
    return tDept.includes("town") || tCat.includes("building") || tCat.includes("construct");
  }

  // Parks & Urban Spaces
  if (oDept.includes("park") || oDept.includes("uda") || oDept.includes("urban development")) {
    return tDept.includes("park") || tCat.includes("park") || tCat.includes("garden");
  }

  return false;
}

/**
 * Load all complaints from localStorage or return default seeds
 */
export function getStoredComplaints() {
  try {
    const raw = localStorage.getItem("civicflow_complaints");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Sanitize: filter out any null or non-object entries
        const cleanList = parsed.filter((t) => t && typeof t === "object" && t.id);
        const existingIds = new Set(cleanList.map((t) => t.id));
        const missingSeeds = SEED_COMPLAINTS.filter((s) => s && s.id && !existingIds.has(s.id));
        if (missingSeeds.length > 0) {
          const merged = [...cleanList, ...missingSeeds];
          localStorage.setItem("civicflow_complaints", JSON.stringify(merged));
          return merged;
        }
        return cleanList.length > 0 ? cleanList : SEED_COMPLAINTS;
      }
    }
  } catch {
    // Ignore read errors
  }
  // If nothing saved, initialize with seed complaints
  try {
    localStorage.setItem("civicflow_complaints", JSON.stringify(SEED_COMPLAINTS));
  } catch {
    // Ignore write errors
  }
  return SEED_COMPLAINTS;
}

/**
 * Save a newly submitted complaint and route it to the proper department
 */
export function saveNewComplaint(complaint) {
  try {
    const currentList = getStoredComplaints();
    const updated = [complaint, ...currentList];
    localStorage.setItem("civicflow_complaints", JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save complaint:", err);
    return [complaint];
  }
}

/**
 * Update complaint status or add remarks
 */
export function updateComplaintRecord(ticketId, updatedFields) {
  try {
    const currentList = getStoredComplaints();
    const cleanId = (ticketId || "").trim().toLowerCase();
    const updated = currentList.map((t) =>
      t.id && t.id.trim().toLowerCase() === cleanId
        ? { ...t, ...updatedFields }
        : t
    );
    localStorage.setItem("civicflow_complaints", JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to update complaint:", err);
    return [];
  }
}

