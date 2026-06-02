import { useState, useEffect, useRef } from "react";

// ── Animation system — CSS transitions + React hooks ─────────────────────────
// Provides Framer Motion-quality animations using pure CSS for zero dependencies
// When IT integrates Framer Motion in production, swap these hooks for motion components

const useSlideUp = (visible) => ({
  transform: visible ? "translateY(0)" : "translateY(100%)",
  opacity: visible ? 1 : 0,
  transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1), opacity 0.24s ease",
});

const useFadeIn = (visible) => ({
  opacity: visible ? 1 : 0,
  transition: "opacity 0.22s ease",
});

const useScaleIn = (visible) => ({
  transform: visible ? "scale(1)" : "scale(0.94)",
  opacity: visible ? 1 : 0,
  transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
});

const useSlideInRight = (visible) => ({
  transform: visible ? "translateX(0)" : "translateX(100%)",
  opacity: visible ? 1 : 0,
  transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1), opacity 0.22s ease",
});

// Staggered card animation hook
const useStaggered = (index, visible) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? "translateY(0)" : "translateY(16px)",
  transition: `opacity 0.3s ease ${index * 60}ms, transform 0.35s cubic-bezier(0.34,1.1,0.64,1) ${index * 60}ms`,
});

// Button press animation — scales down on tap
const pressStyle = {
  transition: "transform 0.12s ease, box-shadow 0.12s ease",
  cursor: "pointer",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
};

const usePress = () => {
  const [pressed, setPressed] = useState(false);
  return {
    style: { ...pressStyle, transform: pressed ? "scale(0.96)" : "scale(1)" },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onTouchStart: () => setPressed(true),
    onTouchEnd: () => setPressed(false),
  };
};

// Global CSS injected once for keyframe animations
if (typeof document !== "undefined" && !document.getElementById("cuny-ps-animations")) {
  const style = document.createElement("style");
  style.id = "cuny-ps-animations";
  style.textContent = `
    @keyframes slideUpIn {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes slideDownIn {
      from { transform: translateY(-100%); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0);   }
    }
    @keyframes scaleIn {
      from { transform: scale(0.92); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }
    @keyframes toastIn {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes bellShake {
      0%,100% { transform: rotate(0); }
      20%     { transform: rotate(-12deg); }
      40%     { transform: rotate(12deg); }
      60%     { transform: rotate(-8deg); }
      80%     { transform: rotate(8deg); }
    }
    @keyframes pulse {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(1.05); }
    }
    .slide-up-in  { animation: slideUpIn 0.32s cubic-bezier(0.32,0.72,0,1) forwards; }
    .slide-down-in { animation: slideDownIn 0.32s cubic-bezier(0.32,0.72,0,1) forwards; }
    .fade-in      { animation: fadeIn 0.28s ease forwards; }
    .scale-in     { animation: scaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .toast-in     { animation: toastIn 0.3s cubic-bezier(0.34,1.2,0.64,1) forwards; }
    .bell-shake   { animation: bellShake 0.5s ease; }
    .btn-press:active { transform: scale(0.95) !important; }
    .card-hover   { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
    .tab-indicator { transition: left 0.25s cubic-bezier(0.34,1.1,0.64,1), width 0.25s ease; }
  `;
  document.head.appendChild(style);
}

// ── Design System — shadcn/ui inspired tokens ────────────────────────────────
const DS = {
  // Colors
  primary:      "#1D4ED8",
  primaryHover: "#1E40AF",
  primaryPale:  "#EFF6FF",
  danger:       "#DC2626",
  dangerPale:   "#FEF2F2",
  success:      "#059669",
  successPale:  "#ECFDF5",
  warning:      "#D97706",
  warningPale:  "#FFFBEB",
  navy:         "#0D2547",
  slate900:     "#0F172A",
  slate700:     "#334155",
  slate500:     "#64748B",
  slate300:     "#CBD5E1",
  slate100:     "#F1F5F9",
  slate50:      "#F8FAFC",
  white:        "#ffffff",
  // Radii
  radiusSm:     6,
  radiusMd:     8,
  radiusLg:     12,
  radiusXl:     16,
  radiusFull:   999,
  // Shadows
  shadowSm:     "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
  shadowMd:     "0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)",
  shadowLg:     "0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
  shadowXl:     "0 24px 48px rgba(0,0,0,0.15), 0 8px 16px rgba(0,0,0,0.08)",
  // Typography
  fontSans:     "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  fontMono:     "ui-monospace, 'SF Mono', 'Cascadia Code', monospace",
};

// ── Reusable UI components — shadcn/ui inspired ───────────────────────────────
const Badge = ({ children, variant = "default", size = "sm" }) => {
  const variants = {
    default:  { bg: DS.slate100,     color: DS.slate700,  border: DS.slate300 },
    primary:  { bg: DS.primaryPale,  color: DS.primary,   border: "#BFDBFE"   },
    success:  { bg: DS.successPale,  color: DS.success,   border: "#A7F3D0"   },
    danger:   { bg: DS.dangerPale,   color: DS.danger,    border: "#FECACA"   },
    warning:  { bg: DS.warningPale,  color: DS.warning,   border: "#FDE68A"   },
    navy:     { bg: DS.navy,         color: DS.white,     border: DS.navy     },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: size === "sm" ? "2px 8px" : "4px 10px",
      borderRadius: DS.radiusFull,
      fontSize: size === "sm" ? 10 : 12,
      fontWeight: 700, letterSpacing: 0.3,
      background: v.bg, color: v.color,
      border: `1px solid ${v.border}`,
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
};

const Button = ({ children, variant = "primary", size = "md", disabled, onClick, className = "", fullWidth, style: extraStyle = {} }) => {
  const [pressed, setPressed] = useState(false);
  const variants = {
    primary:   { bg: DS.primary,     color: DS.white,   border: "none",                      hoverBg: DS.primaryHover },
    secondary: { bg: DS.white,       color: DS.slate700, border: `1px solid ${DS.slate300}`, hoverBg: DS.slate50      },
    danger:    { bg: DS.danger,      color: DS.white,   border: "none",                      hoverBg: "#B91C1C"       },
    success:   { bg: DS.success,     color: DS.white,   border: "none",                      hoverBg: "#047857"       },
    ghost:     { bg: "transparent",  color: DS.slate700, border: "none",                     hoverBg: DS.slate100     },
  };
  const sizes = {
    sm:  { padding: "6px 12px",  fontSize: 12, borderRadius: DS.radiusMd },
    md:  { padding: "10px 18px", fontSize: 13, borderRadius: DS.radiusMd },
    lg:  { padding: "13px 24px", fontSize: 15, borderRadius: DS.radiusMd },
  };
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-press ${className}`}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: fullWidth ? "100%" : "auto",
        padding: s.padding, borderRadius: s.borderRadius,
        fontSize: s.fontSize, fontWeight: 700,
        background: disabled ? DS.slate300 : v.bg,
        color: disabled ? DS.slate500 : v.color,
        border: v.border,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: pressed && !disabled ? "scale(0.96)" : "scale(1)",
        transition: "transform 0.12s ease, background 0.15s ease, box-shadow 0.15s ease",
        boxShadow: variant === "primary" && !disabled ? "0 2px 8px rgba(29,78,216,0.3)" : "none",
        fontFamily: DS.fontSans,
        WebkitTapHighlightColor: "transparent",
        ...extraStyle,
      }}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = "text", style: extraStyle = {} }) => (
  <input
    type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{
      width: "100%", padding: "10px 14px",
      borderRadius: DS.radiusMd, border: `1.5px solid ${DS.slate300}`,
      fontSize: 14, fontFamily: DS.fontSans,
      background: DS.slate50, color: DS.slate900,
      outline: "none", boxSizing: "border-box",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      ...extraStyle,
    }}
    onFocus={e => { e.target.style.borderColor = DS.primary; e.target.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.12)"; }}
    onBlur={e => { e.target.style.borderColor = DS.slate300; e.target.style.boxShadow = "none"; }}
  />
);

const Card = ({ children, style: extraStyle = {}, className = "" }) => (
  <div className={`card-hover ${className}`} style={{
    background: DS.white, borderRadius: DS.radiusLg,
    border: `1px solid ${DS.slate300}`,
    boxShadow: DS.shadowSm, marginBottom: 10,
    overflow: "hidden",
    ...extraStyle,
  }}>{children}</div>
);

const Toggle = ({ checked, onChange, color = DS.primary }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      width: 42, height: 24, borderRadius: 12, cursor: "pointer",
      background: checked ? color : DS.slate300,
      position: "relative", transition: "background 0.2s ease",
      flexShrink: 0, boxShadow: checked ? `0 0 0 2px ${color}22` : "none",
    }}>
    <div style={{
      position: "absolute", top: 3, left: checked ? 21 : 3,
      width: 18, height: 18, borderRadius: "50%",
      background: DS.white, boxShadow: DS.shadowSm,
      transition: "left 0.2s cubic-bezier(0.34,1.56,0.64,1)",
    }} />
  </div>
);

const SHIELD_B64 = "data:image/png;base64,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";
// ─── DRIVER.JS loaded via CDN in index.html, but we simulate it fully in React ───
// Full guided tour engine built-in since we're in a React artifact

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════════
const OFFICERS = [
  { id:1, name:"James Carter",    badge:"PS-0412", rank:"CPO",                       tour:"Tour 2", daysOff:"Fri & Sat", email:"carter@cuny.edu",   phone:"718-555-0101", otHours:12, armed:true  },
  { id:2, name:"Thomas Reyes",    badge:"PS-0345", rank:"Corporal",                  tour:"Tour 1", daysOff:"Sun & Mon", email:"reyes@cuny.edu",    phone:"718-555-0202", otHours:8,  armed:true  },
  { id:3, name:"Dev Mehta",       badge:"PS-0476", rank:"Specialist",                tour:"Tour 3", daysOff:"Wed & Thu", email:"mehta@cuny.edu",    phone:"718-555-0303", otHours:20, armed:false },
  { id:4, name:"Sandra Williams", badge:"PS-0501", rank:"Sergeant",                  tour:"Tour 2", daysOff:"Tue & Wed", email:"williams@cuny.edu", phone:"718-555-0404", otHours:6,  armed:false },
  { id:5, name:"Marcus Brown",    badge:"PS-0290", rank:"Lieutenant",                tour:"Tour 1", daysOff:"Sat & Sun", email:"brown@cuny.edu",    phone:"718-555-0505", otHours:4,  armed:true  },
  { id:6, name:"Kevin Thompson",  badge:"PS-0100", rank:"Director of Public Safety", tour:"Tour 1", daysOff:"Sat & Sun", email:"thompson@cuny.edu", phone:"718-555-0606", otHours:2,  armed:true  },
  { id:7, name:"Lisa Chen",       badge:"PS-0550", rank:"Campus Security Assistant", tour:"Tour 3", daysOff:"Mon & Tue", email:"chen@cuny.edu",     phone:"718-555-0707", otHours:14, armed:false },
];

// Armed officer helpers
const isArmed = (officer) => officer?.armed === true;
const eventRequiresArmed = (ev) => (ev?.armedSlots || 0) > 0;
const armedSlotsAvailable = (ev, confirmedList) => {
  const filled = confirmedList.filter(c => c.eventId === ev.id && c.armedSlot === true).length;
  return Math.max(0, (ev.armedSlots || 0) - filled);
};

// ── Rank permission helpers ──────────────────────────────────────────────────
const RANK_LEVEL = {
  "Campus Security Assistant": 0,
  "CPO":                        1,
  "Corporal":                   2,
  "Sergeant":                   3,
  "Specialist":                 4,
  "Lieutenant":                 5,
  "Director of Public Safety":  6,
};

const isSgtPlus      = (rank) => RANK_LEVEL[rank] >= 3;  // Sgt and above
const isSpecialistPlus = (rank) => RANK_LEVEL[rank] >= 4; // Specialist and above
const isLtPlus       = (rank) => RANK_LEVEL[rank] >= 5;  // Lt and above

const GRACE_PERIOD_MS = 72 * 60 * 60 * 1000; // 72 hours in milliseconds

const EVENTS_SEED = [
  { id:1, title:"Spring Commencement", armedSlots:2,    date:"May 14",  time:"0600-1400", type:"COMMENCEMENT", slots:6, filled:4, hold:false, status:"OPEN",   postedAt: Date.now() - (4  * 60 * 60 * 1000), waitQueue:[] }, // posted 4h ago  — grace ACTIVE
  { id:2, title:"Basketball Tournament",               date:"May 11",  time:"1000-2000", type:"ATHLETICS",    slots:4, filled:4, hold:false, status:"FULL",   postedAt: Date.now() - (90 * 60 * 60 * 1000), waitQueue:[] }, // posted 90h ago — grace elapsed (full event)
  { id:3, title:"Alumni Gala", armedSlots:1,           date:"May 18",  time:"1800-2300", type:"SPECIAL",      slots:3, filled:1, hold:false, status:"OPEN",   postedAt: Date.now() - (8  * 60 * 60 * 1000), waitQueue:[] }, // posted 8h ago  — grace ACTIVE
  { id:4, title:"Fire Watch - 17NLex",                 date:"May 9",   time:"0000-0800", type:"FIRE WATCH",   slots:2, filled:2, hold:false, status:"ACTIVE", postedAt: Date.now() - (48 * 60 * 60 * 1000), waitQueue:[] }, // posted 48h ago — grace ACTIVE (full)
  { id:5, title:"New Student Orientation",             date:"May 21",  time:"0800-1600", type:"STUDENT LIFE", slots:5, filled:2, hold:false, status:"OPEN",   postedAt: Date.now() - (24 * 60 * 60 * 1000), waitQueue:[] }, // posted 24h ago — grace ACTIVE
  { id:6, title:"Board of Trustees Mtg",               date:"May 27",  time:"0900-1700", type:"SPECIAL",      slots:3, filled:0, hold:false, status:"OPEN",   postedAt: Date.now() - (80 * 60 * 60 * 1000), waitQueue:[] }, // posted 80h ago — grace elapsed
  { id:7, title:"Friday Evening Patrol",               date:"May 15",  time:"1600-0000", type:"PATROL",       slots:4, filled:3, hold:false, status:"OPEN",   postedAt: Date.now() - (85 * 60 * 60 * 1000), waitQueue:[] }, // posted 85h ago — grace elapsed
];

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE-BASED TOUR DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Each step supports a custom nextLabel ("Got it", "Next →", etc.)
// and an optional confirmRequired flag for critical policy steps.

const TOURS = {

  // ── OFFICER / CORPORAL TOUR ──────────────────────────────────────────────────
  officer: {
    role: "Officer / Corporal",
    color: "#1D4ED8",
    icon: "🪪",
    description: "Campus Peace Officers & Corporals — sign up for events, manage your schedule",
    steps: [
      {
        id: "welcome",
        title: "Welcome, Officer!",
        body: "This tour covers everything you need as a Baruch College Public Safety officer — from signing up for events to managing cancellations and your schedule.",
        target: null, position: "center",
        nextLabel: "Let's Go →",
      },
      {
        id: "hold-status",
        title: "Your Hold Status",
        body: "This banner shows your current sign-up status at a glance. Green means you are clear to sign up for any event. Amber means the 72-hour grace period is active and shows exactly how much time remains before additional sign-ups unlock.",
        target: "hold-status", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "confirmed-slots",
        title: "Confirmed Slots",
        body: "This counter shows how many events you're approved for this period. Tap 'Check' to see the full list with dates and times.",
        target: "confirmed-slots", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "waitlisted",
        title: "Your Waitlist Position",
        body: "If an event is full, join the waitlist. Your position is determined by the timestamp of when you joined — first in, first out. You'll be automatically confirmed when a slot opens.",
        target: "waitlisted-slots", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "event-tabs",
        title: "Browsing Events",
        body: "'All Events' shows everything posted. 'Open Slots' filters to events you can still join. 'My Sign-ups' shows only your personal assignments.",
        target: "event-tabs", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "event-card",
        title: "Reading an Event Card",
        body: "Each card shows type, date, time, and slot availability. The colored badge (top-right) shows your status: OPEN, WAITLISTED, CONFIRMED, or FULL.",
        target: "event-card-1", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "72h-hold",
        title: "⏱ The 72-Hour Grace Period",
        body: "When an event is posted, a 72-hour grace period begins. During this window, each officer may only sign up for one slot — giving everyone equal opportunity. After 72 hours, officers may sign up for additional events.",
        target: null, position: "center",
        nextLabel: "Understood",
        confirmRequired: true,
      },
      {
        id: "cancel-request",
        title: "Need to Cancel?",
        body: "Tap 'CANCEL REQUEST' to submit a cancellation. A Sergeant or Specialist must approve it before it takes effect. Do NOT just not show up — that counts as a No-Call.",
        target: "cancel-btn", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "schedule",
        title: "Your Schedule Calendar",
        body: "The Schedule page shows your approved shifts in blue. Red dates are urgent assignments like Fire Watch. Tap any date for details.",
        target: null, position: "center", nav: "schedule",
        nextLabel: "Got it",
      },
      {
        id: "bell",
        title: "Notification Bell",
        body: "The bell shows unread alerts — new event postings, approvals, slot releases, and emergency openings. Keep notifications on so you never miss a slot.",
        target: "bell-icon", position: "bottom", nav: "dashboard",
        nextLabel: "Got it",
      },
      {
        id: "done",
        title: "You're Ready, Officer! 🎉",
        body: "That's everything for your role. Check the FAQ anytime from the menu if you have questions. Stay safe out there.",
        target: null, position: "center",
        nextLabel: "Finish Tour",
      },
    ],
  },

  // ── SERGEANT TOUR ────────────────────────────────────────────────────────────
  sergeant: {
    role: "Sergeant",
    color: "#0369A1",
    icon: "⭐",
    description: "Sergeants — approve swap shifts, sign up for OT, manage cancellation requests",
    steps: [
      {
        id: "welcome",
        title: "Welcome, Sergeant!",
        body: "Your tour covers the approval workflows, cancellation management, and slot release responsibilities unique to your rank.",
        target: null, position: "center",
        nextLabel: "Let's Go →",
      },
      {
        id: "hold-status",
        title: "Hold Status — Your View",
        body: "As a Sergeant, you can view hold statuses for officers under your command. A red hold indicator means an officer is locked out until the hold expires or you issue an override.",
        target: "hold-status", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "cancel-request",
        title: "Approving Cancel Requests",
        body: "Officers submit cancellation requests here. YOU must approve or deny them before any removal takes effect. Unapproved cancellations remain active assignments.",
        target: "cancel-btn", position: "bottom",
        nextLabel: "Understood",
        confirmRequired: true,
      },
      {
        id: "cancel-tracker",
        title: "Cancel Request Tracker",
        body: "The Cancel Requests page shows all pending, approved, and denied requests. You'll also see a Reason Breakdown — track patterns like repeated Sick Leave or No-Call entries.",
        target: null, position: "center", nav: "cancel-requests",
        nextLabel: "Got it",
      },
      {
        id: "slot-release",
        title: "Approving Slot Releases",
        body: "When an officer needs to give up an approved slot, they submit a Slot Release request. You review and approve it so the slot can be offered to the next eligible officer.",
        target: null, position: "center", nav: "slot-release",
        nextLabel: "Got it",
      },
      {
        id: "schedule-sgt",
        title: "Schedule Calendar",
        body: "The calendar shows all event assignments across your team for the month. Blue = your officer's confirmed shifts. Red = urgent Fire Watch assignments that need coverage.",
        target: null, position: "center", nav: "schedule",
        nextLabel: "Got it",
      },
      {
        id: "bell-sgt",
        title: "Priority Alerts",
        body: "Your bell will ping for cancel requests needing approval, slot releases, and emergency openings requiring immediate coverage decisions. Check it frequently.",
        target: "bell-icon", position: "bottom", nav: "dashboard",
        nextLabel: "Got it",
      },
      {
        id: "done-sgt",
        title: "All Set, Sergeant! 🎉",
        body: "You're responsible for keeping the approval chain moving. Timely approvals prevent scheduling gaps. Visit the FAQ under 'Supervisors & Overrides' for policy details.",
        target: null, position: "center",
        nextLabel: "Finish Tour",
      },
    ],
  },

  // ── SPECIALIST / LIEUTENANT / DIRECTOR TOUR ──────────────────────────────────
  supervisor: {
    role: "Specialist / Lieutenant / Director",
    color: "#7C3AED",
    icon: "🔑",
    description: "Supervisors — post events, approve requests, issue overrides, run reports",
    steps: [
      {
        id: "welcome",
        title: "Welcome, Supervisor!",
        body: "Your tour covers the full administrative power of the system — posting events, managing the roster, issuing overrides, and generating reports.",
        target: null, position: "center",
        nextLabel: "Let's Go →",
      },
      {
        id: "post-event",
        title: "Posting Events",
        body: "From the dashboard, you can post new events with type, date, time, slot count, required rank, and whether a 72-hour hold applies. Events go live immediately for officers to sign up.",
        target: "event-tabs", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "hold-override",
        title: "Issuing Overrides",
        body: "If an officer is on a 72-hour hold but you need them for an urgent event, you can issue an override. Every override is logged with your badge number, reason, and timestamp — full audit trail.",
        target: "hold-status", position: "bottom",
        nextLabel: "Understood",
        confirmRequired: true,
      },
      {
        id: "cancel-approve",
        title: "Cancel & Slot Release Approvals",
        body: "All cancellations and slot releases require your sign-off. Denying a request keeps the officer assigned. Approving triggers automatic notification to the next eligible officer on the waitlist.",
        target: "cancel-btn", position: "bottom",
        nextLabel: "Got it",
      },
      {
        id: "cancel-tracker-sup",
        title: "Cancel Request Tracker",
        body: "Monitor all pending, approved, and denied requests here. The Reason Breakdown flags repeat patterns — excessive No-Calls are automatically escalated for your review.",
        target: null, position: "center", nav: "cancel-requests",
        nextLabel: "Got it",
      },
      {
        id: "slot-release-sup",
        title: "Slot Release Management",
        body: "When you approve a slot release, the system automatically offers the slot to the next officer in the waitlist queue — ordered strictly by timestamp. First in, first out. No manual selection needed.",
        target: null, position: "center", nav: "slot-release",
        nextLabel: "Got it",
      },
      {
        id: "schedule-sup",
        title: "Full Schedule View",
        body: "The calendar shows all department assignments. Gaps in coverage appear as empty date cells. Red cells indicate active Fire Watch events requiring continuous monitoring.",
        target: null, position: "center", nav: "schedule",
        nextLabel: "Got it",
      },
      {
        id: "settings-sup",
        title: "Department Settings & Chain of Command",
        body: "Settings shows the full chain of command, permission levels, grace period policy, and the active protocol memo. Lieutenants and Directors can authorize overrides; Specialists cannot.",
        target: null, position: "center", nav: "settings",
        nextLabel: "Got it",
      },
      {
        id: "bell-sup",
        title: "Your Alert Priority",
        body: "As a supervisor, your bell receives the highest-priority alerts: override requests, emergency openings, no-call escalations, and staffing gap warnings.",
        target: "bell-icon", position: "bottom", nav: "dashboard",
        nextLabel: "Got it",
      },
      {
        id: "done-sup",
        title: "Full Access Granted 🔑",
        body: "You have the highest system access at your rank level. Every action you take is audit-logged. Use overrides judiciously — the fairness system depends on it.",
        target: null, position: "center",
        nextLabel: "Finish Tour",
      },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOUR ROLE SELECTOR MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function TourRoleSelector({ onSelect, onClose }) {
  return (
    <>
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "24px 20px",
          width: "100%", maxWidth: 380,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
            GUIDED TOUR
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", marginBottom: 6 }}>
            Select Your Role
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20, lineHeight: 1.5 }}>
            Choose your rank to get a tour tailored to your responsibilities in the system.
          </div>

          {Object.entries(TOURS).map(([key, tour]) => (
            <div key={key} onClick={() => onSelect(key)} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px", borderRadius: 10, marginBottom: 8,
              border: `1.5px solid ${tour.color}22`,
              background: tour.color + "08",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = tour.color + "15"}
            onMouseLeave={e => e.currentTarget.style.background = tour.color + "08"}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: tour.color + "18", border: `1.5px solid ${tour.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>{tour.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>{tour.role}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, lineHeight: 1.4 }}>{tour.description}</div>
              </div>
              <div style={{ fontSize: 18, color: tour.color, fontWeight: 700 }}>›</div>
            </div>
          ))}

          <button onClick={onClose} style={{
            width: "100%", marginTop: 4, padding: "10px 0",
            background: "none", border: "1px solid #E2E8F0", borderRadius: 8,
            fontSize: 13, color: "#94A3B8", fontWeight: 600, cursor: "pointer",
          }}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUIDED TOUR ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
function GuidedTour({ steps, roleColor, onClose, currentNav, setNav, openAIKey, showToast }) {
  const [stepIdx, setStepIdx]     = useState(0);
  const [highlight, setHighlight] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [muted, setMuted]         = useState(false);
  const [speaking, setSpeaking]   = useState(false);
  const [usingAI, setUsingAI]     = useState(false);
  const audioRef  = useRef(null);   // for OpenAI audio playback
  const cacheRef  = useRef({});     // cache: text → objectURL
  const pendingTextRef = useRef(""); // last spoken text for fallback
  const popoverRef = useRef(null);

  const step        = steps[stepIdx];
  const isFirst     = stepIdx === 0;
  const isLast      = stepIdx === steps.length - 1;
  const accentColor = roleColor || "#1D4ED8";

  // ── Strip emoji for clean speech text ───────────────────────────────────
  const clean = (t) => t.replace(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27FF]|⚠️|🎉|🔑|⭐|🪪/gu, "").trim();

  // ── Stop all audio ───────────────────────────────────────────────────────
  const stopAll = () => {
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setSpeaking(false);
  };

  // ── Web Speech fallback ──────────────────────────────────────────────────
  const speakFallback = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95; utt.pitch = 1; utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") || v.name.includes("Karen") ||
      v.name.includes("Daniel")   || v.name.includes("Google US English") ||
      (v.lang === "en-US" && v.localService)
    );
    if (preferred) utt.voice = preferred;
    utt.onstart = () => { setSpeaking(true); setUsingAI(false); };
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  // ── OpenAI TTS via Vercel proxy ──────────────────────────────────────────
  const speakOpenAI = async (text) => {
    // Use cache to avoid repeat calls
    if (cacheRef.current[text]) {
      playAudioURL(cacheRef.current[text]);
      return;
    }
    try {
      setSpeaking(true);
      setUsingAI(true);
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "nova", speed: 0.95 }),
      });
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      cacheRef.current[text] = url;
      playAudioURL(url);
    } catch (err) {
      console.warn("OpenAI TTS failed:", err.message);
      setUsingAI(false);
      if (showToast) {
        showToast("⚠️ AI voice unavailable. Using built-in voice.", "warn");
      }
      speakFallback(text);
    }
  };

  const playAudioURL = (url) => {
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = url;
    audioRef.current.onplay  = () => { setSpeaking(true); setUsingAI(true); };
    audioRef.current.onended = () => setSpeaking(false);
    audioRef.current.onerror = () => { setSpeaking(false); setUsingAI(false); speakFallback(pendingTextRef.current || ""); };
    audioRef.current.play().catch((err) => {
      console.warn("Audio autoplay blocked:", err.message);
      setSpeaking(false);
      setUsingAI(false);
      speakFallback(pendingTextRef.current || "");
    });
  };

  const speak = (text) => {
    if (muted) return;
    stopAll();
    pendingTextRef.current = text;
    speakOpenAI(text);
  };

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAll();
      // Revoke cached object URLs
      Object.values(cacheRef.current).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // ── Narrate each step ────────────────────────────────────────────────────
  useEffect(() => {
    setConfirming(false);
    if (step.nav && step.nav !== currentNav) setNav(step.nav);
    if (step.target) {
      const el = document.getElementById(step.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setHighlight({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        }, 300);
      }
    } else {
      setHighlight(null);
    }
    setTimeout(() => speak(`${clean(step.title)}. ${clean(step.body)}`), 400);
  }, [stepIdx]);

  // ── Mute toggle ──────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (!muted) {
      stopAll();
      setMuted(true);
    } else {
      setMuted(false);
      setTimeout(() => speak(`${clean(step.title)}. ${clean(step.body)}`), 100);
    }
  };

  const handleNext = () => {
    if (step.confirmRequired && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    if (!isLast) setStepIdx(s => s + 1);
    else onClose();
  };
  const prev = () => { setConfirming(false); if (!isFirst) setStepIdx(s => s - 1); };

  const getPopoverStyle = () => {
    if (!highlight || step.position === "center") {
      return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10001, width: 320 };
    }
    if (step.position === "bottom") {
      return {
        position: "fixed",
        top: Math.min(highlight.top + highlight.height + 12, window.innerHeight - 260),
        left: Math.max(12, Math.min(highlight.left, window.innerWidth - 340)),
        zIndex: 10001, width: 320,
      };
    }
    return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10001, width: 320 };
  };

  const nextLabel = confirming
    ? "Yes, I understand"
    : (step.nextLabel || (isLast ? "Finish 🎉" : "Next →"));

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, pointerEvents: "none" }} />

      {highlight && (
        <div style={{
          position: "fixed",
          top: highlight.top - 6, left: highlight.left - 6,
          width: highlight.width + 12, height: highlight.height + 12,
          background: "transparent",
          boxShadow: `0 0 0 9999px rgba(0,0,0,0.65)`,
          borderRadius: 8, zIndex: 10000, pointerEvents: "none",
          border: `2px solid ${accentColor}`,
          transition: "all 0.3s ease",
        }} />
      )}

      <div ref={popoverRef} style={{
        ...getPopoverStyle(),
        background: "#fff", borderRadius: 14,
        padding: "20px 20px 16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        {/* Role accent bar */}
        <div style={{ height: 3, borderRadius: 99, background: accentColor, marginBottom: 12 }} />

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 99,
              background: i <= stepIdx ? accentColor : "#E2E8F0",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* Step counter + mute button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase" }}>
            Step {stepIdx + 1} of {steps.length}
          </div>
          <button onClick={toggleMute} title={muted ? "Unmute narration" : "Mute narration"} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: muted ? "#F1F5F9" : accentColor + "18",
            border: `1px solid ${muted ? "#E2E8F0" : accentColor + "44"}`,
            borderRadius: 20, padding: "4px 10px", cursor: "pointer",
            fontSize: 11, fontWeight: 700,
            color: muted ? "#94A3B8" : accentColor,
          }}>
            <span style={{ fontSize: 13 }}>{muted ? "🔇" : speaking ? "🔊" : "🔈"}</span>
            {muted ? "Muted" : usingAI ? "AI Voice" : "Voice On"}
          </button>
        </div>

        <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", marginBottom: 8, lineHeight: 1.3 }}>
          {step.title}
        </div>

        {/* Confirm warning */}
        {confirming && (
          <div style={{
            background: "#FEF3C7", border: "1px solid #FDE68A",
            borderRadius: 8, padding: "10px 12px", marginBottom: 10,
            fontSize: 12, color: "#92400E", fontWeight: 600, lineHeight: 1.5,
          }}>
            ⚠️ Please confirm you've read and understood this policy before continuing.
          </div>
        )}

        <div style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, marginBottom: 18 }}>
          {step.body}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={onClose} style={{
            fontSize: 12, color: "#94A3B8", background: "none", border: "none", cursor: "pointer", padding: "6px 0",
          }}>Skip Tour</button>
          <div style={{ display: "flex", gap: 8 }}>
            {!isFirst && (
              <button onClick={prev} style={{
                fontSize: 13, fontWeight: 600, color: accentColor,
                background: accentColor + "15", border: "none", borderRadius: 7,
                padding: "8px 16px", cursor: "pointer",
              }}>← Back</button>
            )}
            <button onClick={handleNext} style={{
              fontSize: 13, fontWeight: 700, color: "#fff",
              background: confirming ? "#D97706" : accentColor,
              border: "none", borderRadius: 7,
              padding: "8px 18px", cursor: "pointer",
              transition: "background 0.2s",
            }}>
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════════════════
function Toast({ msg, type, onDismiss }) {
  const styles = {
    success: { bg: "#dcfce7", c: "#047857", bd: "#bbf7d0" },
    warn:    { bg: "#fef3c7", c: "#92400e", bd: "#fde68a" },
    error:   { bg: "#fee2e2", c: "#b91c1c", bd: "#fca5a5" },
    info:    { bg: "#dbeafe", c: "#1d4ed8", bd: "#bfdbfe" },
  };
  const st = styles[type] || styles.info;
  useEffect(() => {
    const t = setTimeout(onDismiss, 10000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 16, zIndex: 9998,
      background: st.bg, color: st.c, border: `1px solid ${st.bd}`,
      padding: "13px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
      boxShadow: "0 8px 30px rgba(0,0,0,0.15)", maxWidth: 340,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{msg}</span>
      <button onClick={onDismiss} style={{
        background: "none", border: "none", cursor: "pointer",
        color: st.c, fontSize: 16, fontWeight: 700, opacity: 0.6, padding: 0,
      }}>✕</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function NotificationDrawer({ notifications, onClose, onMarkAllRead }) {
  const typeStyles = {
    success: { bg: "#F0FDF4", border: "#BBF7D0", dot: "#10B981", icon: "✅" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6", icon: "ℹ️"  },
    warn:    { bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B", icon: "⚠️"  },
    error:   { bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444", icon: "🚨"  },
  };

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return "Just now";
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 149, background: "transparent",
      }} />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 58, right: 10, width: 320, maxHeight: "70vh",
        background: "#fff", borderRadius: 12, zIndex: 150,
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)", border: "1px solid #E2E8F0",
        display: "flex", flexDirection: "column", overflow: "hidden",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 16px 10px", borderBottom: "1px solid #F1F5F9",
        }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A" }}>Notifications</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={onMarkAllRead} style={{
              fontSize: 11, fontWeight: 700, color: "#1D4ED8",
              background: "none", border: "none", cursor: "pointer",
            }}>Mark all read</button>
            <button onClick={onClose} style={{
              fontSize: 16, color: "#94A3B8", background: "none", border: "none", cursor: "pointer",
            }}>✕</button>
          </div>
        </div>

        {/* Notification list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {notifications.length === 0 && (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              No notifications yet
            </div>
          )}
          {notifications.map(n => {
            const st = typeStyles[n.type] || typeStyles.info;
            return (
              <div key={n.id} style={{
                display: "flex", gap: 10, padding: "12px 14px",
                background: n.read ? "#fff" : st.bg,
                borderBottom: "1px solid #F1F5F9",
                borderLeft: n.read ? "3px solid transparent" : `3px solid ${st.dot}`,
              }}>
                <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{st.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#1E293B", lineHeight: 1.5, fontWeight: n.read ? 400 : 600 }}>
                    {n.msg}
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>{formatTime(n.time)}</div>
                </div>
                {!n.read && (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot, flexShrink: 0, marginTop: 5 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOPBAR
// ═══════════════════════════════════════════════════════════════════════════════
function TopBar({ title, officer, menuOpen, setMenuOpen, nav, setNav, notifCount, onSignOut, onBellClick, darkMode }) {
  return (
    <div style={{
  position: "sticky", top: 0, zIndex: 100,
  background: "#fff", borderBottom: "1px solid #E2E8F0",
  display: "flex", alignItems: "center",
  padding: "0 14px",
  paddingTop: "env(safe-area-inset-top)",
  height: "calc(56px + env(safe-area-inset-top))",
  }}>
      <img src="data:image/png;base64,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"
        style={{ width: 36, height: 36, objectFit: "contain", marginRight: 8 }}
        onError={e => { e.target.style.display="none"; }}
      />
      <span style={{ flex: 1, fontWeight: 800, fontSize: 15, color: "#1D4ED8" }}>{title}</span>

      {/* Bell */}
      <div id="bell-icon" style={{ position: "relative", marginRight: 8 }}>
        <button onClick={onBellClick} style={{
          width: 38, height: 38, borderRadius: 8, border: "1px solid #E2E8F0",
          background: "#F8FAFC", cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>🔔</button>
        {notifCount > 0 && (
          <div style={{
            position: "absolute", top: 2, right: 2,
            width: 10, height: 10, borderRadius: "50%",
            background: "#EF4444", border: "2px solid #fff",
          }} />
        )}
      </div>

      {/* Officer chip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "#1D4ED8", borderRadius: 8, padding: "6px 10px",
        cursor: "pointer", marginRight: 8,
      }} onClick={() => setNav("profile")}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "#fff", color: "#1D4ED8",
          fontSize: 10, fontWeight: 900,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {officer.name.split(" ").map(n=>n[0]).join("")}
        </div>
        <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
          {officer.name.split(" ")[0]}
        </span>
      </div>

      {/* Hamburger */}
      <button onClick={() => setMenuOpen(o => !o)} style={{
        width: 38, height: 38, borderRadius: 8, border: "1px solid #E2E8F0",
        background: menuOpen ? "#1D4ED8" : "#F8FAFC",
        color: menuOpen ? "#fff" : "#374151",
        fontSize: 18, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {menuOpen ? "✕" : "≡"}
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div style={{
          position: "absolute", top: 58, right: 14, width: 200,
          background: "#fff", borderRadius: 10, boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          border: "1px solid #E2E8F0", zIndex: 200, overflow: "hidden",
        }}>
          {[
            ["Dashboard","dashboard"],["Calendar","schedule"],
            ["Slot Release","slot-release"],["Cancel Requests","cancel-requests"],
            ...(isSgtPlus(officer?.rank) ? [["Approvals Queue","approvals"]] : []),
            ...(isSpecialistPlus(officer?.rank) ? [["Analytics","analytics"]] : []),
            ["My Schedule","myschedule"],
            ["FAQ","faq"],["Settings","settings"],
          ].map(([label, target]) => (
            <div key={target} onClick={() => { setNav(target); setMenuOpen(false); }} style={{
              padding: "13px 16px", fontSize: 14, fontWeight: 500,
              color: nav === target ? "#1D4ED8" : "#111827",
              background: nav === target ? "#EFF6FF" : "#fff",
              cursor: "pointer", borderBottom: "1px solid #F1F5F9",
            }}>{label}</div>
          ))}
          <div onClick={onSignOut} style={{ padding: "13px 16px", fontSize: 14, fontWeight: 600, color: "#EF4444", cursor: "pointer" }}>
            Sign Out
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT CARD
// ═══════════════════════════════════════════════════════════════════════════════
function EventCard({ event, signups, onSignup, onWaitlist, onCancel, onRequestCancel, isSgt, queuePos, graceLocked, graceTimeLeft }) {
  const isSigned = signups.confirmed.includes(event.id);
  const isWaited = signups.waitlisted.includes(event.id);
  const isFull = event.filled >= event.slots && !isSigned && !isWaited;

  const typeColors = {
    "COMMENCEMENT": "#7C3AED",
    "ATHLETICS":    "#0369A1",
    "SPECIAL":      "#0F766E",
    "FIRE WATCH":   "#DC2626",
    "STUDENT LIFE": "#D97706",
    "PATROL":       "#475569",
  };
  const tc = typeColors[event.type] || "#475569";

  // Use stable event.id===1 (Spring Commencement) for tour targets — not array index
  const isTargetCard = event.id === 1;

  return (
    <div id={isTargetCard ? "event-card-1" : undefined} style={{
      background: "#fff", borderRadius: 12, padding: "14px 14px 12px",
      border: "1px solid #E2E8F0", marginBottom: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
            background: event.status === "ACTIVE" ? "#FEF2F2" : "#EFF6FF",
            color: event.status === "ACTIVE" ? "#DC2626" : "#1D4ED8",
            padding: "3px 7px", borderRadius: 4,
          }}>{event.status}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            background: tc + "18", color: tc, padding: "3px 7px", borderRadius: 4,
          }}>{event.type}</span>

          {graceTimeLeft && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: "#F0F9FF", color: "#0369A1", border: "1px solid #BAE6FD",
              padding: "3px 7px", borderRadius: 4,
            }}>⏱ Grace: {graceTimeLeft}</span>
          )}
          {(event.armedSlots || 0) > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
              padding: "3px 7px", borderRadius: 4,
            }}>{event.armedSlots} Armed Slot{event.armedSlots > 1 ? "s" : ""}</span>
          )}
        </div>
        {/* Status badge */}
        {isSigned && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "#D1FAE5", padding: "4px 10px", borderRadius: 6 }}>
            CONFIRMED
          </span>
        )}
        {isWaited && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", background: "#EDE9FE", padding: "4px 10px", borderRadius: 6 }}>
            {queuePos ? `#${queuePos} in queue` : "WAITLISTED"}
          </span>
        )}
        {isFull && !isSigned && !isWaited && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", background: "#F3F4F6", padding: "4px 10px", borderRadius: 6 }}>
            FULL
          </span>
        )}
        {!isSigned && !isWaited && !isFull && (
          <span style={{ fontSize: 11, fontWeight: 800, color: "#1D4ED8", background: "#DBEAFE", padding: "4px 10px", borderRadius: 6 }}>
            OPEN
          </span>
        )}
      </div>

      <div style={{ fontWeight: 800, fontSize: 15, color: "#0F172A", marginBottom: 4 }}>
        {event.title}
      </div>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
        {event.date} · {event.time}
        {event.postedAt && (
          <span style={{ marginLeft: 6, color: "#94A3B8" }}>
            · Posted {Math.floor((Date.now() - event.postedAt) / 3600000)}h ago
          </span>
        )}
      </div>

      {/* Slot bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
          <span>Slots filled</span>
          <span>{event.filled}/{event.slots}</span>
        </div>
        <div style={{ height: 5, background: "#F1F5F9", borderRadius: 99 }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${(event.filled / event.slots) * 100}%`,
            background: event.filled >= event.slots ? "#10B981" : "#1D4ED8",
          }} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {isSigned && (
          isSgt
            ? <button onClick={() => onCancel(event.id)} style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #EF4444",
                background: "#fff", color: "#EF4444", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Cancel Signup</button>
            : <button onClick={() => onRequestCancel && onRequestCancel(event.id, "Personal request", "cancel")} style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #F59E0B",
                background: "#fff", color: "#D97706", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>Request Cancel</button>
        )}
        {isWaited && (
          <button onClick={() => onCancel(event.id)} style={{
            flex: 1, padding: "9px 0", borderRadius: 8, border: "1.5px solid #94A3B8",
            background: "#fff", color: "#64748B", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Leave Queue</button>
        )}
        {!isSigned && !isWaited && !isFull && graceLocked && (
          <button disabled style={{ flex:1, padding:"9px 0", borderRadius:8, border:"1.5px solid #CBD5E1", background:"#F8FAFC", color:"#94A3B8", fontWeight:700, fontSize:12, cursor:"not-allowed" }}>
            🔒 Grace Period Active
          </button>
        )}
        {!isSigned && !isWaited && !isFull && !graceLocked && (event.armedSlots||0) > 0 && event.filled >= (event.slots-(event.armedSlots||0)) && !signups?.officer?.armed && (
          <button disabled style={{ flex:1, padding:"9px 0", borderRadius:8, border:"1.5px solid #FECACA", background:"#FEF2F2", color:"#DC2626", fontWeight:700, fontSize:12, cursor:"not-allowed" }}>
            Armed Personnel Only
          </button>
        )}
        {!isSigned && !isWaited && !isFull && !graceLocked && !((event.armedSlots||0) > 0 && event.filled >= (event.slots-(event.armedSlots||0)) && !signups?.officer?.armed) && (
          <button onClick={() => onSignup(event.id)} style={{ flex:1, padding:"9px 0", borderRadius:8, border:"none", background:"#1D4ED8", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", WebkitTapHighlightColor:"transparent" }}>
            Sign Up
          </button>
        )}
        {!isSigned && !isWaited && isFull && (
          <button onClick={() => onWaitlist(event.id)} style={{
            flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
            background: "#7C3AED", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>Join Waitlist</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ officer, signups, handleSignup, handleWaitlist, handleCancel, submitCancelRequest, isSgt, showToast, startTour, events, darkMode = false, signupModal, setSignupModal, cancelModal, setCancelModal }) {
  const [tab, setTab] = useState("all");
  // signupModal and cancelModal lifted to root App — received as props
  const onSignup = (id) => setSignupModal(id);
  const onWaitlist = (id) => handleWaitlist(id);

  const filtered = tab === "my"
    ? events.filter(e => signups.confirmed.includes(e.id) || signups.waitlisted.includes(e.id))
    : tab === "open"
    ? events.filter(e => e.filled < e.slots && !signups.confirmed.includes(e.id))
    : events;

  return (
    <div style={{ padding: "16px 14px" }}>
      {/* Header */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
        OFFICER PORTAL
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginBottom: 2 }}>
        Welcome, {officer.name.split(" ")[0]}
      </div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>
        Campus Peace Officer · Bernard Baruch College
      </div>

      {/* Tour + Cancel buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
  <button onClick={startTour} style={{
    flex: 1, padding: "10px 0", borderRadius: 8,
    border: "1.5px solid #1D4ED8", background: "#fff",
    color: "#1D4ED8", fontWeight: 700, fontSize: 13, cursor: "pointer",
  }}>
    Take the Tour
  </button>
</div>

      {/* Dynamic status banner — changes based on grace period */}
      {(() => {
        const graceSignup = signups.hasGracePeriodSignup && signups.hasGracePeriodSignup();
        const graceEvent = graceSignup
          ? events.find(ev => signups.isInGracePeriod(ev) && signups.confirmed.includes(ev.id))
          : null;
        const graceTimeLeft = graceEvent ? signups.getGraceTimeLeft(graceEvent) : null;

        if (graceSignup && graceTimeLeft) {
          // Amber — grace period active
          return (
            <div id="hold-status" style={{
              background: "#FFFBEB", border: "1px solid #FDE68A",
              borderRadius: 10, padding: "12px 14px", marginBottom: 12,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>⏱</span>
              <div>
                <div style={{ fontWeight: 800, color: "#92400E", fontSize: 14 }}>Grace Period Active</div>
                <div style={{ fontSize: 12, color: "#78350F" }}>
                  You signed up during the 72-hour window. Additional sign-ups unlock in {graceTimeLeft}.
                </div>
              </div>
            </div>
          );
        }

        // Green — all clear
        return (
          <div style={{
            background: "#F0FDF4", border: "1px solid #BBF7D0",
            borderRadius: 10, padding: "12px 14px", marginBottom: 12,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div style={{ fontWeight: 800, color: "#047857", fontSize: 14 }}>Hold Cleared</div>
              <div style={{ fontSize: 12, color: "#065F46" }}>No active hold. You may sign up for any available event.</div>
            </div>
          </div>
        );
      })()}

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div id="confirmed-slots" style={{
          background: "#fff", border: "1px solid #E2E8F0",
          borderRadius: 10, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
            CONFIRMED
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "#10B981" }}>
              {signups.confirmed.length}
            </span>
            <span style={{ fontSize: 12, color: "#1D4ED8", fontWeight: 600, cursor: "pointer" }}>Check</span>
          </div>
          <div style={{ fontSize: 12, color: "#64748B" }}>Auto-approved slots</div>
        </div>

        <div id="waitlisted-slots" style={{
          background: "#fff", border: "1px solid #E2E8F0",
          borderRadius: 10, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>
            WAITLISTED
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "#7C3AED" }}>
              {signups.waitlisted.length}
            </span>
            <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600, cursor: "pointer" }}>List</span>
          </div>
          <div style={{ fontSize: 12, color: "#64748B" }}>In queue</div>
        </div>
      </div>

      {/* Event tabs */}
      <div id="event-tabs" style={{
        display: "flex", gap: 0, borderBottom: "2px solid #E2E8F0", marginBottom: 14,
      }}>
        {[["All Events","all"],["Open Slots","open"],["My Sign-ups","my"]].map(([label, value]) => (
          <button key={value} onClick={() => setTab(value)} style={{
            flex: 1, padding: "10px 0", border: "none",
            background: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
            color: tab === value ? "#1D4ED8" : "#94A3B8",
            borderBottom: tab === value ? "2px solid #1D4ED8" : "2px solid transparent",
            marginBottom: -2,
          }}>{label}</button>
        ))}
      </div>

      {/* Event list */}
      {filtered.map((event) => (
        <EventCard key={event.id} event={event} signups={signups} onSignup={onSignup} onWaitlist={onWaitlist} onCancel={handleCancel} onRequestCancel={(id) => setCancelModal({ eventId: id, type: 'cancel' })} isSgt={isSgt} queuePos={signups.getQueuePosition(event.id)} graceLocked={signups.gracePeriodBlocksSignup(event)} graceTimeLeft={signups.getGraceTimeLeft(event)} />
      ))}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8", fontSize: 14 }}>
          No events to show in this view.
        </div>
      )}

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEDULE VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function Schedule({ signups, events, darkMode = false }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 4 }); // May 2026 (0-indexed)

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = ["S","M","T","W","T","F","S"];

  // Parse event date string into day number for current month
  const getEventDay = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const monthName = monthNames[currentMonth.month];
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();

  // Build calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i+7));

  // Map events to day numbers
  const eventsByDay = {};
  events?.forEach(ev => {
    const day = getEventDay(ev.date);
    if (day) {
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    }
  });

  const typeColors = {
    "COMMENCEMENT": "#7C3AED", "ATHLETICS": "#0369A1", "SPECIAL": "#0F766E",
    "FIRE WATCH": "#DC2626", "STUDENT LIFE": "#D97706", "PATROL": "#475569",
    "BPAC": "#DB2777", "OTHER": "#64748B",
  };

  const today = new Date();
  const isToday = (day) => day === today.getDate() && currentMonth.month === today.getMonth() && currentMonth.year === today.getFullYear();

  return (
    <div style={{ padding:"16px 14px", fontFamily:"'DM Sans', system-ui, sans-serif", background: darkMode ? "#0F172A" : "#F8FAFC", minHeight:"100vh" }}>
      <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>OPERATIONS</div>
      <div style={{ fontSize:22, fontWeight:900, color:"#0F172A", marginBottom:2 }}>Schedule Calendar</div>
      <div style={{ fontSize:13, color:"#64748B", marginBottom:16 }}>Tap any event to see details</div>

      <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, padding:14 }}>
        {/* Month nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <button onClick={() => setCurrentMonth(p => {
            const d = new Date(p.year, p.month - 1, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
          })} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid #E2E8F0", background:"#fff", fontWeight:600, cursor:"pointer" }}>‹</button>
          <span style={{ fontWeight:800, fontSize:16 }}>{monthName} {currentMonth.year}</span>
          <button onClick={() => setCurrentMonth(p => {
            const d = new Date(p.year, p.month + 1, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
          })} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid #E2E8F0", background:"#fff", fontWeight:600, cursor:"pointer" }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2, marginBottom:4 }}>
          {days.map((d,i) => (
            <div key={i} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"#94A3B8", padding:"4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:2 }}>
            {week.map((day, di) => {
              const dayEvents = day ? (eventsByDay[day] || []) : [];
              const hasConfirmed = dayEvents.some(e => signups?.confirmed?.includes(e.id));
              const hasWaitlisted = dayEvents.some(e => signups?.waitlisted?.includes(e.id));
              const hasFireWatch = dayEvents.some(e => e.type === "FIRE WATCH");
              return (
                <div key={di}
                  onClick={() => {
                    if (day && dayEvents.length > 0) setSelectedEvent(dayEvents);
                  }}
                  style={{
                    minHeight:52, padding:"4px 3px",
                    borderRadius:6,
                    border: hasConfirmed ? "2px solid #1D4ED8" : hasWaitlisted ? "2px solid #7C3AED" : "1px solid #F1F5F9",
                    background: hasFireWatch ? "#FEF2F2" : hasConfirmed ? "#EFF6FF" : hasWaitlisted ? "#EDE9FE" : day && dayEvents.length > 0 ? "#F8FAFC" : "#fff",
                    cursor: day && dayEvents.length > 0 ? "pointer" : "default",
                  }}>
                  {day && (
                    <>
                      <div style={{
                        fontSize:11, fontWeight: isToday(day) ? 900 : hasConfirmed ? 800 : 500,
                        color: isToday(day) ? "#fff" : hasConfirmed ? "#1D4ED8" : "#374151",
                        background: isToday(day) ? "#1D4ED8" : "none",
                        borderRadius: isToday(day) ? "50%" : 0,
                        width: isToday(day) ? 18 : "auto",
                        height: isToday(day) ? 18 : "auto",
                        display: isToday(day) ? "flex" : "block",
                        alignItems: "center", justifyContent: "center",
                      }}>{day}</div>
                      {dayEvents.slice(0,2).map((ev, idx) => (
                        <div key={idx} style={{
                          fontSize:8, fontWeight:600, marginTop:2,
                          color: typeColors[ev.type] || "#64748B",
                          overflow:"hidden", lineHeight:1.2,
                          whiteSpace:"nowrap", textOverflow:"ellipsis",
                        }}>
                          {ev.title.length > 8 ? ev.title.slice(0,8)+"…" : ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div style={{ fontSize:8, color:"#94A3B8", marginTop:1 }}>+{dayEvents.length-2} more</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap" }}>
        {[["#EFF6FF","#1D4ED8","Confirmed"],["#EDE9FE","#7C3AED","Waitlisted"],["#FEF2F2","#DC2626","Fire Watch"],["#F8FAFC","#64748B","Event"]].map(([bg,fg,label]) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:bg, border:`1.5px solid ${fg}` }} />
            <span style={{ fontSize:11, color:"#64748B" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:500, display:"flex", alignItems:"flex-end", justifyContent:"center", fontFamily:"'DM Sans', system-ui, sans-serif" }}>
          <div className="slide-up-in" style={{ background:"#fff", borderRadius:"16px 16px 0 0", padding:"24px 20px 40px", width:"100%", maxWidth:430, boxShadow:"0 -8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ width:40, height:4, borderRadius:99, background:"#E2E8F0", margin:"0 auto 20px" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#0F172A" }}>
                {selectedEvent.length > 1 ? `${selectedEvent.length} Events This Day` : selectedEvent[0].title}
              </div>
              <button onClick={() => setSelectedEvent(null)} style={{ background:"#F1F5F9", border:"none", borderRadius:"50%", width:32, height:32, fontSize:16, color:"#64748B", cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ maxHeight:360, overflowY:"auto" }}>
              {selectedEvent.map(ev => {
                const isConfirmed = signups?.confirmed?.includes(ev.id);
                const isWaitlisted = signups?.waitlisted?.includes(ev.id);
                const queuePos = signups?.getQueuePosition?.(ev.id);
                const tc = typeColors[ev.type] || "#64748B";
                const graceActive = ev.postedAt && (Date.now() - ev.postedAt) < GRACE_PERIOD_MS;
                const graceHrs = graceActive ? Math.ceil((GRACE_PERIOD_MS - (Date.now() - ev.postedAt)) / 3600000) : 0;
                return (
                  <div key={ev.id} style={{ background:"#F8FAFC", borderRadius:12, padding:14, marginBottom:10, border:`1.5px solid ${tc}22` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div style={{ fontSize:14, fontWeight:800, color:"#0F172A", flex:1, marginRight:8 }}>{ev.title}</div>
                      <span style={{ fontSize:9, fontWeight:800, color:tc, background:tc+"18", padding:"3px 7px", borderRadius:4, flexShrink:0 }}>{ev.type}</span>
                    </div>
                    {[["📅","Date",ev.date],["🕐","Time",ev.time],["👥","Slots",`${ev.slots - ev.filled} of ${ev.slots} remaining`],
                      ...(ev.location ? [["📍","Location",ev.location]] : []),
                    ].map(([icon,label,value]) => (
                      <div key={label} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderBottom:"1px solid #F1F5F9" }}>
                        <span style={{ fontSize:12, width:18 }}>{icon}</span>
                        <span style={{ fontSize:11, color:"#94A3B8", fontWeight:600, width:42 }}>{label}</span>
                        <span style={{ fontSize:12, color:"#0F172A", fontWeight:600 }}>{value}</span>
                      </div>
                    ))}
                    {graceActive && (
                      <div style={{ marginTop:8, fontSize:11, color:"#0369A1", fontWeight:600, background:"#F0F9FF", padding:"5px 8px", borderRadius:6 }}>
                        ⏱ Grace period active — {graceHrs}h remaining
                      </div>
                    )}
                    {(isConfirmed || isWaitlisted) && (
                      <div style={{ marginTop:8, fontSize:11, fontWeight:700,
                        color: isConfirmed ? "#1D4ED8" : "#7C3AED",
                        background: isConfirmed ? "#EFF6FF" : "#EDE9FE",
                        padding:"5px 8px", borderRadius:6 }}>
                        {isConfirmed ? "✓ You are confirmed for this event" : `⏳ Waitlisted — ${queuePos ? `#${queuePos} in queue` : "in queue"}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE VIEWS
// ═══════════════════════════════════════════════════════════════════════════════
function SlotRelease({ showToast }) {
  return (
    <div style={{ padding: "16px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>SCHEDULING</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginBottom: 4 }}>Slot Release</div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Request to release your approved slot — requires Sergeant or Specialist approval</div>
      <button onClick={() => showToast("Release request submitted for supervisor review.", "info")} style={{
        padding: "11px 20px", borderRadius: 8, background: "#1D4ED8", color: "#fff",
        fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginBottom: 20,
      }}>Request Release</button>
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 10 }}>RELEASE REQUEST HISTORY · 1 record</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Maria Santos — "Spring Commencement"</div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Reason: Medical appointment · May 8 at 02:00 PM</div>
            <div style={{ fontSize: 12, color: "#047857", marginTop: 3, fontWeight: 700 }}>Approved by Sgt. Williams</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#047857", background: "#D1FAE5", padding: "4px 10px", borderRadius: 6 }}>APPROVED</span>
        </div>
      </div>
    </div>
  );
}

function CancelRequests() {
  return (
    <div style={{ padding: "16px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>OPERATIONS</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginBottom: 4 }}>Cancel Request Tracker</div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Officers request cancellation — Sergeant or Specialist must approve before removal takes effect</div>
      {[
        { label: "PENDING APPROVAL", count: 1, color: "#D97706", action: "Wait" },
        { label: "APPROVED",         count: 1, color: "#10B981", action: "Check" },
        { label: "DENIED",           count: 0, color: "#EF4444", action: "X" },
      ].map(s => (
        <div key={s.label} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: s.color }}>{s.count}</div>
          </div>
          <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>{s.action}</span>
        </div>
      ))}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 10 }}>REASON BREAKDOWN</div>
        {[["Sick Leave", 1, "#374151"],["No-Call", 1, "#EF4444"]].map(([r, c, col]) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: 13 }}>{r}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: col }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQ({ setNav, darkMode = false }) {
  const [search, setSearch]         = useState("");
  const [openItem, setOpenItem]     = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [helpful, setHelpful]       = useState({});
  const [searched, setSearched]     = useState([]);

  const FAQ_DATA = [
    // ── Sign-Up & Events ──────────────────────────────────────────────────────
    { id:"su1", cat:"signup", icon:"📋", q:"How do I sign up for an overtime event?",
      a:"From the <b>Dashboard</b>, browse available events and tap <b>Sign Up</b> on any open slot. A confirmation sheet will appear showing the event details — tap <b>Confirm Sign-Up</b> to finalize. You'll receive an in-app notification and email confirmation immediately.",
      cta:{ label:"Go to Dashboard", nav:"dashboard" }},
    { id:"su2", cat:"signup", icon:"📋", q:"What is the 72-hour grace period?",
      a:"Per the <b>Rodney Memo</b>, when a new event is posted a 72-hour window begins. During this period every officer may only sign up for <b>one slot total</b> — giving everyone equal opportunity regardless of who sees it first. After 72 hours, officers may sign up for additional events.",
      cta:null },
    { id:"su3", cat:"signup", icon:"📋", q:"Can I sign up for more than one event at a time?",
      a:"<b>During the 72-hour grace period</b> — No. You are limited to one sign-up while the grace window is active. <b>After 72 hours</b> — Yes, you may sign up for additional open events. The Sign Up button will be locked with a 🔒 icon if the grace period restricts you.",
      cta:null },
    { id:"su4", cat:"signup", icon:"📋", q:"What happens when an event is full?",
      a:"If all slots are filled, the Sign Up button changes to <b>Join Waitlist</b>. Your position in the queue is based entirely on the <b>timestamp you joined</b> — first in, first out. Position is determined by time only. Your queue position (#1, #2, etc.) displays on the event card.",
      cta:{ label:"View Events", nav:"dashboard" }},
    { id:"su5", cat:"signup", icon:"📋", q:"Can a supervisor sign me up for an event?",
      a:"No. Per department policy, <b>officers must sign themselves up</b>. Supervisors cannot sign up on behalf of another officer. If you are on RDO and wish to volunteer, contact your supervisor directly.",
      cta:null },
    { id:"su6", cat:"signup", icon:"📋", q:"Why is the Sign Up button grayed out with a lock icon?",
      a:"The 🔒 <b>Grace Period Active</b> button means you already have a sign-up during an active 72-hour grace window. Once that grace period expires you'll be able to sign up for additional events automatically.",
      cta:null },

    // ── Waitlist ──────────────────────────────────────────────────────────────
    { id:"wl1", cat:"waitlist", icon:"⏳", q:"How does the waitlist work?",
      a:"When you join the waitlist your <b>exact timestamp is recorded</b>. If a slot opens — through a cancellation approval — the system automatically confirms the officer who joined earliest. No manual selection by supervisors. You'll receive an immediate email and in-app notification when you're confirmed.",
      cta:null },
    { id:"wl2", cat:"waitlist", icon:"⏳", q:"How do I know my position in the waitlist?",
      a:"Your queue position appears directly on the event card — <b>#1 in queue</b>, <b>#2 in queue</b>, etc. This updates in real time as officers ahead of you are confirmed or leave the queue.",
      cta:{ label:"View My Events", nav:"dashboard" }},
    { id:"wl3", cat:"waitlist", icon:"⏳", q:"How do I leave the waitlist?",
      a:"Tap <b>Leave Queue</b> on the event card. You will be immediately removed and the queue reorders automatically. No supervisor approval is needed to leave a waitlist.",
      cta:null },
    { id:"wl4", cat:"waitlist", icon:"⏳", q:"Will I get notified when I'm promoted from the waitlist?",
      a:"Yes — you'll receive both an <b>in-app notification</b> (bell icon) and an <b>email</b> the moment you're confirmed. The email includes event details and a direct link to the app.",
      cta:null },

    // ── Cancellations ─────────────────────────────────────────────────────────
    { id:"ca1", cat:"cancel", icon:"🔄", q:"How do I cancel an event I signed up for?",
      a:"Tap <b>Request Cancel</b> on the event card from your Dashboard. Select a reason from the list and submit. A Sergeant must approve your request before you're removed from the event. <b>You remain assigned until approved</b> — do not assume you're off the event after submitting.",
      cta:{ label:"View My Sign-ups", nav:"dashboard" }},
    { id:"ca2", cat:"cancel", icon:"🔄", q:"Can I remove myself from an event directly?",
      a:"No. Per department policy (Rodney Memo), <b>officers cannot scratch out their own names</b>. All cancellations must go through a supervisor. Submit a cancel request and a Sergeant will review it.",
      cta:null },
    { id:"ca3", cat:"cancel", icon:"🔄", q:"What happens to my slot when my cancel is approved?",
      a:"Your slot is released and the <b>next officer in the waitlist queue is automatically confirmed</b> based on their join timestamp. You'll receive a confirmation email that you've been removed. The promoted officer also receives an email.",
      cta:null },
    { id:"ca4", cat:"cancel", icon:"🔄", q:"What if my cancel request is denied?",
      a:"You remain assigned to the event. You'll receive an in-app notification and email confirming the denial. If you believe the denial was in error, contact your supervisor directly.",
      cta:null },
    { id:"ca5", cat:"cancel", icon:"🔄", q:"What is a slot release?",
      a:"A <b>slot release</b> is a request to give up your confirmed spot so it can be offered to officers on the waitlist. It follows the same approval process as a cancellation — a Sergeant must approve before you're removed.",
      cta:{ label:"Go to Slot Release", nav:"slot-release" }},

    // ── Fire Watch ────────────────────────────────────────────────────────────
    { id:"fw1", cat:"firewatch", icon:"🔥", q:"How do I sign up for Fire Watch?",
      a:"Fire Watch shifts appear as individual event cards on your Dashboard — each shift (overnight, day, evening) is separate. Tap <b>Sign Up</b> on the specific shift you want. You choose exactly which shift to work — you are not automatically assigned a random slot.",
      cta:{ label:"Browse Events", nav:"dashboard" }},
    { id:"fw2", cat:"firewatch", icon:"🔥", q:"Where is Fire Watch located?",
      a:"All Fire Watch assignments are located at the <b>VC Building — 17 Lexington Ave</b>. Report to the main security desk upon arrival.",
      cta:null },
    { id:"fw3", cat:"firewatch", icon:"🔥", q:"Can I sign up for multiple Fire Watch shifts?",
      a:"During the <b>72-hour grace period</b> after posting, you may only sign up for one shift. After the grace period expires you may sign up for additional shifts if slots are still available.",
      cta:null },
    { id:"fw4", cat:"firewatch", icon:"🔥", q:"What is the difference between Fire Watch and a regular OT event?",
      a:"Fire Watch is a <b>separate overtime category</b> from event-based OT (Athletics, Commencement, etc.). Each posted Fire Watch sheet is treated independently per the Rodney Memo. The 72-hour grace period applies to each posting separately.",
      cta:null },

    // ── App & Account ─────────────────────────────────────────────────────────
    { id:"ap1", cat:"app", icon:"📱", q:"How do I log in?",
      a:"Enter your <b>badge number</b> (e.g. PS-0412) and your <b>password</b>, then tap Continue. On the next screen enter your <b>6-digit authenticator code</b>. Demo accounts use the password <b>DEMO1234</b>.",
      cta:null },
    { id:"ap2", cat:"app", icon:"📱", q:"I forgot my password. What do I do?",
      a:"Contact your supervisor or the department administrator to have your credentials reset. Password reset is currently handled by IT — this feature will be automated once CUNY SSO is integrated.",
      cta:null },
    { id:"ap3", cat:"app", icon:"📱", q:"Will I lose my data if I close the app?",
      a:"<b>Currently yes</b> — the app is in prototype phase and data resets when you refresh the browser. This is a known limitation that will be resolved when IT connects a permanent database backend.",
      cta:null },
    { id:"ap4", cat:"app", icon:"📱", q:"How do I take the guided tour?",
      a:"From the <b>Dashboard</b>, scroll down and tap <b>Take the Tour</b>. Select your role and the tour will walk you through every feature step by step with voice narration. You can mute the voice using the 🔈 button on any step.",
      cta:{ label:"Go to Dashboard", nav:"dashboard" }},
    { id:"ap5", cat:"app", icon:"📱", q:"What do the different notification colors mean?",
      a:"<b>Green</b> — confirmations and approvals. <b>Blue</b> — general information and waitlist updates. <b>Amber</b> — warnings and policy reminders. <b>Red</b> — denials and urgent alerts. Tap the 🔔 bell to view all notifications.",
      cta:null },

    // ── Supervisors ───────────────────────────────────────────────────────────
    { id:"sv1", cat:"supervisor", icon:"🔑", q:"Who can post new overtime events?",
      a:"Only <b>Specialists, Lieutenants, and the Director</b> can post new events. Sergeants can approve or deny cancel requests but cannot post events. If you need an event posted, contact a Specialist or above.",
      cta:null },
    { id:"sv2", cat:"supervisor", icon:"🔑", q:"How does a Sergeant approve a cancel request?",
      a:"Sergeants see an <b>Approvals Queue</b> tab in the hamburger menu. Pending requests appear with the officer's name, event, and reason. Tap <b>✓ Approve</b> to release the slot — the next waitlisted officer is automatically confirmed. Tap <b>✕ Deny</b> to keep the officer assigned.",
      cta:null },
    { id:"sv3", cat:"supervisor", icon:"🔑", q:"What is an override and who can issue one?",
      a:"An override allows a <b>Lieutenant or Director</b> to manually assign an officer to an event bypassing the normal queue. Every override is permanently logged in the audit trail with the issuing officer's badge, the reason, and a timestamp.",
      cta:null },
    { id:"sv4", cat:"supervisor", icon:"🔑", q:"How do I post multiple events at once?",
      a:"In the Admin Dashboard, tap <b>Post New Event</b>. Fill out the form and tap <b>Add to Queue</b> instead of Post Now. Repeat for each event. When ready tap <b>Post All</b> — all events go live with a shared timestamp, counting as one sheet per the Rodney Memo.",
      cta:null },
  ];

  const CATEGORIES = [
    { id:"all",       label:"All",            icon:"🗂️" },
    { id:"signup",    label:"Sign-Up",        icon:"📋" },
    { id:"waitlist",  label:"Waitlist",       icon:"⏳" },
    { id:"cancel",    label:"Cancellations",  icon:"🔄" },
    { id:"firewatch", label:"Fire Watch",     icon:"🔥" },
    { id:"app",       label:"App & Account",  icon:"📱" },
    { id:"supervisor",label:"Supervisors",    icon:"🔑" },
  ];

  const filtered = FAQ_DATA.filter(item => {
    const matchesCat = activeCategory === "all" || item.cat === activeCategory;
    const matchesSearch = !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const markHelpful = (id, value) => setHelpful(p => ({ ...p, [id]: value }));

  return (
    <div style={{ padding:"16px 14px", fontFamily:"'DM Sans', system-ui, sans-serif", background: darkMode ? "#0F172A" : "#F8FAFC", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>HELP CENTER</div>
      <div style={{ fontSize:22, fontWeight:900, color:"#0F172A", marginBottom:2 }}>Frequently Asked Questions</div>
      <div style={{ fontSize:13, color:"#64748B", marginBottom:14 }}>{FAQ_DATA.length} questions · Bernard Baruch College Public Safety</div>

      {/* Search bar */}
      <div style={{ position:"relative", marginBottom:14 }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, pointerEvents:"none" }}>🔍</span>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setOpenItem(null); }}
          placeholder="Search questions... (e.g. waitlist, cancel, fire watch)"
          style={{
            width:"100%", padding:"11px 14px 11px 38px", borderRadius:10,
            border:"1.5px solid #E2E8F0", fontSize:14, boxSizing:"border-box",
            background:"#F8FAFC", outline:"none",
            transition:"border 0.2s",
          }}
          onFocus={e => e.target.style.borderColor="#1D4ED8"}
          onBlur={e => e.target.style.borderColor="#E2E8F0"}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", fontSize:16, color:"#94A3B8", cursor:"pointer" }}>✕</button>
        )}
      </div>

      {/* Category chips */}
      {!search && (
        <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:16, paddingBottom:4, scrollbarWidth:"none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
              padding:"6px 12px", borderRadius:20, border:"none", flexShrink:0,
              background: activeCategory === cat.id ? "#1D4ED8" : "#F1F5F9",
              color: activeCategory === cat.id ? "#fff" : "#64748B",
              fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap",
            }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Search result count */}
      {search && (
        <div style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>
          {filtered.length === 0 ? "No results found." : `${filtered.length} result${filtered.length > 1 ? "s" : ""} for "${search}"`}
        </div>
      )}

      {/* No results state */}
      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>🤔</div>
          <div style={{ fontWeight:700, fontSize:15, color:"#0F172A", marginBottom:6 }}>No results found</div>
          <div style={{ fontSize:13, color:"#64748B", marginBottom:16 }}>Try different keywords or browse by category.</div>
          <button onClick={() => { setSearch(""); setActiveCategory("all"); }} style={{
            padding:"10px 20px", borderRadius:8, border:"none", background:"#1D4ED8",
            color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
          }}>Clear Search</button>
        </div>
      )}

      {/* Accordion FAQ items */}
      {filtered.map((item, idx) => {
        const isOpen = openItem === item.id;
        const vote = helpful[item.id];
        return (
          <div key={item.id} style={{
            background: darkMode ? "#1E293B" : "#fff", borderRadius:10, marginBottom:6,
            border: isOpen ? "1.5px solid #1D4ED8" : `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`,
            overflow:"hidden", transition:"border 0.2s",
          }}>
            {/* Question row — tap to expand */}
            <div onClick={() => setOpenItem(isOpen ? null : item.id)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"13px 14px", cursor:"pointer",
            }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
              <div style={{ flex:1, fontSize:13, fontWeight:600, color:"#0F172A", lineHeight:1.4 }}>
                {item.q}
              </div>
              <span style={{
                fontSize:16, color: isOpen ? "#1D4ED8" : "#CBD5E1",
                transform: isOpen ? "rotate(90deg)" : "none", transition:"transform 0.2s", flexShrink:0,
              }}>›</span>
            </div>

            {/* Answer — visible when open */}
            {isOpen && (
              <div style={{ padding:"0 14px 14px 42px", borderTop:"1px solid #F1F5F9" }}>
                <div style={{ fontSize:13, color:"#334155", lineHeight:1.7, marginTop:10 }}
                  dangerouslySetInnerHTML={{ __html: item.a }} />

                {/* CTA button */}
                {item.cta && setNav && (
                  <button onClick={() => setNav(item.cta.nav)} style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    marginTop:12, padding:"8px 14px", borderRadius:8, border:"none",
                    background:"#EFF6FF", color:"#1D4ED8", fontWeight:700, fontSize:12, cursor:"pointer",
                  }}>
                    {item.cta.label} →
                  </button>
                )}

                {/* Was this helpful? */}
                <div style={{ marginTop:14, paddingTop:10, borderTop:"1px solid #F1F5F9", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:11, color:"#94A3B8", fontWeight:600 }}>Was this helpful?</span>
                  {vote ? (
                    <span style={{ fontSize:11, color:"#059669", fontWeight:700 }}>
                      {vote === "yes" ? "👍 Thanks for the feedback!" : "👎 We'll improve this answer."}
                    </span>
                  ) : (
                    <>
                      <button onClick={() => markHelpful(item.id,"yes")} style={{ padding:"4px 12px", borderRadius:6, border:"1px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", color:"#374151" }}>👍 Yes</button>
                      <button onClick={() => markHelpful(item.id,"no")} style={{ padding:"4px 12px", borderRadius:6, border:"1px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", color:"#374151" }}>👎 No</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Escalation — easy contact */}
      <div style={{ background: darkMode ? "#1E293B" : "#F8FAFC", border:`1px solid ${darkMode ? "#334155" : "#E2E8F0"}`, borderRadius:12, padding:16, marginTop:16, textAlign:"center" }}>
        <div style={{ fontSize:16, marginBottom:6 }}>🙋</div>
        <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", marginBottom:4 }}>Still have a question?</div>
        <div style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>Contact your supervisor or the department administrator directly.</div>
        <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
          <button onClick={() => setNav && setNav("profile")} style={{
            padding:"9px 16px", borderRadius:8, border:"1px solid #E2E8F0",
            background:"#fff", color:"#374151", fontWeight:700, fontSize:12, cursor:"pointer",
          }}>View My Profile</button>
          <button onClick={() => setNav && setNav("settings")} style={{
            padding:"9px 16px", borderRadius:8, border:"none",
            background:"#1D4ED8", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer",
          }}>Notification Settings</button>
        </div>
      </div>
    </div>
  );
}

function Profile({ officer }) {
  return (
    <div style={{ padding: "16px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>ACCOUNT</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginBottom: 16 }}>My Profile</div>
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        {/* Avatar + name + badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            {officer.name.split(" ").map(n=>n[0]).join("")}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{officer.name}</div>
            <div style={{ fontSize: 13, color: "#64748B" }}>{officer.rank}</div>
            <div style={{ fontSize: 13, color: "#64748B" }}>{officer.email}</div>
          </div>
        </div>
        {/* Armed + rank badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#1D4ED8", padding: "4px 10px", borderRadius: 20, border: "1px solid #BFDBFE" }}>
            {officer.badge}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: "#059669", padding: "4px 10px", borderRadius: 20, border: "1px solid #A7F3D0" }}>
            {officer.rank}
          </span>
          {officer.armed && (
            <span style={{ fontSize: 11, fontWeight: 700, background: "#FEF2F2", color: "#DC2626", padding: "4px 10px", borderRadius: 20, border: "1px solid #FECACA" }}>
              Armed Officer
            </span>
          )}
        </div>
        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[["FULL NAME", officer.name],["BADGE NUMBER", officer.badge],["RANK", officer.rank],["PHONE", officer.phone]].map(([label, value]) => (
            <div key={label} style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
          <div style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 3 }}>EMAIL</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{officer.email}</div>
          </div>
          {officer.armed && (
            <div style={{ background: "#FEF2F2", borderRadius: 8, padding: "10px 12px", border: "1px solid #FECACA" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#DC2626", letterSpacing: 0.8, marginBottom: 3 }}>DESIGNATION</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#DC2626" }}>Armed Officer</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 10 }}>SCHEDULE INFORMATION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>ASSIGNED TOUR</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#1D4ED8" }}>{officer.tour}</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>7am – 3pm</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>REGULAR DAYS OFF</div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#10B981" }}>{officer.daysOff}</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Fixed weekly schedule</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Settings({ startTour, officer, openAIKey, setOpenAIKey, darkMode, setDarkMode }) {
  const [notifs, setNotifs] = useState({
    newEvent: true, approvals: true, slotRelease: true, cancelAlerts: true, emergencyOpenings: true,
  });
  const [keyInput, setKeyInput]   = useState(openAIKey || "");
  const [keySaved, setKeySaved]   = useState(!!openAIKey);
  const [showKey, setShowKey]     = useState(false);
  const toggle = (key) => setNotifs(n => ({ ...n, [key]: !n[key] }));

  const saveKey = () => {
    setOpenAIKey(keyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };
  const clearKey = () => {
    setKeyInput("");
    setOpenAIKey("");
    setKeySaved(false);
  };
  const notifItems = [
    ["newEvent","New Event Posted","Alerts when a new event is posted"],
    ["approvals","Approval Updates","Sign-up approved or denied"],
    ["slotRelease","Slot Release Alerts","Notifications when slots are released or offered to you"],
    ["cancelAlerts","Cancel Request Alerts","Department cancellation notifications"],
    ["emergencyOpenings","Emergency Openings","Urgent/emergency coverage alerts"],
  ];
  return (
    <div style={{ padding: "16px 14px", background: darkMode ? "#0F172A" : "#F8FAFC", minHeight: "100vh", transition: "background 0.3s ease" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>ACCOUNT</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: darkMode ? "#F1F5F9" : "#0F172A", marginBottom: 2 }}>Settings</div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Logged in as {officer.name} · {officer.rank}</div>
      {/* Profile card */}
      <div style={{ background: darkMode ? "#1E293B" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 12 }}>MY PROFILE</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <img src="data:image/png;base64,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" style={{ width: 44, height: 44, objectFit: "contain" }} onError={e=>e.target.style.display="none"} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{officer.name}</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Campus Peace Officer · {officer.badge}</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Bernard Baruch College</div>
          </div>
        </div>
        {[["Badge", officer.badge],["Rank","Campus Peace Officer"],["Campus","Bernard Baruch College"]].map(([k,v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      {/* Guided tour */}
      <div style={{ background: darkMode ? "#1E293B" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 8 }}>GUIDED TOUR</div>
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 12 }}>
          New to the system? Take the guided tour to learn how everything works — from signing up for events to managing your profile and schedule.
        </div>
        <button onClick={startTour} style={{
          width: "100%", padding: "12px 0", borderRadius: 8, border: "none",
          background: "#1D4ED8", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}>Launch Guided Tour</button>
      </div>
      {/* Dark Mode */}
      <div style={{ background: darkMode ? "#1E293B" : "#fff", border:`1px solid ${darkMode ? "#334155" : "#E2E8F0"}`, borderRadius:12, padding:16, marginBottom:12 }}>
        <div style={{ fontSize:10, fontWeight:800, color:"#94A3B8", letterSpacing:0.8, marginBottom:10 }}>DISPLAY</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>🌙 Dark Mode</div>
            <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>
              {darkMode ? "Dark theme active — easier on eyes at night" : "Light theme active"}
            </div>
          </div>
          <Toggle checked={darkMode} onChange={setDarkMode} color="#0F172A" />
        </div>
      </div>

      {/* Days Off / Availability */}
      <DaysOffSettings officer={officer} />

      {/* OpenAI Voice card — Specialist+ only */}
      {isSpecialistPlus(officer?.rank) && (
      <div style={{ background: darkMode ? "#1E293B" : "#fff", border: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 4 }}>AI VOICE NARRATION</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>🎙️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>OpenAI TTS</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>
              {openAIKey ? "✅ AI voice active — using OpenAI Nova" : "Add your key to enable premium AI voice"}
            </div>
          </div>
        </div>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            type={showKey ? "text" : "password"}
            value={keyInput}
            onChange={e => { setKeyInput(e.target.value); setKeySaved(false); }}
            placeholder="sk-..."
            style={{
              width: "100%", padding: "10px 40px 10px 12px", borderRadius: 8,
              border: `1.5px solid ${openAIKey ? "#10B981" : "#E2E8F0"}`,
              fontSize: 13, boxSizing: "border-box", fontFamily: "monospace",
              background: "#F8FAFC", color: "#0F172A", outline: "none",
            }}
          />
          <button onClick={() => setShowKey(s => !s)} style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94A3B8",
          }}>{showKey ? "🙈" : "👁"}</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveKey} style={{
            flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
            background: keySaved ? "#10B981" : "#1D4ED8",
            color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
            transition: "background 0.3s",
          }}>
            {keySaved ? "✓ Saved!" : "Save Key"}
          </button>
          {openAIKey && (
            <button onClick={clearKey} style={{
              padding: "9px 16px", borderRadius: 8,
              border: "1px solid #E2E8F0", background: "#fff",
              color: "#EF4444", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>Remove</button>
          )}
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 8, lineHeight: 1.5 }}>
          Your key is stored in memory only — never sent anywhere except OpenAI's API directly from your browser. Get a key at platform.openai.com
          <span style={{ display: "block", marginTop: 4, color: "#F59E0B", fontWeight: 600 }}>
            ⚠️ Note: AI voice requires the app to run outside Claude artifacts due to browser security restrictions (CSP). The key is ready for when you deploy the app.
          </span>
        </div>
      </div>
      )}

      {/* Notification preferences */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", letterSpacing: 0.8, marginBottom: 12 }}>NOTIFICATION PREFERENCES</div>
        {notifItems.map(([key, title, desc]) => (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{desc}</div>
            </div>
            <div onClick={() => toggle(key)} style={{
              width: 44, height: 24, borderRadius: 12, cursor: "pointer",
              background: notifs[key] ? "#1D4ED8" : "#CBD5E1",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: 2, left: notifs[key] ? 22 : 2,
                width: 20, height: 20, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO ACCOUNTS
// ═══════════════════════════════════════════════════════════════════════════════
const DEMO_PASSWORD = "DEMO1234";
const DEMO_ACCOUNTS = [
  { label: "CPO Carter",       badge: "PS-0412", officerId: 1 },
  { label: "Cpl. Reyes",       badge: "PS-0345", officerId: 2 },
  { label: "Specialist Mehta", badge: "PS-0476", officerId: 3 },
  { label: "Sgt. Williams",    badge: "PS-0501", officerId: 4 },
  { label: "Lt. Brown",        badge: "PS-0290", officerId: 5 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN STEP 1 — CREDENTIALS
// ═══════════════════════════════════════════════════════════════════════════════
function LoginCredentials({ onNext }) {
  const [badge, setBadge]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");

  const handleContinue = () => {
    setError("");
    const officer = OFFICERS.find(o => o.badge === badge.toUpperCase().trim());
    if (!officer) { setError("Badge number not found. Try a demo account below."); return; }
    if (password !== DEMO_PASSWORD) { setError("Incorrect password. Demo password: DEMO1234"); return; }
    onNext(officer);
  };

  const autoFill = (account) => {
    setBadge(account.badge);
    setPassword(DEMO_PASSWORD);
    setError("");
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 6,
    border: "1px solid #D1D5DB", fontSize: 13, color: "#374151",
    background: "#fff", boxSizing: "border-box", outline: "none",
    fontFamily: "system-ui, sans-serif",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#d6e4f0",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "system-ui, sans-serif",
      paddingBottom: 48,
    }}>
      {/* Shield — centered, generous top space, no container constraint */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", paddingTop: 44, paddingBottom: 8 }}>
        <img
          src={SHIELD_B64}
          style={{ width: 140, height: 140, objectFit: "contain" }}
        />
      </div>

      {/* CUNY text — full width, centered */}
      <div style={{ textAlign: "center", width: "100%", padding: "0 24px", marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#c8960a", letterSpacing: 3, textTransform: "uppercase", marginBottom: 3 }}>
          CITY UNIVERSITY OF NEW YORK
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 14 }}>
          PUBLIC SAFETY DEPARTMENT
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 6, whiteSpace: "nowrap" }}>
          Event Management Tracker
        </div>
        <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 24 }}>
          Bernard Baruch College - Authorized Personnel Only
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#2563EB" }}>Credentials</span>
        </div>
        <div style={{ width: 52, height: 2, background: "#B0BEC5", margin: "0 10px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#B0BEC5", color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#9CA3AF" }}>Authenticator</span>
        </div>
      </div>

      {/* Form card */}
      <div style={{
        width: "calc(100% - 32px)", maxWidth: 500,
        background: "#fff", borderRadius: 10,
        padding: "18px 16px 16px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
        border: "1px solid #E5E7EB",
        marginBottom: 10,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14, textAlign: "center" }}>
          Sign In to Your Account
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            BADGE NUMBER
          </label>
          <input
            value={badge}
            onChange={e => { setBadge(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleContinue()}
            placeholder="PS-XXXX"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            PASSWORD
          </label>
          <input
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleContinue()}
            type="password"
            placeholder="Password"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 6,
            padding: "8px 10px", marginBottom: 10, fontSize: 11, color: "#B91C1C", fontWeight: 600,
          }}>⚠️ {error}</div>
        )}

        <button onClick={handleContinue} style={{
          width: "100%", padding: "11px 0", borderRadius: 6, border: "none",
          background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: 14,
          cursor: "pointer", letterSpacing: 0.3,
        }}>
          Continue
        </button>
      </div>

      {/* Demo accounts card */}
      <div style={{
        width: "calc(100% - 32px)", maxWidth: 500,
        background: "#fff", borderRadius: 10,
        padding: "12px 14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        border: "1px solid #E5E7EB",
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>
          DEMO ACCOUNTS - PASSWORD: DEMO1234
        </div>
        {DEMO_ACCOUNTS.map(acc => (
          <div key={acc.badge} onClick={() => autoFill(acc)} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 10px", borderRadius: 6, marginBottom: 5,
            border: badge === acc.badge ? "1.5px solid #2563EB" : "1px solid #E5E7EB",
            background: badge === acc.badge ? "#EFF6FF" : "#fff",
            cursor: "pointer",
          }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: badge === acc.badge ? "#1D4ED8" : "#111827" }}>
              {acc.label}
            </span>
            <span style={{ fontSize: 11, color: "#6B7280" }}>
              {acc.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN STEP 2 — MFA AUTHENTICATOR
// ═══════════════════════════════════════════════════════════════════════════════
function LoginMFA({ officer, onVerify, onBack }) {
  const [code, setCode]         = useState(["", "", "", "", "", ""]);
  const [error, setError]       = useState("");
  const [mfaCode, setMfaCode]   = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs               = useRef([]);

  // Generate and rotate demo MFA code every 30s
  useEffect(() => {
    const generate = () => Math.floor(100000 + Math.random() * 900000).toString();
    setMfaCode(generate());
    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setMfaCode(generate()); return 30; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigit = (val, idx) => {
    const cleaned = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = cleaned;
    setCode(next);
    setError("");
    if (cleaned && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (!cleaned && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    const entered = code.join("");
    if (entered.length < 6) { setError("Please enter all 6 digits."); return; }
    if (entered !== mfaCode) { setError("Incorrect code. Use the demo code shown above."); return; }
    onVerify(officer);
  };

  const fillCode = () => {
    setCode(mfaCode.split(""));
    setError("");
    setTimeout(() => inputRefs.current[5]?.focus(), 50);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(160deg,#EFF6FF 0%,#F1F5F9 60%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      padding: "32px 20px 40px",
    }}>
      <img
        src="data:image/png;base64,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"
        style={{ width: 88, height: 88, objectFit: "contain", marginBottom: 20 }}
        onError={e => { e.target.style.display = "none"; }}
      />
      <div style={{ fontSize: 11, fontWeight: 800, color: "#1D4ED8", letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>
        CITY UNIVERSITY OF NEW YORK
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
        PUBLIC SAFETY DEPARTMENT
      </div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0F172A", marginBottom: 4, whiteSpace: "nowrap" }}>
        Event Management Tracker
      </div>
      <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 28 }}>
        Bernard Baruch College — Authorized Personnel Only
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#10B981", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>Credentials</span>
        </div>
        <div style={{ width: 40, height: 2, background: "#1D4ED8", borderRadius: 99 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1D4ED8", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>2</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8" }}>Authenticator</span>
        </div>
      </div>

      {/* MFA card */}
      <div style={{
        width: "100%", maxWidth: 400, background: "#fff",
        borderRadius: 14, padding: "24px 20px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #E2E8F0",
        marginBottom: 16,
      }}>
        {/* MS Authenticator header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "#F8FAFC", border: "1px solid #E2E8F0",
          borderRadius: 10, padding: "12px 14px", marginBottom: 20,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: "#1D4ED8", color: "#fff",
            fontSize: 13, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>MS</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Microsoft Authenticator</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Enter the 6-digit code for CUNY PS Event Management</div>
          </div>
        </div>

        {/* Live demo code display */}
        <div style={{
          background: "#EFF6FF", border: "1.5px solid #BFDBFE",
          borderRadius: 10, padding: "16px 14px", marginBottom: 20, textAlign: "center",
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#1D4ED8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
            DEMO — CURRENT CODE
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            {/* Countdown ring */}
            <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
              <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="22" cy="22" r="18" fill="none" stroke="#DBEAFE" strokeWidth="3" />
                <circle cx="22" cy="22" r="18" fill="none" stroke="#1D4ED8" strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - timeLeft / 30)}`}
                  style={{ transition: "stroke-dashoffset 1s linear" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#1D4ED8" }}>
                {timeLeft}
              </div>
            </div>
            {/* Code */}
            <div style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", letterSpacing: 6, fontFamily: "monospace" }}>
              {mfaCode.slice(0, 3)} {mfaCode.slice(3)}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>Rotates in {timeLeft}s</div>
          {/* Auto-fill button */}
          <button onClick={fillCode} style={{
            marginTop: 10, padding: "7px 16px", borderRadius: 6,
            background: "#1D4ED8", color: "#fff", border: "none",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>↓ Auto-fill Code</button>
        </div>

        {/* 6-digit input */}
        <label style={{ fontSize: 10, fontWeight: 800, color: "#64748B", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 10 }}>
          ENTER CODE FROM AUTHENTICATOR
        </label>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }} onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              value={digit}
              onChange={e => handleDigit(e.target.value, i)}
              onKeyDown={e => {
                if (e.key === "Backspace" && !digit && i > 0) inputRefs.current[i - 1]?.focus();
                if (e.key === "Enter") handleVerify();
              }}
              maxLength={1}
              inputMode="numeric"
              style={{
                width: 44, height: 52, textAlign: "center", fontSize: 22, fontWeight: 800,
                borderRadius: 8, border: digit ? "2px solid #1D4ED8" : "1.5px solid #E2E8F0",
                background: digit ? "#EFF6FF" : "#F8FAFC",
                color: "#0F172A", fontFamily: "monospace",
                outline: "none", boxSizing: "border-box",
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8,
            padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "#B91C1C", fontWeight: 600,
          }}>⚠️ {error}</div>
        )}

        <button onClick={handleVerify} style={{
          width: "100%", padding: "13px 0", borderRadius: 8, border: "none",
          background: code.join("").length === 6 ? "#1D4ED8" : "#CBD5E1",
          color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer",
          transition: "background 0.2s",
        }}>Verify & Sign In</button>
      </div>

      {/* Back + help row */}
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 400 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 13, color: "#1D4ED8", fontWeight: 600, cursor: "pointer" }}>
          ← Back
        </button>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>Having trouble? Contact your supervisor</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIRST-LOGIN TOUR PROMPT
// ═══════════════════════════════════════════════════════════════════════════════
function FirstLoginPrompt({ officer, onStartTour, onSkip }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 24px",
        maxWidth: 360, width: "100%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          WELCOME ABOARD
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", marginBottom: 10 }}>
          Hi, {officer.name.split(" ")[0]}!
        </div>
        <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
          Looks like it's your first time here. Would you like a quick guided tour of the Event Management Tracker?
        </div>
        <button onClick={onStartTour} style={{
          width: "100%", padding: "13px 0", borderRadius: 8, border: "none",
          background: "#1D4ED8", color: "#fff", fontWeight: 800, fontSize: 15,
          cursor: "pointer", marginBottom: 10,
        }}>
          Yes, Take Me on the Tour!
        </button>
        <button onClick={onSkip} style={{
          width: "100%", padding: "11px 0", borderRadius: 8,
          background: "none", border: "1px solid #E2E8F0",
          color: "#64748B", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>
          Skip for Now
        </button>
        <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 12 }}>
          You can always launch the tour from Settings
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGN-UP CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function SignupConfirmModal({ event, officer, onConfirm, onClose }) {
  if (!event) return null;

  const typeColors = {
    "COMMENCEMENT": "#7C3AED", "ATHLETICS": "#0369A1", "SPECIAL": "#0F766E",
    "FIRE WATCH": "#DC2626",  "STUDENT LIFE": "#D97706", "PATROL": "#475569",
  };
  const tc = typeColors[event.type] || "#475569";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 10002, display: "flex", alignItems: "flex-start", justifyContent: "center",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
      <div
        className="slide-down-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: "0 0 20px 20px",
          padding: "20px 20px 28px", width: "100%", maxWidth: 430,
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          maxHeight: "90vh", overflowY: "auto",
        }}>
        {/* Close bar at top */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "#E2E8F0", margin: "0 auto 16px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>
              CONFIRM SIGN-UP
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0F172A" }}>
              {event.title}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#F1F5F9", border: "none", borderRadius: "50%",
            width: 32, height: 32, fontSize: 16, color: "#64748B",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginLeft: 10,
          }}>✕</button>
        </div>

        {/* Event detail card */}
        <div style={{
          background: "#F8FAFC", borderRadius: 12, padding: 16,
          border: `1.5px solid ${tc}22`, marginBottom: 16,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
              background: tc + "18", color: tc, padding: "3px 8px", borderRadius: 4,
            }}>{event.type}</span>
            
          </div>

          {/* Event info rows */}
          {[
            ["📅", "Date", event.date],
            ["🕐", "Time", event.time],
            ["👤", "Slots", `${event.slots - event.filled} of ${event.slots} remaining`],
          ].map(([icon, label, value]) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 0", borderBottom: "1px solid #F1F5F9",
            }}>
              <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{icon}</span>
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, width: 40 }}>{label}</span>
              <span style={{ fontSize: 13, color: "#0F172A", fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Officer signing up */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "#EFF6FF", borderRadius: 10, padding: "10px 14px",
          marginBottom: 16, border: "1px solid #BFDBFE",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "#1D4ED8",
            color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {officer.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{officer.name}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{officer.badge} · {officer.rank}</div>
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#1D4ED8", background: "#DBEAFE", padding: "3px 8px", borderRadius: 4 }}>
            SIGNING UP
          </span>
        </div>

        {/* Grace period notice */}
        {event.postedAt && (Date.now() - event.postedAt) < GRACE_PERIOD_MS && (
          <div style={{
            background: "#F0F9FF", border: "1px solid #BAE6FD",
            borderRadius: 8, padding: "10px 12px", marginBottom: 12,
          }}>
            <div style={{ fontSize: 12, color: "#0369A1", fontWeight: 600, lineHeight: 1.5 }}>
              ⏱ <b>72-Hour Grace Period:</b> This event is within its grace window. Per department policy (Rodney Memo), you may only hold one sign-up during this period.
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px 0", borderRadius: 10,
            border: "1.5px solid #E2E8F0", background: "#fff",
            color: "#64748B", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 2, padding: "13px 0", borderRadius: 10, border: "none",
            background: "#1D4ED8", color: "#fff", fontWeight: 800,
            fontSize: 15, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(29,78,216,0.35)",
            WebkitTapHighlightColor: "transparent",
          }}>
            Confirm Sign-Up ✓
          </button>
        </div>
        {/* Safe area spacer for iPhone home bar */}
        <div style={{ height: "env(safe-area-inset-bottom, 20px)", minHeight: 20 }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANCEL REQUEST MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function CancelRequestModal({ event, onSubmit, onClose, type = "cancel" }) {
  const [reason, setReason] = useState("");
  const reasons = type === "cancel"
    ? ["Family emergency", "Medical appointment", "Personal obligation", "Schedule conflict", "Other"]
    : ["Medical appointment", "Schedule conflict", "Family emergency", "Other"];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 10002, display: "flex", alignItems: "flex-end", justifyContent: "center",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div className="slide-up-in" style={{
        background: "#fff", borderRadius: "16px 16px 0 0",
        padding: "24px 20px 36px", width: "100%", maxWidth: 430,
        boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>
              {type === "cancel" ? "Request Cancellation" : "Request Slot Release"}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{event?.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "#94A3B8", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Select a reason
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {reasons.map(r => (
            <div key={r} onClick={() => setReason(r)} style={{
              padding: "11px 14px", borderRadius: 8, cursor: "pointer",
              border: reason === r ? "1.5px solid #1D4ED8" : "1px solid #E2E8F0",
              background: reason === r ? "#EFF6FF" : "#F8FAFC",
              fontSize: 14, fontWeight: reason === r ? 700 : 500,
              color: reason === r ? "#1D4ED8" : "#374151",
            }}>{r}</div>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#64748B", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Additional details (optional)
        </div>
        <textarea
          value={reason === "Other" ? reason : ""}
          onChange={e => setReason(e.target.value)}
          placeholder="Add any additional details..."
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8,
            border: "1px solid #E2E8F0", fontSize: 13, resize: "none",
            height: 72, boxSizing: "border-box", marginBottom: 14,
            fontFamily: "system-ui, sans-serif",
          }}
        />

        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>
            ⚠️ A Sergeant must approve this request before it takes effect. You remain assigned until approved.
          </div>
        </div>

        <button
          onClick={() => reason && onSubmit(reason)}
          style={{
            width: "100%", padding: "13px 0", borderRadius: 8, border: "none",
            background: reason ? "#1D4ED8" : "#CBD5E1",
            color: "#fff", fontWeight: 700, fontSize: 15, cursor: reason ? "pointer" : "default",
          }}
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERGEANT APPROVALS TAB
// ═══════════════════════════════════════════════════════════════════════════════
function SgtApprovals({ cancelRequests, onApprove, onDeny, officer, darkMode = false }) {
  const [filter, setFilter] = useState("pending");

  const filtered = cancelRequests.filter(r => filter === "all" ? true : r.status === filter);
  const pendingCount = cancelRequests.filter(r => r.status === "pending").length;

  const typeColors = {
    cancel:       { bg: "#FEF2F2", border: "#FECACA", label: "CANCEL REQUEST",  color: "#DC2626" },
    "slot-release": { bg: "#FFF7ED", border: "#FED7AA", label: "SLOT RELEASE",    color: "#EA580C" },
  };

  const statusColors = {
    pending:  { bg: "#FFFBEB", color: "#D97706", label: "PENDING"  },
    approved: { bg: "#F0FDF4", color: "#16A34A", label: "APPROVED" },
    denied:   { bg: "#FEF2F2", color: "#DC2626", label: "DENIED"   },
  };

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ padding: "16px 14px", fontFamily: "'DM Sans', system-ui, sans-serif", background: darkMode ? "#0F172A" : "#F8FAFC", minHeight:"100vh" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
        SERGEANT PORTAL
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginBottom: 2 }}>
        Approvals Queue
      </div>
      <div style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
        Welcome, {officer.name.split(" ")[0]} · {cancelRequests.filter(r => r.status === "pending").length} pending
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "PENDING",  count: cancelRequests.filter(r => r.status === "pending").length,  color: "#D97706", bg: "#FFFBEB" },
          { label: "APPROVED", count: cancelRequests.filter(r => r.status === "approved").length, color: "#16A34A", bg: "#F0FDF4" },
          { label: "DENIED",   count: cancelRequests.filter(r => r.status === "denied").length,   color: "#DC2626", bg: "#FEF2F2" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: s.color, letterSpacing: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #E2E8F0", marginBottom: 14 }}>
        {[["Pending","pending"],["Approved","approved"],["All","all"]].map(([label, value]) => (
          <button key={value} onClick={() => setFilter(value)} style={{
            flex: 1, padding: "9px 0", border: "none", background: "none",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            color: filter === value ? "#1D4ED8" : "#94A3B8",
            borderBottom: filter === value ? "2px solid #1D4ED8" : "2px solid transparent",
            marginBottom: -2,
          }}>
            {label} {value === "pending" && pendingCount > 0 && (
              <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Request cards */}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8", fontSize: 14 }}>
          {filter === "pending" ? "No pending requests 🎉" : "No requests to show"}
        </div>
      )}

      {filtered.map(req => {
        const tc = typeColors[req.type] || typeColors.cancel;
        const sc = statusColors[req.status] || statusColors.pending;
        return (
          <div key={req.id} style={{
            background: "#fff", borderRadius: 12, padding: 14,
            border: "1px solid #E2E8F0", marginBottom: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 0.8,
                  background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                  padding: "3px 7px", borderRadius: 4,
                }}>{tc.label}</span>
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  background: sc.bg, color: sc.color,
                  padding: "3px 7px", borderRadius: 4,
                }}>{sc.label}</span>
              </div>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>{formatTime(req.submittedAt)}</span>
            </div>

            {/* Officer info */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: "#1D4ED8",
                color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {req.officerName.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{req.officerName}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{req.badge} · {req.eventTitle}</div>
              </div>
            </div>

            {/* Reason */}
            <div style={{
              background: "#F8FAFC", borderRadius: 8, padding: "8px 10px",
              fontSize: 13, color: "#475569", marginBottom: req.status === "pending" ? 10 : 0,
              borderLeft: "3px solid #E2E8F0",
            }}>
              <span style={{ fontWeight: 700, color: "#64748B" }}>Reason: </span>{req.reason}
            </div>

            {/* Action buttons — only for pending */}
            {req.status === "pending" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onApprove(req.id)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, border: "none",
                  background: "#16A34A", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>✓ Approve</button>
                <button onClick={() => onDeny(req.id)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 8,
                  border: "1.5px solid #DC2626", background: "#fff",
                  color: "#DC2626", fontWeight: 700, fontSize: 13, cursor: "pointer",
                }}>✕ Deny</button>
              </div>
            )}

            {/* Approved note */}
            {req.status === "approved" && (
              <div style={{ fontSize: 12, color: "#16A34A", fontWeight: 600, marginTop: 6 }}>
                ✓ Approved — waitlist auto-promoted
              </div>
            )}
            {req.status === "denied" && (
              <div style={{ fontSize: 12, color: "#DC2626", fontWeight: 600, marginTop: 6 }}>
                ✕ Denied — officer remains assigned
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// RESCHEDULE EVENT MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function RescheduleModal({ event, onConfirm, onClose, darkMode = false }) {
  const [newDate, setNewDate]   = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd]   = useState("");
  const [reason, setReason]     = useState("");

  const isValid = newDate && timeStart && timeEnd;
  const formattedTime = timeStart && timeEnd ? `${timeStart}-${timeEnd}` : "";

  const bg   = darkMode ? "#1E293B" : "#fff";
  const bg2  = darkMode ? "#0F172A" : "#F8FAFC";
  const text = darkMode ? "#F1F5F9" : "#0F172A";
  const sub  = darkMode ? "#94A3B8" : "#64748B";
  const bdr  = darkMode ? "#334155" : "#E2E8F0";

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 8,
    border: `1.5px solid ${bdr}`, fontSize: 14,
    background: bg2, color: text,
    boxSizing: "border-box", fontFamily: "'DM Sans', system-ui, sans-serif",
    outline: "none",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
        zIndex: 10002, display: "flex", alignItems: "flex-start", justifyContent: "center",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
      <div
        className="slide-down-in"
        onClick={e => e.stopPropagation()}
        style={{
          background: bg, borderRadius: "0 0 20px 20px",
          padding: "20px 20px 28px", width: "100%", maxWidth: 430,
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          maxHeight: "90vh", overflowY: "auto",
        }}>
        {/* Handle bar */}
        <div style={{ width: 40, height: 4, borderRadius: 99, background: bdr, margin: "0 auto 16px" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#D97706", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>RESCHEDULE EVENT</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: text }}>{event.title}</div>
            <div style={{ fontSize: 12, color: sub, marginTop: 2 }}>
              Currently: {event.date} · {event.time}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: sub, cursor: "pointer", padding: 4 }}>✕</button>
        </div>

        {/* Rodney Memo notice */}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#92400E", fontWeight: 600, lineHeight: 1.6 }}>
            📋 Per Rodney Memo: Rescheduling notifies all confirmed officers first and starts a fresh 72-hour grace period.
          </div>
        </div>

        {/* New Date */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: sub, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            New Date *
          </label>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* New Time */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: sub, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            New Time *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: sub, fontWeight: 600, marginBottom: 4 }}>START</div>
              <input
                type="time"
                value={timeStart}
                onChange={e => setTimeStart(e.target.value)}
                style={{ ...inputStyle, textAlign: "center", fontSize: 13, fontWeight: 700, padding: "10px 4px" }}
              />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: sub, flexShrink: 0, marginTop: 18 }}>to</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: sub, fontWeight: 600, marginBottom: 4 }}>END</div>
              <input
                type="time"
                value={timeEnd}
                onChange={e => setTimeEnd(e.target.value)}
                style={{ ...inputStyle, textAlign: "center", fontSize: 13, fontWeight: 700, padding: "10px 4px" }}
              />
            </div>
          </div>
          {timeStart && timeEnd && (
            <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 5 }}>
              ✓ New shift: {timeStart}–{timeEnd}
            </div>
          )}
        </div>

        {/* Reason */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: sub, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            Reason for Reschedule
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Optional — will be logged in the audit trail and included in officer notification..."
            style={{ ...inputStyle, height: 80, resize: "none" }}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px 0", borderRadius: 10,
            border: `1.5px solid ${bdr}`, background: bg,
            color: sub, fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            Cancel
          </button>
          <button
            onClick={() => isValid && onConfirm(
              new Date(newDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              formattedTime,
              reason
            )}
            disabled={!isValid}
            style={{
              flex: 2, padding: "13px 0", borderRadius: 10, border: "none",
              background: isValid ? "#D97706" : "#CBD5E1",
              color: "#fff", fontWeight: 800, fontSize: 15,
              cursor: isValid ? "pointer" : "not-allowed",
              WebkitTapHighlightColor: "transparent",
            }}>
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPERVISOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

const SIGNABLE_RANKS = ["Campus Security Assistant","CPO","Corporal","Sergeant","Specialist"];
const RANK_ORDER = { "Campus Security Assistant":0,"CPO":1,"Corporal":2,"Sergeant":3,"Specialist":4,"Lieutenant":5,"Director of Public Safety":6 };
const LOCATIONS = [
  { building: "135 E. 22nd Street (Admin Building)", spaces: [
    "Eli and Claire Mason Seminar Room 301",
    "Eli and Claire Mason Seminar Room 308",
  ]},
  { building: "Athletics (55 Lexington Ave)", spaces: [
    "Auxiliary Gym",
    "Main Gym",
    "Pool",
    "Racquetball",
  ]},
  { building: "Baruch Performing Arts Center (55 Lexington Ave)", spaces: [
    "Dance Studio",
    "Engleman Recital Hall",
    "Nagelberg Theatre",
  ]},
  { building: "Clivner Field Plaza (151 Bernard Baruch Way)", spaces: [
    "Clivner Field Plaza",
  ]},
  { building: "Lawrence and Eris Field Building (17 Lexington Ave)", spaces: [
    "Bernie West Theatre",
    "Mason Hall - Orchestra",
    "Mason Hall - Orchestra & Balcony",
    "Skylight Room",
  ]},
  { building: "Student Life (55 Lexington Ave)", spaces: [
    "Multi-Purpose Room 1-107",
    "Multi-Purpose Room 1-108",
    "Multi-Purpose Room 1-109",
  ]},
  { building: "Subotnick Financial Services Center (151 E 25th St)", spaces: [
    "Development Classroom - Computer Lab",
    "Seminar Room - Classroom",
    "Trading Floor",
  ]},
  { building: "Zicklin Executive Programs (55 Lexington Ave)", spaces: [
    "Room 14-250",
  ]},
];
const EVENT_TYPES_POST = ["COMMENCEMENT","ATHLETICS","SPECIAL","FIRE WATCH","STUDENT LIFE","PATROL","BPAC","OTHER"];

function SupervisorDashboard({ officer, events, setEvents, confirmed, setConfirmed, notifications, addNotif, showToast, sendEmail, sendEmailToAll, cancelRequests, approveCancelRequest, denyCancelRequest, postEvent, rescheduleEvent, darkMode = false }) {
  const [tab, setTab] = useState("events");
  const [showPostForm, setShowPostForm] = useState(false);
  const [showFireWatchForm, setShowFireWatchForm] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(null); // event object
  const [auditLog, setAuditLog] = useState([
    { id:1, actor:"Dev Mehta", action:"Posted Spring Commencement", timestamp: Date.now()-86400000*2 },
    { id:2, actor:"Sandra Williams", action:"Approved cancel request — James Carter", timestamp: Date.now()-3600000*5 },
    { id:3, actor:"Marcus Brown", action:"Override issued — Lisa Chen — Alumni Gala", timestamp: Date.now()-3600000*2 },
  ]);

  const canOverride = RANK_ORDER[officer.rank] >= 5;
  const canPostFireWatch = [2,4,5,6].includes(RANK_ORDER[officer.rank]);

  const logAction = (action) => {
    setAuditLog(prev => [{ id: Date.now(), actor: officer.name, action, timestamp: Date.now() }, ...prev]);
  };

  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff/60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins/60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs/24)}d ago`;
  };

  const tabs = [
    ["events",   "All Events"],
    ["waitlist", "Waitlist"],
    ["approvals","Approvals"],
    ["reports",  "Reports"],
    ...(canOverride ? [["overrides","Overrides"]] : []),
  ];

  const pendingCount = cancelRequests.filter(r => r.status === "pending").length;

  return (
    <div style={{ padding:"16px 14px", fontFamily:"'DM Sans', system-ui, sans-serif", background: darkMode ? "#0F172A" : "#F8FAFC", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>SUPERVISOR PORTAL</div>
      <div style={{ fontSize:22, fontWeight:900, color: darkMode ? "#F1F5F9" : "#0F172A", marginBottom:2 }}>Admin Dashboard</div>
      <div style={{ fontSize:13, color:"#64748B", marginBottom:16 }}>
        {officer.name} · {officer.rank}
      </div>

      {/* Post buttons */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <button onClick={() => { setShowPostForm(s => !s); setShowFireWatchForm(false); }} style={{
          flex:1, padding:"11px 0", borderRadius:8, border:"none",
          background: showPostForm ? "#1D4ED8" : "#1D4ED8",
          color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
        }}>+ Post New Event</button>
        {canPostFireWatch && (
          <button onClick={() => { setShowFireWatchForm(s => !s); setShowPostForm(false); }} style={{
            flex:1, padding:"11px 0", borderRadius:8, border:"none",
            background: showFireWatchForm ? "#DC2626" : "#DC2626",
            color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
          }}>+ Post Fire Watch</button>
        )}
      </div>

      {/* Post Event Form */}
      {showPostForm && <PostEventForm officer={officer} onPost={(evArray) => {
        evArray.forEach(ev => postEvent(ev));
        logAction(`Posted ${evArray.length} event${evArray.length > 1 ? "s" : ""}: ${evArray.map(e => e.title).join(", ")}`);
        setShowPostForm(false);
        showToast(`${evArray.length} event${evArray.length > 1 ? "s" : ""} posted! Officers notified.`, "success");
      }} onClose={() => setShowPostForm(false)} />}

      {/* Fire Watch Form */}
      {showFireWatchForm && <FireWatchForm officer={officer} onPost={(shifts) => { shifts.forEach(s => postEvent(s)); logAction(`Posted Fire Watch: ${shifts.length} shifts`); setShowFireWatchForm(false); showToast(`${shifts.length} Fire Watch shifts posted!`, "success"); }} onClose={() => setShowFireWatchForm(false)} />}

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"2px solid #E2E8F0", marginBottom:14 }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex:1, padding:"9px 0", border:"none", background:"none",
            fontWeight:700, fontSize:11, cursor:"pointer",
            color: tab===id ? "#1D4ED8" : "#94A3B8",
            borderBottom: tab===id ? "2px solid #1D4ED8" : "2px solid transparent",
            marginBottom:-2, position:"relative",
          }}>
            {label}
            {id==="approvals" && pendingCount > 0 && (
              <span style={{ background:"#EF4444", color:"#fff", borderRadius:99, padding:"1px 5px", fontSize:9, fontWeight:800, marginLeft:4 }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* All Events Tab */}
      {tab === "events" && (
        <div>
          {events.map(ev => {
            const graceActive = ev.postedAt && (Date.now() - ev.postedAt) < GRACE_PERIOD_MS;
            const graceHrs = graceActive ? Math.ceil((GRACE_PERIOD_MS - (Date.now() - ev.postedAt)) / 3600000) : 0;
            return (
              <div key={ev.id} style={{ background: darkMode ? "#1E293B" : "#fff", borderRadius:10, padding:14, border:`1px solid ${darkMode ? "#334155" : "#E2E8F0"}`, marginBottom:10, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14, color:"#0F172A" }}>{ev.title}</div>
                    <div style={{ fontSize:12, color:"#64748B", marginTop:2 }}>{ev.date} · {ev.time} · {ev.type}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    <Badge variant={ev.filled >= ev.slots ? "success" : "primary"}>
                      {ev.filled}/{ev.slots} filled
                    </Badge>
                    {graceActive && (
                      <span style={{ fontSize:9, fontWeight:700, color:"#0369A1", background:"#F0F9FF", padding:"2px 6px", borderRadius:4 }}>
                        ⏱ Grace: {graceHrs}h left
                      </span>
                    )}
                    {(ev.armedSlots||0) > 0 && (
                      <span style={{ fontSize:9, fontWeight:700, color:"#DC2626", background:"#FEF2F2", padding:"2px 6px", borderRadius:4 }}>
                        {ev.armedSlots} Armed
                      </span>
                    )}
                  </div>
                </div>
                {/* Slot bar */}
                <div style={{ height:5, background:"#F1F5F9", borderRadius:99, marginBottom:8 }}>
                  <div style={{ height:"100%", borderRadius:99, width:`${Math.min(100,(ev.filled/ev.slots)*100)}%`, background: ev.filled>=ev.slots ? "#10B981" : "#1D4ED8" }} />
                </div>
                {/* Waitlist count */}
                {ev.waitQueue?.length > 0 && (
                  <div style={{ fontSize:11, color:"#7C3AED", fontWeight:600 }}>
                    {ev.waitQueue.length} officer{ev.waitQueue.length > 1 ? "s" : ""} on waitlist
                  </div>
                )}
                {/* Supervisor actions */}
                <div style={{ display:"flex", gap:8, marginTop:10 }}>
                  <button onClick={() => {
                    setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, status:"CANCELED" } : e));
                    logAction(`Canceled event: ${ev.title}`);
                    addNotif(`Event canceled: ${ev.title}.`, "warn");
                    showToast("Event canceled. Confirmed officers notified.", "warn");
                  }} style={{ padding:"7px 12px", borderRadius:6, border:"1.5px solid #EF4444", background:"#fff", color:"#EF4444", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                    Cancel Event
                  </button>

                  <button onClick={() => setRescheduleModal(ev)} style={{ padding:"7px 12px", borderRadius:6, border:"1.5px solid #F59E0B", background:"#fff", color:"#D97706", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                    Reschedule
                  </button>
                  {canOverride && (
                    <button onClick={() => {
                      const name = prompt("Officer name to assign:");
                      const reason = prompt("Override reason (required for audit log):");
                      if (name && reason) {
                        logAction(`OVERRIDE: Assigned ${name} to ${ev.title} — Reason: ${reason}`);
                        addNotif(`Override issued by ${officer.name}: ${name} assigned to ${ev.title}.`, "warn");
                        showToast("Override logged and applied.", "info");
                      }
                    }} style={{ padding:"7px 12px", borderRadius:6, border:"1.5px solid #7C3AED", background:"#fff", color:"#7C3AED", fontWeight:700, fontSize:11, cursor:"pointer" }}>
                      Override
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Waitlist Tab */}
      {tab === "waitlist" && (
        <div>
          <div style={{ fontSize:13, color:"#64748B", marginBottom:12 }}>All officers currently in waitlist queues — ordered by timestamp.</div>
          {events.filter(ev => ev.waitQueue?.length > 0).length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", color:"#94A3B8", fontSize:14 }}>No officers currently waitlisted.</div>
          )}
          {events.filter(ev => ev.waitQueue?.length > 0).map(ev => (
            <div key={ev.id} style={{ background:"#fff", borderRadius:10, padding:14, border:"1px solid #E2E8F0", marginBottom:10 }}>
              <div style={{ fontWeight:800, fontSize:13, color:"#0F172A", marginBottom:10 }}>{ev.title}</div>
              {[...ev.waitQueue].sort((a,b) => a.joinedAt - b.joinedAt).map((w, idx) => {
                const off = OFFICERS.find(o => o.id === w.officerId);
                return (
                  <div key={w.officerId} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:"1px solid #F1F5F9" }}>
                    <span style={{ fontSize:12, fontWeight:800, color:"#1D4ED8", width:20 }}>#{idx+1}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700 }}>{off?.name || `Officer ${w.officerId}`}</div>
                      <div style={{ fontSize:11, color:"#94A3B8" }}>{off?.badge} · Joined {formatTime(w.joinedAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Approvals Tab */}
      {tab === "approvals" && (
        <div>
          {cancelRequests.filter(r => r.status === "pending").length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 20px", color:"#94A3B8", fontSize:14 }}>No pending requests. 🎉</div>
          )}
          {cancelRequests.filter(r => r.status === "pending").map(req => (
            <div key={req.id} style={{ background:"#fff", borderRadius:10, padding:14, border:"1px solid #E2E8F0", marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:9, fontWeight:800, color: req.type==="cancel" ? "#DC2626" : "#EA580C", background: req.type==="cancel" ? "#FEF2F2" : "#FFF7ED", padding:"3px 7px", borderRadius:4 }}>
                  {req.type === "cancel" ? "CANCEL REQUEST" : "SLOT RELEASE"}
                </span>
                <span style={{ fontSize:11, color:"#94A3B8" }}>{formatTime(req.submittedAt)}</span>
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:"#0F172A", marginBottom:2 }}>{req.officerName}</div>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:6 }}>{req.badge} · {req.eventTitle}</div>
              <div style={{ fontSize:12, color:"#475569", background:"#F8FAFC", padding:"8px 10px", borderRadius:6, marginBottom:10, borderLeft:"3px solid #E2E8F0" }}>
                <b>Reason:</b> {req.reason}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Button variant="success" fullWidth onClick={() => { approveCancelRequest(req.id); logAction(`Approved ${req.type} for ${req.officerName} — ${req.eventTitle}`); }} style={{ flex:1 }}>✓ Approve</Button>
                <Button variant="danger" fullWidth onClick={() => { denyCancelRequest(req.id); logAction(`Denied ${req.type} for ${req.officerName} — ${req.eventTitle}`); }} style={{ flex:1, background:DS.white, color:DS.danger, border:`1.5px solid ${DS.danger}` }}>✕ Deny</Button>
              </div>
            </div>
          ))}
          {/* Show approved/denied history */}
          {cancelRequests.filter(r => r.status !== "pending").length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#94A3B8", letterSpacing:0.8, marginBottom:8 }}>HISTORY</div>
              {cancelRequests.filter(r => r.status !== "pending").map(req => (
                <div key={req.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 10px", background:"#F8FAFC", borderRadius:8, marginBottom:6 }}>
                  <span style={{ fontSize:12, color:"#374151" }}>{req.officerName} — {req.eventTitle}</span>
                  <span style={{ fontSize:11, fontWeight:700, color: req.status==="approved" ? "#16A34A" : "#DC2626" }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {tab === "reports" && (
        <div>
          <div style={{ fontSize:13, color:"#64748B", marginBottom:14 }}>Export department data as CSV files.</div>
          {[
            ["Sign-up Records",  "All officer sign-ups with timestamps"],
            ["Cancel Requests",  "All cancellations and slot releases"],
            ["Audit Trail",      "Every supervisor action logged"],
            ["Override Log",     "All override actions with justifications"],
            ["Waitlist History", "Full waitlist queue records"],
          ].map(([label, desc]) => (
            <div key={label} style={{ background:"#fff", borderRadius:10, padding:"12px 14px", border:"1px solid #E2E8F0", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13 }}>{label}</div>
                <div style={{ fontSize:11, color:"#94A3B8" }}>{desc}</div>
              </div>
              <button onClick={() => showToast(`${label} export — available once connected to backend database.`, "info")} style={{
                padding:"7px 14px", borderRadius:6, border:"none",
                background:"#1D4ED8", color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer",
              }}>Export CSV</button>
            </div>
          ))}
          {/* Audit log preview */}
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#94A3B8", letterSpacing:0.8, marginBottom:8 }}>RECENT AUDIT LOG</div>
            {auditLog.slice(0,10).map(entry => (
              <div key={entry.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"8px 10px", borderBottom:"1px solid #F1F5F9" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{entry.action}</div>
                  <div style={{ fontSize:10, color:"#94A3B8" }}>by {entry.actor}</div>
                </div>
                <div style={{ fontSize:10, color:"#94A3B8", flexShrink:0, marginLeft:8 }}>{formatTime(entry.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <RescheduleModal
          event={rescheduleModal}
          darkMode={darkMode}
          onConfirm={(newDate, newTime, reason) => {
            rescheduleEvent(rescheduleModal.id, newDate, newTime);
            logAction(`Rescheduled "${rescheduleModal.title}" to ${newDate} ${newTime}${reason ? ` — Reason: ${reason}` : ""}`);
            setRescheduleModal(null);
          }}
          onClose={() => setRescheduleModal(null)}
        />
      )}

      {/* Overrides Tab — Lieutenant+ only */}
      {tab === "overrides" && canOverride && (
        <div>
          <div style={{ fontSize:13, color:"#64748B", marginBottom:12 }}>Issue a manual assignment override. Every override is permanently logged with your badge number and reason.</div>
          <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 12px", marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#B91C1C", fontWeight:600 }}>⚠️ Overrides bypass the fairness system. Use only when operationally necessary. All overrides are visible to the Director.</div>
          </div>
          {auditLog.filter(e => e.action.startsWith("OVERRIDE")).map(entry => (
            <div key={entry.id} style={{ background:"#FEF2F2", borderRadius:8, padding:"10px 12px", marginBottom:8, border:"1px solid #FECACA" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#B91C1C" }}>{entry.action}</div>
              <div style={{ fontSize:10, color:"#94A3B8", marginTop:2 }}>by {entry.actor} · {formatTime(entry.timestamp)}</div>
            </div>
          ))}
          {auditLog.filter(e => e.action.startsWith("OVERRIDE")).length === 0 && (
            <div style={{ textAlign:"center", padding:"30px 20px", color:"#94A3B8", fontSize:14 }}>No overrides issued.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Post Event Form ───────────────────────────────────────────────────────────
function PostEventForm({ officer, onPost, onClose }) {
  const [form, setForm] = useState({
    title:"", type:"SPECIAL", date:"", time:"", timeStart:"", timeEnd:"", location:"", notes:"",
    gracePeriodActive: false, armedSlots: 0, simpleSlots: 1,
    rankSlots: { "Campus Security Assistant":0, "CPO":0, "Corporal":0, "Sergeant":0, "Specialist":0 },
  });
  const [queue, setQueue] = useState([]);
  const [slotMode, setSlotMode] = useState("simple"); // "simple" | "byRank"

  const totalSlots = slotMode === "simple"
    ? (form.simpleSlots || 1)
    : Object.values(form.rankSlots).reduce((a,b) => a+b, 0);
  const isValid = form.title && form.date && form.timeStart && form.timeEnd && totalSlots > 0;

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const resetForm = () => {
    setForm({
      title:"", type:"SPECIAL", date:"", time:"", timeStart:"", timeEnd:"", location:"", notes:"",
      gracePeriodActive: false, armedSlots: 0, simpleSlots: 1,
      rankSlots: { "Campus Security Assistant":0, "CPO":0, "Corporal":0, "Sergeant":0, "Specialist":0 },
    });
    setSlotMode("simple");
  };

  // Build event object from current form — compute formattedTime here to avoid stale closure
  const buildEvent = () => {
    const formattedTime = form.timeStart && form.timeEnd ? `${form.timeStart}-${form.timeEnd}` : "";
    return {
      title: form.title, type: form.type, date: form.date, time: formattedTime,
      location: form.location, notes: form.notes, hold: false,
      slots: totalSlots,
      rankSlots: slotMode === "byRank" ? { ...form.rankSlots } : {},
      slotMode,
      armedSlots: form.armedSlots || 0,
      status: form.status || "OPEN",
    };
  };

  // Add current form to queue
  const addToQueue = () => {
    if (!isValid) return;
    setQueue(prev => [...prev, { ...buildEvent(), queueId: Date.now() }]);
    resetForm();
  };

  // Remove from queue
  const removeFromQueue = (queueId) => {
    setQueue(prev => prev.filter(e => e.queueId !== queueId));
  };

  // Post single event now
  const postNow = () => {
    if (!isValid) return;
    onPost([{ ...buildEvent(), postedAt: Date.now() }]);
  };

  // Post all queued events at once — shared postedAt per Rodney Memo
  const postAll = () => {
    const sharedPostedAt = Date.now();
    const allEvents = [
      ...(isValid ? [{ ...buildEvent(), postedAt: sharedPostedAt }] : []),
      ...queue.map(e => ({ ...e, postedAt: sharedPostedAt })),
    ];
    if (allEvents.length === 0) return;
    onPost(allEvents);
  };

  const inputStyle = {
    width:"100%", padding:"10px 12px", borderRadius:8,
    border:"1px solid #E2E8F0", fontSize:13, boxSizing:"border-box",
    fontFamily:"system-ui, sans-serif", background:"#F8FAFC",
  };
  const labelStyle = { fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:5 };

  return (
    <div className="scale-in" style={{ background:"#fff", borderRadius:12, padding:18, border:"1.5px solid #1D4ED8", marginBottom:16, boxShadow:"0 4px 20px rgba(29,78,216,0.1)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:"#1D4ED8" }}>Post New Event</div>
          {queue.length > 0 && (
            <div style={{ fontSize:11, color:"#059669", fontWeight:700, marginTop:2 }}>
              {queue.length} event{queue.length > 1 ? "s" : ""} in queue
            </div>
          )}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18, color:"#94A3B8", cursor:"pointer" }}>✕</button>
      </div>

      {/* Rodney Memo guidance */}
      <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:8, padding:"10px 12px", marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#92400E", marginBottom:3 }}>📋 Per Rodney Memo Protocol</div>
        <div style={{ fontSize:11, color:"#78350F", lineHeight:1.6 }}>
          Use <b>Add to Queue</b> to stage multiple events, then tap <b>Post All</b> to publish them together with one shared timestamp — counting as one sheet. Officers may only sign up for one slot across the entire posting during the 72-hour grace period.
        </div>
      </div>

      {/* Queue panel */}
      {queue.length > 0 && (
        <div style={{ background:"#F0FDF4", border:"1.5px solid #A7F3D0", borderRadius:10, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#059669", letterSpacing:0.8, marginBottom:10 }}>
            📋 POSTING QUEUE — {queue.length} EVENT{queue.length > 1 ? "S" : ""}
          </div>
          {queue.map((ev, idx) => (
            <div key={ev.queueId} style={{
              display:"flex", alignItems:"center", gap:10,
              background:"#fff", borderRadius:8, padding:"9px 12px",
              marginBottom:6, border:"1px solid #D1FAE5",
            }}>
              <span style={{ fontSize:12, fontWeight:800, color:"#059669", width:18 }}>#{idx+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#0F172A" }}>{ev.title}</div>
                <div style={{ fontSize:11, color:"#64748B" }}>{ev.date} · {ev.time} · {ev.slots} slot{ev.slots > 1 ? "s" : ""} · {ev.type}</div>
              </div>
              <button onClick={() => removeFromQueue(ev.queueId)} style={{
                background:"none", border:"none", color:"#EF4444",
                fontSize:16, cursor:"pointer", padding:"0 4px", flexShrink:0,
              }}>✕</button>
            </div>
          ))}
          {/* Post All button */}
          <button onClick={postAll} style={{
            width:"100%", marginTop:8, padding:"12px 0", borderRadius:8, border:"none",
            background:"#059669", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer",
            boxShadow:"0 4px 12px rgba(5,150,105,0.3)",
          }}>
            🚀 Post All {isValid ? queue.length + 1 : queue.length} Events & Notify Officers
          </button>
        </div>
      )}

      {/* Form fields */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={labelStyle}>Event Title *</label>
          <input value={form.title} onChange={e=>update("title",e.target.value)} placeholder="e.g. Spring Commencement" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Event Type *</label>
          <select value={form.type} onChange={e=>update("type",e.target.value)} style={inputStyle}>
            {EVENT_TYPES_POST.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status||"OPEN"} onChange={e=>update("status",e.target.value)} style={inputStyle}>
            <option value="OPEN">Open</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Date *</label>
          <input type="date" value={form.date} onChange={e=>update("date",e.target.value)} style={inputStyle} />
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={labelStyle}>Time *</label>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600, marginBottom:4 }}>START</div>
              <input
                type="time"
                value={form.timeStart||""}
                onChange={e => update("timeStart", e.target.value)}
                style={{ ...inputStyle, textAlign:"center", fontSize:13, fontWeight:700, color:"#0F172A", padding:"10px 4px" }}
              />
            </div>
            <span style={{ fontSize:11, fontWeight:700, color:"#94A3B8", flexShrink:0, marginTop:18 }}>to</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600, marginBottom:4 }}>END</div>
              <input
                type="time"
                value={form.timeEnd||""}
                onChange={e => update("timeEnd", e.target.value)}
                style={{ ...inputStyle, textAlign:"center", fontSize:13, fontWeight:700, color:"#0F172A", padding:"10px 4px" }}
              />
            </div>
          </div>
          {form.timeStart && form.timeEnd && (
            <div style={{ fontSize:11, color:"#059669", fontWeight:700, marginTop:6 }}>
              ✓ Shift: {form.timeStart}–{form.timeEnd}
            </div>
          )}
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={labelStyle}>Location</label>
          <select value={form.location} onChange={e=>update("location",e.target.value)} style={inputStyle}>
            <option value="">Select location...</option>
            {LOCATIONS.map(grp => (
              grp.spaces.length === 1
                ? <option key={grp.spaces[0]} value={`${grp.building} — ${grp.spaces[0]}`}>{grp.building}</option>
                : <optgroup key={grp.building} label={grp.building}>
                    {grp.spaces.map(s => (
                      <option key={s} value={`${grp.building} — ${s}`}>{s}</option>
                    ))}
                  </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Officers Needed — mode toggle */}
      <div style={{ marginBottom:12 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <label style={labelStyle}>Officers Needed *</label>
          {/* Mode toggle */}
          <div style={{ display:"flex", gap:0, border:"1px solid #E2E8F0", borderRadius:8, overflow:"hidden" }}>
            {[["simple","Any Rank"],["byRank","By Rank"]].map(([mode, label]) => (
              <button key={mode} onClick={() => setSlotMode(mode)} style={{
                padding:"5px 12px", border:"none", fontSize:11, fontWeight:700, cursor:"pointer",
                background: slotMode === mode ? "#1D4ED8" : "#F8FAFC",
                color: slotMode === mode ? "#fff" : "#64748B",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Simple mode — just a number */}
        {slotMode === "simple" && (
          <div style={{ border:"1px solid #E2E8F0", borderRadius:8, overflow:"hidden" }}>
            <div style={{ padding:"12px", background:"#F8FAFC", borderBottom:"1px solid #E2E8F0" }}>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:8 }}>How many officers do you need? Any rank can fill these slots.</div>
              <div style={{ display:"flex", alignItems:"center", gap:0, justifyContent:"center" }}>
                <button onClick={() => update("simpleSlots", Math.max(1,(form.simpleSlots||1)-1))}
                  style={{ width:40, height:40, borderRadius:"8px 0 0 8px", border:"1px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:20, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                <div style={{ width:60, height:40, border:"1px solid #E2E8F0", borderLeft:"none", borderRight:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:900, color:"#1D4ED8", background:"#fff" }}>
                  {form.simpleSlots||1}
                </div>
                <button onClick={() => update("simpleSlots", Math.min(20,(form.simpleSlots||1)+1))}
                  style={{ width:40, height:40, borderRadius:"0 8px 8px 0", border:"1px solid #E2E8F0", background:"#1D4ED8", color:"#fff", fontSize:20, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
              </div>
              <div style={{ textAlign:"center", marginTop:6, fontSize:11, color:"#64748B" }}>
                {form.simpleSlots||1} officer{(form.simpleSlots||1) > 1 ? "s" : ""} — any rank
              </div>
            </div>
          </div>
        )}

        {/* By Rank mode — quota builder */}
        {slotMode === "byRank" && (
          <div style={{ border:"1px solid #E2E8F0", borderRadius:8, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 100px", padding:"7px 12px", background:"#F8FAFC", borderBottom:"1px solid #E2E8F0" }}>
              <span style={{ fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:0.8 }}>RANK</span>
              <span style={{ fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:0.8, textAlign:"center" }}>SLOTS</span>
            </div>
            {SIGNABLE_RANKS.map(rank => (
              <div key={rank} style={{ display:"grid", gridTemplateColumns:"1fr 100px", padding:"8px 12px", borderBottom:"1px solid #F1F5F9", alignItems:"center" }}>
                <span style={{ fontSize:13, color:"#374151" }}>{rank}</span>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0 }}>
                  <button onClick={() => update("rankSlots", { ...form.rankSlots, [rank]: Math.max(0,(form.rankSlots[rank]||0)-1) })}
                    style={{ width:28, height:28, borderRadius:"6px 0 0 6px", border:"1px solid #E2E8F0", background:"#F8FAFC", color:"#374151", fontSize:16, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                  <div style={{ width:32, height:28, border:"1px solid #E2E8F0", borderLeft:"none", borderRight:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#0F172A", background:"#fff" }}>
                    {form.rankSlots[rank]||0}
                  </div>
                  <button onClick={() => update("rankSlots", { ...form.rankSlots, [rank]: Math.min(10,(form.rankSlots[rank]||0)+1) })}
                    style={{ width:28, height:28, borderRadius:"0 6px 6px 0", border:"1px solid #E2E8F0", background:"#1D4ED8", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                </div>
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 100px", padding:"8px 12px", background:"#EFF6FF", alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#1D4ED8" }}>Total Slots</span>
              <span style={{ fontSize:15, fontWeight:900, color:"#1D4ED8", textAlign:"center", display:"block" }}>{totalSlots}</span>
            </div>
          </div>
        )}

        {/* Armed Officer row — always shown below either mode */}
        <div style={{ border:"1px solid #FECACA", borderRadius:8, overflow:"hidden", marginTop:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 100px", padding:"8px 12px", alignItems:"center", background:"#FEF2F2" }}>
            <div>
              <span style={{ fontSize:13, color:"#DC2626", fontWeight:700 }}>Armed Officer</span>
              <span style={{ fontSize:10, color:"#94A3B8", display:"block", marginTop:1 }}>Only armed officers can fill these slots</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0 }}>
              <button onClick={() => update("armedSlots", Math.max(0,(form.armedSlots||0)-1))}
                style={{ width:24, height:26, borderRadius:"5px 0 0 5px", border:"1px solid #FECACA", background:"#FEF2F2", color:"#DC2626", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
              <div style={{ width:28, height:26, border:"1px solid #FECACA", borderLeft:"none", borderRight:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#DC2626", background:"#fff" }}>
                {form.armedSlots||0}
              </div>
              <button onClick={() => update("armedSlots", Math.min(10,(form.armedSlots||0)+1))}
                style={{ width:24, height:26, borderRadius:"0 5px 5px 0", border:"1px solid #FECACA", background:"#DC2626", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
            </div>
          </div>
        </div>

        {/* Grand total */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:"#EFF6FF", borderRadius:8, marginTop:8, border:"1px solid #BFDBFE" }}>
          <span style={{ fontSize:12, fontWeight:700, color:"#1D4ED8" }}>Total Slots</span>
          <span style={{ fontSize:16, fontWeight:900, color:"#1D4ED8" }}>{totalSlots + (form.armedSlots||0)}</span>
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
        {[
          ["gracePeriodActive","Activate 72h Grace Period now","Limits each officer to one signup per the Rodney Memo"],
        ].map(([key, label, desc]) => (
          <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:DS.slate50, borderRadius:DS.radiusMd }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:DS.slate900 }}>{label}</div>
              <div style={{ fontSize:11, color:DS.slate500 }}>{desc}</div>
            </div>
            <Toggle checked={form[key]} onChange={v => update(key, v)} />
          </div>
        ))}
      </div>

      {/* Notes */}
      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>Supervisor Notes</label>
        <textarea value={form.notes} onChange={e=>update("notes",e.target.value)} placeholder="Any additional instructions for officers..." style={{ ...inputStyle, height:72, resize:"none" }} />
      </div>

      {/* Action buttons */}
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={addToQueue} disabled={!isValid} style={{
          flex:1, padding:"12px 0", borderRadius:8,
          border: isValid ? "1.5px solid #1D4ED8" : "1.5px solid #CBD5E1",
          background:"#fff",
          color: isValid ? "#1D4ED8" : "#94A3B8",
          fontWeight:700, fontSize:13,
          cursor: isValid ? "pointer" : "default",
        }}>
          + Add to Queue
        </button>
        <button onClick={postNow} disabled={!isValid} style={{
          flex:1, padding:"12px 0", borderRadius:8, border:"none",
          background: isValid ? "#1D4ED8" : "#CBD5E1",
          color:"#fff", fontWeight:700, fontSize:13,
          cursor: isValid ? "pointer" : "default",
        }}>
          Post Now
        </button>
      </div>
    </div>
  );
}

// ── Fire Watch Form ───────────────────────────────────────────────────────────
function FireWatchForm({ officer, onPost, onClose }) {
  const FIRE_WATCH_LOCATION = "VC Building (17 Lex)";
  const [weekStart, setWeekStart] = useState(""); // Monday date input
  const [slots, setSlots] = useState({
    "Sat Overnight (0000-0800)": 1,
    "Sat Day (0800-1600)":       1,
    "Sat Evening (1600-0000)":   1,
    "Sun Overnight (0000-0800)": 1,
    "Sun Day (0800-1600)":       1,
    "Sun Evening (1600-0000)":   1,
    "Mon-Fri Day (0800-1600)":   2,
  });
  const [gracePeriodActive, setGracePeriodActive] = useState(true);

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Map each shift to a day offset from the Monday (0=Mon, 5=Sat, 6=Sun)
  const shiftDayOffset = {
    "Sat Overnight (0000-0800)": 5,
    "Sat Day (0800-1600)":       5,
    "Sat Evening (1600-0000)":   5,
    "Sun Overnight (0000-0800)": 6,
    "Sun Day (0800-1600)":       6,
    "Sun Evening (1600-0000)":   6,
    "Mon-Fri Day (0800-1600)":   0, // starts Monday
  };

  // Calculate actual date for a shift given the Monday start
  const getShiftDate = (shift) => {
    if (!weekStart) return null;
    const monday = new Date(weekStart + "T00:00:00");
    const offset = shiftDayOffset[shift] ?? 0;
    const shiftDate = new Date(monday);
    shiftDate.setDate(monday.getDate() + offset);
    return `${MONTH_NAMES[shiftDate.getMonth()]} ${shiftDate.getDate()}`;
  };

  // Get Monday of current week as default
  const getThisMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    today.setDate(today.getDate() + diff);
    return today.toISOString().split("T")[0];
  };

  const inputStyle = { width:50, textAlign:"center", padding:"5px 4px", fontSize:13, fontWeight:700, borderRadius:6, border:"1px solid #E2E8F0", margin:"0 auto", display:"block" };
  const labelStyle = { fontSize:10, fontWeight:700, color:"#64748B", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:5 };

  const activeShifts = Object.entries(slots).filter(([,count]) => count > 0);
  const isValid = weekStart && activeShifts.length > 0;

  return (
    <div style={{ background:"#fff", borderRadius:12, padding:18, border:"1.5px solid #DC2626", marginBottom:16, boxShadow:"0 4px 20px rgba(220,38,38,0.1)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div>
          <div style={{ fontSize:14, fontWeight:800, color:"#DC2626" }}>Post Fire Watch</div>
          <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>{FIRE_WATCH_LOCATION}</div>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18, color:"#94A3B8", cursor:"pointer" }}>✕</button>
      </div>

      <div style={{ fontSize:11, color:"#92400E", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"8px 12px", marginBottom:14, fontWeight:600 }}>
        🔥 Each shift posts as a separate event with its correct date. Officers pick the specific shift they want.
      </div>

      {/* Week picker */}
      <div style={{ marginBottom:14 }}>
        <label style={labelStyle}>Select Week (Starting Monday) *</label>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <input
            type="date"
            value={weekStart}
            onChange={e => {
              // Snap to Monday if a non-Monday is selected
              const d = new Date(e.target.value + "T00:00:00");
              const day = d.getDay();
              if (day !== 1) {
                const diff = day === 0 ? -6 : 1 - day;
                d.setDate(d.getDate() + diff);
                setWeekStart(d.toISOString().split("T")[0]);
              } else {
                setWeekStart(e.target.value);
              }
            }}
            style={{ flex:1, padding:"10px 12px", borderRadius:8, border:"1px solid #E2E8F0", fontSize:13, background:"#F8FAFC", boxSizing:"border-box" }}
          />
          <button onClick={() => setWeekStart(getThisMonday())} style={{
            padding:"10px 12px", borderRadius:8, border:"1px solid #E2E8F0",
            background:"#F8FAFC", fontSize:12, fontWeight:700, color:"#1D4ED8", cursor:"pointer", whiteSpace:"nowrap",
          }}>This Week</button>
        </div>
        {weekStart && (
          <div style={{ fontSize:11, color:"#059669", fontWeight:700, marginTop:5 }}>
            ✓ Week of {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}
          </div>
        )}
      </div>

      {/* Shift slots with calculated dates */}
      <div style={{ border:"1px solid #E2E8F0", borderRadius:8, overflow:"hidden", marginBottom:12 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto 80px", padding:"7px 12px", background:"#FEF2F2", borderBottom:"1px solid #FECACA" }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#DC2626", letterSpacing:0.8 }}>SHIFT</span>
          <span style={{ fontSize:10, fontWeight:700, color:"#DC2626", letterSpacing:0.8, paddingRight:12 }}>DATE</span>
          <span style={{ fontSize:10, fontWeight:700, color:"#DC2626", letterSpacing:0.8, textAlign:"center" }}>SLOTS</span>
        </div>
        {Object.entries(slots).map(([shift, count]) => {
          const shiftDate = getShiftDate(shift);
          return (
            <div key={shift} style={{ display:"grid", gridTemplateColumns:"1fr auto 80px", padding:"9px 12px", borderBottom:"1px solid #F1F5F9", alignItems:"center" }}>
              <span style={{ fontSize:12, color:"#374151" }}>{shift}</span>
              <span style={{ fontSize:11, fontWeight:700, color: shiftDate ? "#059669" : "#CBD5E1", paddingRight:12 }}>
                {shiftDate || "—"}
              </span>
              {/* +/- buttons */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0 }}>
                <button onClick={() => setSlots(p => ({ ...p, [shift]: Math.max(0, (p[shift]||0) - 1) }))}
                  style={{ width:24, height:26, borderRadius:"5px 0 0 5px", border:"1px solid #E2E8F0", background:"#F8FAFC", color:"#374151", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                <div style={{ width:28, height:26, border:"1px solid #E2E8F0", borderLeft:"none", borderRight:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#0F172A", background:"#fff" }}>
                  {count}
                </div>
                <button onClick={() => setSlots(p => ({ ...p, [shift]: Math.min(10, (p[shift]||0) + 1) }))}
                  style={{ width:24, height:26, borderRadius:"0 5px 5px 0", border:"1px solid #E2E8F0", background:"#DC2626", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
              </div>
            </div>
          );
        })}
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto 80px", padding:"8px 12px", background:"#FEF2F2", alignItems:"center" }}>
          <span style={{ fontSize:12, fontWeight:700, color:"#DC2626" }}>Active Shifts</span>
          <span />
          <span style={{ fontSize:15, fontWeight:900, color:"#DC2626", textAlign:"center", display:"block" }}>{activeShifts.length}</span>
        </div>
      </div>

      {/* Grace period toggle */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"#F8FAFC", borderRadius:8, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700 }}>Activate 72h Grace Period</div>
          <div style={{ fontSize:11, color:"#94A3B8" }}>Limits each officer to one shift</div>
        </div>
        <Toggle checked={gracePeriodActive} onChange={setGracePeriodActive} color="#DC2626" />
      </div>

      <button onClick={() => {
        if (!isValid) return;
        const sharedPostedAt = Date.now();
        const shifts = activeShifts.map(([shift, count]) => ({
          title: `Fire Watch — ${shift}`,
          type: "FIRE WATCH",
          date: getShiftDate(shift) || shift,
          time: shift.match(/\d{4}-\d{4}/)?.[0] || "",
          location: FIRE_WATCH_LOCATION,
          slots: count,
          hold: false,
          status: "OPEN",
          postedAt: sharedPostedAt,
          rankSlots: { "Campus Security Assistant": count, "CPO": 0, "Corporal": 0, "Sergeant": 0, "Specialist": 0 },
        }));
        onPost(shifts);
      }} style={{
        width:"100%", padding:"13px 0", borderRadius:8, border:"none",
        background: isValid ? "#DC2626" : "#CBD5E1",
        color:"#fff", fontWeight:800, fontSize:15,
        cursor: isValid ? "pointer" : "default",
      }}>
        Post {activeShifts.length} Fire Watch Shift{activeShifts.length !== 1 ? "s" : ""} & Notify Officers
      </button>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// 1. ADMIN ANALYTICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function AnalyticsDashboard({ events, confirmed, cancelRequests, officers, darkMode }) {
  const dm = (l, d) => darkMode ? d : l;
  const [period, setPeriod] = useState("all");

  // ── Compute stats ────────────────────────────────────────────────────────
  const totalEvents     = events.length;
  const totalSlots      = events.reduce((a, e) => a + e.slots, 0);
  const totalFilled     = events.reduce((a, e) => a + e.filled, 0);
  const fillRate        = totalSlots > 0 ? Math.round((totalFilled / totalSlots) * 100) : 0;
  const totalWaitlisted = events.reduce((a, e) => a + (e.waitQueue?.length || 0), 0);
  const totalCancels    = cancelRequests.filter(r => r.status === "approved").length;
  const pendingRequests = cancelRequests.filter(r => r.status === "pending").length;

  // Events by type
  const byType = events.reduce((acc, ev) => {
    acc[ev.type] = (acc[ev.type] || 0) + 1;
    return acc;
  }, {});

  // Fill rate by event
  const fillByEvent = events.map(ev => ({
    title: ev.title.length > 18 ? ev.title.slice(0, 18) + "…" : ev.title,
    rate: ev.slots > 0 ? Math.round((ev.filled / ev.slots) * 100) : 0,
    filled: ev.filled,
    slots: ev.slots,
    type: ev.type,
  })).sort((a, b) => b.rate - a.rate);

  // Type colors
  const typeColors = {
    "COMMENCEMENT": "#7C3AED", "ATHLETICS": "#0369A1", "SPECIAL": "#0F766E",
    "FIRE WATCH": "#DC2626",  "STUDENT LIFE": "#D97706", "PATROL": "#475569",
    "BPAC": "#DB2777",        "OTHER": "#64748B",
  };

  const bg   = dm("#fff",    "#1E293B");
  const bg2  = dm("#F8FAFC", "#0F172A");
  const text = dm("#0F172A", "#F1F5F9");
  const sub  = dm("#64748B", "#94A3B8");
  const bdr  = dm("#E2E8F0", "#334155");

  const StatCard = ({ label, value, sub: subText, color = "#1D4ED8", icon }) => (
    <div style={{ background: bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${bdr}`, flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: text, marginTop: 2 }}>{label}</div>
      {subText && <div style={{ fontSize: 10, color: sub, marginTop: 2 }}>{subText}</div>}
    </div>
  );

  return (
    <div style={{ padding: "16px 14px", fontFamily: DS.fontSans, background: bg2, minHeight: "100vh" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: sub, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>SUPERVISOR PORTAL</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: text, marginBottom: 2 }}>Analytics</div>
      <div style={{ fontSize: 13, color: sub, marginBottom: 16 }}>OT Event Performance — Bernard Baruch College</div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <StatCard icon="📋" label="Total Events"    value={totalEvents}    color="#1D4ED8" subText={`${totalSlots} total slots`} />
        <StatCard icon="✅" label="Fill Rate"        value={`${fillRate}%`} color="#059669" subText={`${totalFilled}/${totalSlots} filled`} />
        <StatCard icon="⏳" label="Waitlisted"       value={totalWaitlisted} color="#7C3AED" subText="across all events" />
        <StatCard icon="🔄" label="Cancellations"   value={totalCancels}   color="#DC2626" subText={`${pendingRequests} pending`} />
      </div>

      {/* Fill rate per event */}
      <div style={{ background: bg, borderRadius: 12, padding: 16, border: `1px solid ${bdr}`, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: sub, letterSpacing: 0.8, marginBottom: 12 }}>SLOT FILL RATE BY EVENT</div>
        {fillByEvent.map((ev, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: text }}>{ev.title}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: ev.rate === 100 ? "#059669" : ev.rate >= 50 ? "#1D4ED8" : "#DC2626" }}>{ev.rate}%</span>
            </div>
            <div style={{ height: 6, background: dm("#F1F5F9", "#334155"), borderRadius: 99 }}>
              <div style={{
                height: "100%", borderRadius: 99, width: `${ev.rate}%`,
                background: ev.rate === 100 ? "#059669" : ev.rate >= 50 ? "#1D4ED8" : "#DC2626",
                transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ fontSize: 10, color: sub, marginTop: 2 }}>{ev.filled} of {ev.slots} slots filled · {ev.type}</div>
          </div>
        ))}
      </div>

      {/* Events by type */}
      <div style={{ background: bg, borderRadius: 12, padding: 16, border: `1px solid ${bdr}`, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: sub, letterSpacing: 0.8, marginBottom: 12 }}>EVENTS BY TYPE</div>
        {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: typeColors[type] || "#64748B", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: text, flex: 1 }}>{type}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: typeColors[type] || "#64748B" }}>{count}</span>
            <div style={{ width: 80, height: 6, background: dm("#F1F5F9","#334155"), borderRadius: 99 }}>
              <div style={{ height: "100%", borderRadius: 99, width: `${(count/totalEvents)*100}%`, background: typeColors[type] || "#64748B" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Cancel request breakdown */}
      <div style={{ background: bg, borderRadius: 12, padding: 16, border: `1px solid ${bdr}`, marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: sub, letterSpacing: 0.8, marginBottom: 12 }}>CANCEL REQUEST BREAKDOWN</div>
        {[["Approved", cancelRequests.filter(r=>r.status==="approved").length, "#059669"],
          ["Denied",   cancelRequests.filter(r=>r.status==="denied").length,   "#DC2626"],
          ["Pending",  cancelRequests.filter(r=>r.status==="pending").length,  "#D97706"]].map(([label, count, color]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${bdr}` }}>
            <span style={{ fontSize: 13, color: text }}>{label}</span>
            <Badge variant={label === "Approved" ? "success" : label === "Denied" ? "danger" : "warning"}>{count}</Badge>
          </div>
        ))}
      </div>

      {/* Officer participation */}
      <div style={{ background: bg, borderRadius: 12, padding: 16, border: `1px solid ${bdr}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: sub, letterSpacing: 0.8, marginBottom: 12 }}>OFFICER ROSTER — {officers.length} TOTAL</div>
        {officers.map((off, i) => {
          const signupCount = confirmed.filter(c => {
            const ev = events.find(e => e.id === c.eventId);
            return ev;
          }).length;
          return (
            <div key={off.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < officers.length - 1 ? `1px solid ${bdr}` : "none" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1D4ED8", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {off.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: text }}>{off.name}</div>
                <div style={{ fontSize: 10, color: sub }}>{off.badge} · {off.rank}</div>
              </div>
              <Badge variant="primary">{off.rank.split(" ")[0]}</Badge>
                  {off.armed && <Badge variant="danger">Armed</Badge>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MY SCHEDULE VIEW (Officer personal timeline)
// ═══════════════════════════════════════════════════════════════════════════════
function MySchedule({ officer, confirmed, events, cancelRequests, darkMode }) {
  const dm = (l, d) => darkMode ? d : l;
  const [filter, setFilter] = useState("all");

  const bg   = dm("#fff",    "#1E293B");
  const bg2  = dm("#F8FAFC", "#0F172A");
  const text = dm("#0F172A", "#F1F5F9");
  const sub  = dm("#64748B", "#94A3B8");
  const bdr  = dm("#E2E8F0", "#334155");

  const myEvents = confirmed.map(c => {
    const ev = events.find(e => e.id === c.eventId);
    return ev ? { ...ev, signedAt: c.signedAt } : null;
  }).filter(Boolean);

  const myRequests = cancelRequests.filter(r => r.officerId === officer?.id);
  const myWaitlist = events.filter(ev => ev.waitQueue?.some(w => w.officerId === officer?.id));

  const filtered = filter === "confirmed" ? myEvents
    : filter === "waitlist" ? myWaitlist
    : filter === "requests" ? myRequests.map(r => ({ ...r, isRequest: true }))
    : [...myEvents.map(e => ({...e, kind:"confirmed"})),
       ...myWaitlist.map(e => ({...e, kind:"waitlist"})),
       ...myRequests.map(r => ({...r, kind:"request"}))];

  const typeColors = { "COMMENCEMENT":"#7C3AED","ATHLETICS":"#0369A1","SPECIAL":"#0F766E","FIRE WATCH":"#DC2626","STUDENT LIFE":"#D97706","PATROL":"#475569","BPAC":"#DB2777","OTHER":"#64748B" };

  return (
    <div style={{ padding:"16px 14px", fontFamily:DS.fontSans, background:bg2, minHeight:"100vh" }}>
      <div style={{ fontSize:11, fontWeight:700, color:sub, letterSpacing:1, textTransform:"uppercase", marginBottom:2 }}>MY ASSIGNMENTS</div>
      <div style={{ fontSize:22, fontWeight:900, color:text, marginBottom:2 }}>My Schedule</div>
      <div style={{ fontSize:13, color:sub, marginBottom:16 }}>{officer?.name} · {officer?.badge}</div>

      {/* Summary pills */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {[[`${myEvents.length} Confirmed`, "#1D4ED8", "#EFF6FF"],
          [`${myWaitlist.length} Waitlisted`, "#7C3AED", "#EDE9FE"],
          [`${myRequests.filter(r=>r.status==="pending").length} Pending`, "#D97706", "#FFFBEB"]].map(([label, color, bg3]) => (
          <div key={label} style={{ padding:"8px 14px", borderRadius:10, background:bg3, border:`1px solid ${color}33` }}>
            <span style={{ fontSize:13, fontWeight:800, color }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${bdr}`, marginBottom:14 }}>
        {[["All","all"],["Confirmed","confirmed"],["Waitlist","waitlist"],["Requests","requests"]].map(([label,val]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            flex:1, padding:"9px 0", border:"none", background:"none",
            fontWeight:700, fontSize:11, cursor:"pointer",
            color: filter===val ? "#1D4ED8" : sub,
            borderBottom: filter===val ? "2px solid #1D4ED8" : "2px solid transparent",
            marginBottom:-2,
          }}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 20px" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>📭</div>
          <div style={{ fontSize:14, color:sub }}>Nothing to show here yet.</div>
        </div>
      )}

      {filtered.map((item, i) => {
        const isRequest = item.isRequest || item.kind === "request";
        const isWaitlist = item.kind === "waitlist";
        const tc = typeColors[item.type] || "#64748B";
        return (
          <div key={i} className="card-hover fade-in" style={{ background:bg, borderRadius:12, padding:14, border:`1px solid ${bdr}`, marginBottom:10, boxShadow:DS.shadowSm }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div style={{ flex:1, marginRight:8 }}>
                <div style={{ fontSize:14, fontWeight:800, color:text }}>{item.title || item.eventTitle}</div>
                {!isRequest && <div style={{ fontSize:12, color:sub, marginTop:2 }}>{item.date} · {item.time}</div>}
              </div>
              {isRequest
                ? <Badge variant={item.status==="approved"?"success":item.status==="denied"?"danger":"warning"}>{item.status?.toUpperCase()}</Badge>
                : isWaitlist
                  ? <Badge variant="default">WAITLISTED</Badge>
                  : <Badge variant="primary">CONFIRMED</Badge>}
            </div>
            {isRequest && (
              <div style={{ fontSize:12, color:sub, background:dm("#F8FAFC","#0F172A"), padding:"7px 10px", borderRadius:8 }}>
                <b>Reason:</b> {item.reason}
              </div>
            )}
            {!isRequest && item.type && (
              <span style={{ fontSize:10, fontWeight:700, color:tc, background:tc+"18", padding:"2px 8px", borderRadius:4 }}>{item.type}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. EVENT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function EventDetail({ event, officer, signups, onSignup, onBack, darkMode }) {
  const dm = (l, d) => darkMode ? d : l;
  if (!event) return null;

  const bg   = dm("#fff",    "#1E293B");
  const bg2  = dm("#F8FAFC", "#0F172A");
  const text = dm("#0F172A", "#F1F5F9");
  const sub  = dm("#64748B", "#94A3B8");
  const bdr  = dm("#E2E8F0", "#334155");

  const isSigned   = signups?.confirmed?.includes(event.id);
  const isWaited   = signups?.waitlisted?.includes(event.id);
  const isFull     = event.filled >= event.slots;
  const queuePos   = signups?.getQueuePosition?.(event.id);
  const graceActive = event.postedAt && (Date.now() - event.postedAt) < GRACE_PERIOD_MS;
  const graceHrs   = graceActive ? Math.ceil((GRACE_PERIOD_MS - (Date.now() - event.postedAt)) / 3600000) : 0;
  const graceLocked = signups?.gracePeriodBlocksSignup?.(event);

  const typeColors = { "COMMENCEMENT":"#7C3AED","ATHLETICS":"#0369A1","SPECIAL":"#0F766E","FIRE WATCH":"#DC2626","STUDENT LIFE":"#D97706","PATROL":"#475569","BPAC":"#DB2777","OTHER":"#64748B" };
  const tc = typeColors[event.type] || "#64748B";
  const fillPct = event.slots > 0 ? Math.min(100, Math.round((event.filled/event.slots)*100)) : 0;

  return (
    <div className="fade-in" style={{ padding:"16px 14px", fontFamily:DS.fontSans, background:bg2, minHeight:"100vh" }}>
      {/* Back button */}
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:sub, fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:16, padding:0 }}>
        ‹ Back to Events
      </button>

      {/* Hero card */}
      <div style={{ background:bg, borderRadius:16, padding:20, border:`1px solid ${bdr}`, marginBottom:14, boxShadow:DS.shadowMd }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <span style={{ fontSize:10, fontWeight:800, color:tc, background:tc+"18", padding:"3px 8px", borderRadius:4 }}>{event.type}</span>
          {isSigned && <Badge variant="primary">✓ You're Confirmed</Badge>}
          {isWaited && <Badge variant="default">⏳ #{queuePos} in Queue</Badge>}
        </div>
        <div style={{ fontSize:22, fontWeight:900, color:text, marginBottom:4 }}>{event.title}</div>
        <div style={{ fontSize:13, color:sub, marginBottom:16 }}>Posted {event.postedAt ? Math.floor((Date.now()-event.postedAt)/3600000)+"h ago" : "recently"}</div>

        {/* Info rows */}
        {[["📅","Date",event.date],["🕐","Time",event.time],
          ...(event.location ? [["📍","Location",event.location]] : []),
          ["👥","Slots",`${event.slots - event.filled} of ${event.slots} remaining`],
          ...(event.notes ? [["📝","Notes",event.notes]] : []),
        ].map(([icon,label,value]) => (
          <div key={label} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 0", borderBottom:`1px solid ${bdr}` }}>
            <span style={{ fontSize:15, width:22, flexShrink:0 }}>{icon}</span>
            <span style={{ fontSize:12, color:sub, fontWeight:600, width:60, flexShrink:0 }}>{label}</span>
            <span style={{ fontSize:13, color:text, fontWeight:600 }}>{value}</span>
          </div>
        ))}

        {/* Fill rate bar */}
        <div style={{ marginTop:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:11, fontWeight:700, color:sub }}>SLOT AVAILABILITY</span>
            <span style={{ fontSize:11, fontWeight:800, color: fillPct===100?"#059669":"#1D4ED8" }}>{fillPct}% filled</span>
          </div>
          <div style={{ height:8, background:dm("#F1F5F9","#334155"), borderRadius:99 }}>
            <div style={{ height:"100%", borderRadius:99, width:`${fillPct}%`, background: fillPct===100?"#059669":"#1D4ED8", transition:"width 0.5s ease" }} />
          </div>
        </div>
      </div>

      {/* Grace period notice */}
      {graceActive && (
        <div style={{ background:"#F0F9FF", border:"1px solid #BAE6FD", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
          <div style={{ fontSize:12, color:"#0369A1", fontWeight:700 }}>⏱ Grace period active — {graceHrs}h remaining</div>
          <div style={{ fontSize:11, color:"#64748B", marginTop:3 }}>Per Rodney Memo: only one sign-up allowed during the 72-hour window.</div>
        </div>
      )}

      {/* Action button */}
      <div style={{ padding:"0 0 20px" }}>
        {isSigned ? (
          <Button variant="secondary" fullWidth style={{ borderRadius:10, padding:"14px 0" }}>✓ You are confirmed for this event</Button>
        ) : isWaited ? (
          <Button variant="secondary" fullWidth style={{ borderRadius:10, padding:"14px 0" }}>⏳ You are #{queuePos} on the waitlist</Button>
        ) : isFull ? (
          <Button variant="primary" fullWidth style={{ borderRadius:10, padding:"14px 0", background:"#7C3AED" }} onClick={() => onSignup(event.id, "waitlist")}>Join Waitlist</Button>
        ) : graceLocked ? (
          <Button disabled fullWidth style={{ borderRadius:10, padding:"14px 0" }}>🔒 Grace Period Active</Button>
        ) : (
          <Button variant="primary" fullWidth style={{ borderRadius:10, padding:"14px 0", boxShadow:"0 4px 14px rgba(29,78,216,0.35)" }} onClick={() => onSignup(event.id, "signup")}>Sign Up for This Event</Button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DUPLICATE EVENT (added to SupervisorDashboard All Events tab)
// — Built inline as a function used inside SupervisorDashboard
// ═══════════════════════════════════════════════════════════════════════════════

// ── Days Off Settings Component ──────────────────────────────────────────────
function DaysOffSettings({ officer }) {
  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const [daysOff, setDaysOff] = useState([0, 6]); // default: Sun + Sat off

  const toggleDay = (dayIdx) => {
    setDaysOff(prev =>
      prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx]
    );
  };

  return (
    <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, padding:16, marginBottom:12 }}>
      <div style={{ fontSize:10, fontWeight:800, color:"#94A3B8", letterSpacing:0.8, marginBottom:4 }}>RECURRING DAYS OFF</div>
      <div style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>
        Select the days you are regularly unavailable for OT. Supervisors can see your availability when posting.
      </div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {DAYS.map((day, idx) => {
          const isOff = daysOff.includes(idx);
          return (
            <button key={day} onClick={() => toggleDay(idx)} style={{
              padding:"8px 12px", borderRadius:8, border:"none",
              background: isOff ? "#FEF2F2" : "#F0FDF4",
              color: isOff ? "#DC2626" : "#059669",
              fontSize:12, fontWeight:700, cursor:"pointer",
              border: isOff ? "1.5px solid #FECACA" : "1.5px solid #A7F3D0",
              transition:"all 0.15s ease",
            }}>
              {isOff ? "✕" : "✓"} {day.slice(0,3)}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop:10, fontSize:11, color:"#94A3B8" }}>
        {daysOff.length === 0
          ? "No recurring days off set — available every day"
          : `Unavailable on: ${daysOff.map(d => DAYS[d]).join(", ")}`}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5 & 6. DARK MODE (in Settings) + OFFICER AVAILABILITY (recurring days off)
// — Both added to the existing Settings component
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  // ── Auth state ───────────────────────────────────────────────────────────────
  const [authStep, setAuthStep]       = useState("login");   // "login" | "mfa" | "app"
  const [pendingOfficer, setPending]  = useState(null);
  const [officer, setOfficer]         = useState(null);
  const [firstLogin, setFirstLogin]   = useState(false);

  // ── App state ────────────────────────────────────────────────────────────────
  const [nav, setNav]           = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast]       = useState(null);
  const [tourState, setTourState] = useState(null);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [signupModal, setSignupModal] = useState(null);  // eventId — lifted from Dashboard
  const [cancelModal, setCancelModal] = useState(null);  // { eventId, type } — lifted from Dashboard
  const [darkMode, setDarkMode]     = useState(false);

  // Apply dark mode to body
  useEffect(() => {
    document.body.style.background = darkMode ? "#0F172A" : "#F1F5F9";
    document.body.style.color      = darkMode ? "#F1F5F9" : "#0F172A";
  }, [darkMode]);

  // Dark mode color helper — use throughout app
  const dm = (light, dark) => darkMode ? dark : light;
  const [openAIKey, setOpenAIKey]   = useState("");

  // ── Cancel requests & slot releases pending approval ─────────────────────
  const [cancelRequests, setCancelRequests] = useState([
    { id:1, officerId:1, officerName:"James Carter", badge:"PS-0412", eventId:1, eventTitle:"Spring Commencement", reason:"Family emergency", submittedAt: Date.now() - 3600000, type:"cancel", status:"pending" },
    { id:2, officerId:7, officerName:"Lisa Chen",    badge:"PS-0550", eventId:3, eventTitle:"Alumni Gala",          reason:"Medical appointment", submittedAt: Date.now() - 7200000, type:"slot-release", status:"pending" },
  ]);

  const submitCancelRequest = (eventId, reason, type = "cancel") => {
    const ev = events.find(e => e.id === eventId);
    if (!ev || !officer) return;
    const req = {
      id: Date.now(),
      officerId: officer.id,
      officerName: officer.name,
      badge: officer.badge,
      eventId,
      eventTitle: ev.title,
      reason,
      submittedAt: Date.now(),
      type,
      status: "pending",
    };
    setCancelRequests(prev => [...prev, req]);
    addNotif(`Your ${type === "cancel" ? "cancel request" : "slot release"} for ${ev.title} has been submitted for approval.`, "info");
    showToast("Request submitted — pending supervisor approval.", "info");
  };

  const approveCancelRequest = (reqId) => {
    const req = cancelRequests.find(r => r.id === reqId);
    if (!req) return;
    setCancelRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "approved" } : r));
    setConfirmed(prev => prev.filter(c => !(c.eventId === req.eventId && req.officerId === officer?.id)));
    const ev = events.find(e => e.id === req.eventId);
    const requestingOfficer = OFFICERS.find(o => o.id === req.officerId);
    if (ev) {
      const sorted = [...ev.waitQueue].sort((a, b) => a.joinedAt - b.joinedAt);
      if (sorted.length > 0) {
        const promoted = sorted[0];
const remaining = sorted.slice(1);
setEvents(prev => prev.map(e => {
  if (e.id === req.eventId) return { ...e, waitQueue: remaining };
  // Remove promoted officer from all other waitlists
  return { ...e, waitQueue: e.waitQueue.filter(w => w.officerId !== promoted.officerId) };
}));
setConfirmed(prev => [...prev, { eventId: req.eventId, signedAt: Date.now() }]);

        addNotif(`Slot approved: ${req.officerName}'s cancellation approved. Next officer in queue has been confirmed for ${req.eventTitle}.`, "success");
        // Email promoted officer
        const promotedOfficer = OFFICERS.find(o => o.id === promoted.officerId);
        if (promotedOfficer) {
          sendEmail("waitlist_promoted", promotedOfficer, ev);
          sendPush("waitlist_promoted", promotedOfficer, ev);
        }
      } else {
        setEvents(prev => prev.map(e => e.id === req.eventId ? { ...e, filled: Math.max(0, e.filled - 1) } : e));
        addNotif(`${req.officerName}'s cancellation approved for ${req.eventTitle}. No officers in waitlist — slot is now open.`, "info");
      }
      // Email requesting officer — request approved
      if (requestingOfficer) {
        sendEmail("request_approved", requestingOfficer, ev, { reason: req.type });
        sendPush("request_approved", requestingOfficer, ev);
      }
    }
    showToast(`Request approved. Waitlist updated automatically.`, "success");
  };

  const denyCancelRequest = (reqId) => {
    const req = cancelRequests.find(r => r.id === reqId);
    if (!req) return;
    setCancelRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "denied" } : r));
    addNotif(`Cancel request for ${req?.eventTitle} has been denied.`, "warn");
    // Email requesting officer — request denied
    const requestingOfficer = OFFICERS.find(o => o.id === req.officerId);
    const ev = events.find(e => e.id === req.eventId);
    if (requestingOfficer && ev) {
      sendEmail("request_denied", requestingOfficer, ev, { reason: req.type });
      sendPush("request_denied", requestingOfficer, ev);
    }
    showToast("Request denied.", "warn");
  };
  // ── Events state (mutable slots + waitQueues) ────────────────────────────
  const [events, setEvents] = useState(
    EVENTS_SEED.map(e => ({ ...e, waitQueue: [] }))
  );

  // Post a new event and notify all officers by email
  const postEvent = (newEvent) => {
    const ev = { ...newEvent, id: Date.now(), filled: 0, waitQueue: [], status: "OPEN", postedAt: Date.now() };
    setEvents(prev => [...prev, ev]);
    addNotif(`New event posted: ${ev.title} on ${ev.date}.`, "info");
    showToast(`Event posted! Notifying all officers by email and push.`, "success");
    sendEmailToAll("new_event", ev);
    sendPushToAll("new_event", ev);
  };

  // ── Reschedule an event (memo: assigned officers get first opportunity) ────
  const rescheduleEvent = (eventId, newDate, newTime) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, date: newDate, time: newTime, status: "OPEN", postedAt: Date.now() } : e
    ));
    // Notify all confirmed officers first per memo policy
    const confirmedOfficerIds = confirmed.filter(c => c.eventId === eventId).map(c => c.eventId);
    OFFICERS.forEach(off => {
      sendEmail("event_rescheduled", off, { ...ev, date: newDate, time: newTime });
    });
    addNotif(`${ev.title} has been rescheduled to ${newDate} at ${newTime}. Assigned officers have been notified.`, "info");
    showToast(`Event rescheduled. Officers notified by email.`, "info");
  };

  // ── Confirmed signups: { eventId, signedAt } ─────────────────────────────
  const [confirmed, setConfirmed] = useState([
    { eventId: 2, signedAt: Date.now() - (91 * 60 * 60 * 1000) } // Basketball Tournament — signed up 91h ago, grace expired
  ]);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([
    { id: 1, msg: "You have been confirmed for Basketball Tournament.", time: Date.now() - 3600000, read: false, type: "success" },
    { id: 2, msg: "Spring Commencement waitlist position: #1 in queue.", time: Date.now() - 7200000, read: false, type: "info"    },
  ]);

  const addNotif = (msg, type = "info") => {
    setNotifications(prev => [
      { id: Date.now(), msg, time: Date.now(), read: false, type },
      ...prev,
    ]);
  };

  // ── Send email via /api/notify serverless function ──────────────────────
  const sendEmail = async (type, recipientOfficer, event, extra = {}) => {
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          officer: { name: recipientOfficer.name, email: recipientOfficer.email },
          event: event ? { title: event.title, date: event.date, time: event.time, type: event.type, slots: event.slots, filled: event.filled, hold: event.hold } : null,
          ...extra,
        }),
      });
    } catch (err) {
      console.warn("Email notification failed:", err.message);
    }
  };

  // Send email to all officers (for new event announcements)
  const sendEmailToAll = async (type, event, extra = {}) => {
    for (const off of OFFICERS) {
      if (off.email) await sendEmail(type, off, event, extra);
    }
  };

  // ── Send browser push notification via /api/push ──────────────────────────
  const sendPush = async (type, recipientOfficer, event, targetAll = false) => {
    try {
      await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          officer: recipientOfficer ? { badge: recipientOfficer.badge, name: recipientOfficer.name, email: recipientOfficer.email } : null,
          event: event ? { title: event.title, date: event.date, time: event.time, type: event.type, location: event.location } : null,
          targetAll,
        }),
      });
    } catch (err) {
      console.warn("Push notification failed:", err.message);
    }
  };

  // Send push to all officers
  const sendPushToAll = async (type, event) => sendPush(type, null, event, true);

  const pendingApprovals = cancelRequests.filter(r => r.status === "pending").length;
  const unreadCount = notifications.filter(n => !n.read).length + (isSgtPlus(officer?.rank) ? pendingApprovals : 0);
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const showToast = (msg, type = "info") => setToast({ msg, type });

  // ── Grace period helper ────────────────────────────────────────────────────
  const isInGracePeriod = (ev) => {
    if (!ev?.postedAt) return false;
    return (Date.now() - ev.postedAt) < GRACE_PERIOD_MS;
  };

  // ── Memo rule: during grace period officer can only hold ONE signup total ──
  const hasGracePeriodSignup = () => {
    return confirmed.some(c => {
      const ev = events.find(e => e.id === c.eventId);
      return ev && isInGracePeriod(ev);
    });
  };

  // ── Sign up for an event ──────────────────────────────────────────────────
  const handleSignup = (eventId) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev || ev.filled >= ev.slots) return;

    // Memo rule: during 72h grace period only ONE signup allowed across all events
    if (isInGracePeriod(ev) && hasGracePeriodSignup()) {
      showToast("Policy: Only one sign-up allowed during the 72-hour grace period.", "warn");
      addNotif("Sign-up blocked: You already have a signup during an active grace period.", "warn");
      return;
    }

    // Armed slot tracking — flag signup as armed if officer is armed and slots remain
    const filledArmedSlots = confirmed.filter(c => c.eventId === eventId && c.armedSlot).length;
    const useArmedSlot = officer?.armed && (ev.armedSlots || 0) > filledArmedSlots;

    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, filled: e.filled + 1 } : e));
    setConfirmed(prev => [...prev, { eventId, signedAt: Date.now(), armedSlot: useArmedSlot }]);
    addNotif(`You've been confirmed for ${ev.title}.${useArmedSlot ? " Armed assignment." : ""}`, "success");
    showToast(`Signed up successfully!${useArmedSlot ? " Armed slot confirmed." : ""}`, "success");
  };

  // ── Join waitlist (timestamp-ordered queue) ────────────────────────────────
  const handleWaitlist = (eventId) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    const alreadyQueued = ev.waitQueue.some(e => e.officerId === officer.id);
    if (alreadyQueued) return;
    const joinedAt = Date.now();
    setEvents(prev => prev.map(e =>
      e.id === eventId
        ? { ...e, waitQueue: [...e.waitQueue, { officerId: officer.id, joinedAt }] }
        : e
    ));
    const position = ev.waitQueue.length + 1;
    addNotif(`You joined the waitlist for ${ev.title}. Position: #${position}.`, "info");
    showToast(`Added to waitlist — you're #${position} in queue.`, "info");
    // Email officer their waitlist position
    sendEmail(officer.email, "waitlist_join", {
      officerName: officer.name,
      eventTitle: ev.title,
      eventDate: ev.date,
      eventTime: ev.time,
      position,
    });
    sendPush(officer.id, "waitlist_join", {
      title: `Waitlist — ${ev.title}`,
      body: `You are #${position} in the queue. We'll notify you if a slot opens.`,
    });
  };

  // ── Cancel a confirmed signup ──────────────────────────────────────────────
  // When an officer cancels, automatically promote next in waitQueue by timestamp
  const handleCancel = (eventId) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    setConfirmed(prev => prev.filter(c => c.eventId !== eventId));
    // Sort waitQueue by joinedAt ascending (earliest = first)
    const sorted = [...ev.waitQueue].sort((a, b) => a.joinedAt - b.joinedAt);
    if (sorted.length > 0) {
      const promoted = sorted[0];
      const remaining = sorted.slice(1);
      setEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, waitQueue: remaining } : e
      ));
      setConfirmed(prev => [...prev, { eventId, signedAt: Date.now() }]);
      addNotif(
        `A slot opened in \${ev.title}! You've been automatically confirmed from the waitlist.`,
        "success"
      );
      showToast(`Slot released — next officer in queue has been promoted.`, "info");
    } else {
      setEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, filled: Math.max(0, e.filled - 1) } : e
      ));
      showToast("Signup cancelled.", "warn");
    }
  };

  // ── Derived signup state for child components ─────────────────────────────
  const signups = {
    confirmed: confirmed.map(c => c.eventId),
    waitlisted: events.flatMap(e =>
      e.waitQueue.filter(w => w.officerId === officer?.id).map(() => e.id)
    ),
    getQueuePosition: (eventId) => {
      const ev = events.find(e => e.id === eventId);
      if (!ev) return null;
      const sorted = [...ev.waitQueue].sort((a, b) => a.joinedAt - b.joinedAt);
      const idx = sorted.findIndex(w => w.officerId === officer?.id);
      return idx >= 0 ? idx + 1 : null;
    },
    // Grace period helpers for UI
    isInGracePeriod,
    hasGracePeriodSignup,
    gracePeriodBlocksSignup: (ev) => isInGracePeriod(ev) && hasGracePeriodSignup(),
    // Pass officer so EventCard can check armed status
    officer,
    getGraceTimeLeft: (ev) => {
      if (!ev?.postedAt) return null;
      const elapsed = Date.now() - ev.postedAt;
      const remaining = GRACE_PERIOD_MS - elapsed;
      if (remaining <= 0) return null;
      const hrs = Math.floor(remaining / 3600000);
      const mins = Math.floor((remaining % 3600000) / 60000);
      return hrs > 0 ? `${hrs}h ${mins}m remaining` : `${mins}m remaining`;
    },
  };

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleCredentials = (off) => {
    setPending(off);
    setAuthStep("mfa");
  };

  const handleVerified = (off) => {
    setOfficer(off);
    setAuthStep("app");
    setNav("dashboard");
    setFirstLogin(true);
    // Initialize OneSignal push notifications on login
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({
            appId: process.env.REACT_APP_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID",
            notifyButton: { enable: false },
            allowLocalhostAsSecureOrigin: true,
          });
          await OneSignal.Notifications.requestPermission();
          await OneSignal.User.addTags({
            badge: off.badge,
            rank: off.rank,
            officer_id: String(off.id),
          });
        } catch (err) {
          console.warn("OneSignal init failed:", err.message);
        }
      });
    }
  };

  const handleSignOut = () => {
    setAuthStep("login");
    setOfficer(null);
    setPending(null);
    setNav("dashboard");
    setMenuOpen(false);
    setTourState(null);
    setFirstLogin(false);
    showToast("Signed out successfully.", "info");
  };

  // ── Tour handlers ─────────────────────────────────────────────────────────
  const startTour = () => {
    setMenuOpen(false);
    setFirstLogin(false);
    setTourState("selecting");
  };

  const selectRole = (roleKey) => {
    setNav("dashboard");
    setTourState({ roleKey });
  };

  const closeTour = () => {
    setTourState(null);
    setNav("dashboard");
    showToast("Tour complete! Visit FAQ anytime for help.", "success");
  };

  const navTitles = {
    dashboard: officer && isSpecialistPlus(officer.rank) ? "Admin Dashboard" : "Dashboard",
    schedule: "Calendar",
    "slot-release": "Slot Release",
    "cancel-requests": "Cancel Requests",
    faq: "FAQ",
    settings: "Settings",
    profile: "My Profile",
    approvals: "Approvals Queue",
    myschedule: "My Schedule",
    analytics: "Analytics",
  };

  const activeTour = tourState && tourState.roleKey ? TOURS[tourState.roleKey] : null;

  // ── Login screens ─────────────────────────────────────────────────────────
  if (authStep === "login") {
    return <LoginCredentials onNext={handleCredentials} />;
  }
  if (authStep === "mfa") {
    return <LoginMFA officer={pendingOfficer} onVerify={handleVerified} onBack={() => setAuthStep("login")} />;
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  const appBg   = darkMode ? "#0F172A" : "#F1F5F9";
  const cardBg  = darkMode ? "#1E293B" : "#ffffff";
  const textPri = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub = darkMode ? "#94A3B8" : "#64748B";
  const border  = darkMode ? "#334155" : "#E2E8F0";

  return (
    <div style={{ minHeight: "100vh", background: appBg, fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: 430, margin: "0 auto", position: "relative", transition: "background 0.3s ease" }}>
      <TopBar
        title={navTitles[nav] || "Dashboard"}
        officer={officer}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        nav={nav}
        setNav={setNav}
        notifCount={unreadCount}
        onSignOut={handleSignOut}
        onBellClick={() => { setNotifOpen(o => !o); setMenuOpen(false); }}
        darkMode={darkMode}
      />

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />
      )}

      {notifOpen && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setNotifOpen(false)}
          onMarkAllRead={markAllRead}
        />
      )}

      {/* Route to Supervisor Dashboard for Specialist+ and Officer Dashboard for others */}
      {nav === "dashboard" && isSpecialistPlus(officer?.rank)
        ? <SupervisorDashboard
            officer={officer}
            events={events}
            setEvents={setEvents}
            confirmed={confirmed}
            setConfirmed={setConfirmed}
            notifications={notifications}
            addNotif={addNotif}
            showToast={showToast}
            sendEmail={sendEmail}
            sendEmailToAll={sendEmailToAll}
            cancelRequests={cancelRequests}
            approveCancelRequest={approveCancelRequest}
            denyCancelRequest={denyCancelRequest}
            postEvent={postEvent}
            rescheduleEvent={rescheduleEvent}
            darkMode={darkMode}
          />
        : nav === "dashboard" && <Dashboard officer={officer} signups={signups} handleSignup={handleSignup} handleWaitlist={handleWaitlist} handleCancel={handleCancel} submitCancelRequest={submitCancelRequest} isSgt={isSgtPlus(officer?.rank)} showToast={showToast} startTour={startTour} events={events} darkMode={darkMode} signupModal={signupModal} setSignupModal={setSignupModal} cancelModal={cancelModal} setCancelModal={setCancelModal} />
      }
      {nav === "schedule"        && <Schedule signups={signups} events={events} darkMode={darkMode} />}
      {nav === "slot-release"    && <SlotRelease showToast={showToast} />}
      {nav === "cancel-requests" && <CancelRequests />}
      {nav === "approvals"         && <SgtApprovals cancelRequests={cancelRequests} onApprove={approveCancelRequest} onDeny={denyCancelRequest} officer={officer} darkMode={darkMode} />}
      {nav === "faq"             && <FAQ setNav={setNav} darkMode={darkMode} />}
      {nav === "analytics"      && isSpecialistPlus(officer?.rank) && <AnalyticsDashboard events={events} confirmed={confirmed} cancelRequests={cancelRequests} officers={OFFICERS} darkMode={darkMode} />}
      {nav === "myschedule"     && <MySchedule officer={officer} confirmed={confirmed} events={events} cancelRequests={cancelRequests} darkMode={darkMode} />}
      {nav === "profile"         && <Profile officer={officer} />}
      {nav === "settings"        && <Settings startTour={startTour} officer={officer} openAIKey={openAIKey} setOpenAIKey={setOpenAIKey} darkMode={darkMode} setDarkMode={setDarkMode} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* Signup Confirm Modal — root level so nothing blocks it */}
      {signupModal && (
        <SignupConfirmModal
          event={events.find(e => e.id === signupModal)}
          officer={officer}
          onConfirm={() => {
            handleSignup(signupModal);
            setSignupModal(null);
          }}
          onClose={() => setSignupModal(null)}
        />
      )}

      {/* Cancel Request Modal — root level */}
      {cancelModal && (
        <CancelRequestModal
          event={events.find(e => e.id === cancelModal.eventId)}
          type={cancelModal.type}
          onSubmit={(reason) => {
            submitCancelRequest(cancelModal.eventId, reason, cancelModal.type);
            setCancelModal(null);
          }}
          onClose={() => setCancelModal(null)}
        />
      )}

      {/* First-login tour prompt */}
      {firstLogin && (
        <FirstLoginPrompt
          officer={officer}
          onStartTour={startTour}
          onSkip={() => setFirstLogin(false)}
        />
      )}

      {/* Role selector */}
      {tourState === "selecting" && (
        <TourRoleSelector onSelect={selectRole} onClose={() => setTourState(null)} />
      )}

      {/* Onboarding checklist — show after first login, hide if dismissed or tour active */}

      {/* Active tour */}
      {activeTour && (
        <GuidedTour
          steps={activeTour.steps}
          roleColor={activeTour.color}
          onClose={closeTour}
          currentNav={nav}
          setNav={setNav}
          openAIKey={openAIKey}
          showToast={showToast}
        />
      )}
    </div>
  );
}
