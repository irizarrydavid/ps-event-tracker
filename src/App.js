import { useState, useEffect, useRef } from "react";
import {
  DS, Badge, Button, Input, Card, Toggle,
  OFFICERS, RANK_LEVEL, GRACE_PERIOD_MS, EVENTS_SEED,
  isSgtPlus, isSpecialistPlus, isLtPlus,
  isArmed, eventRequiresArmed, armedSlotsAvailable,
  TOURS,
  TourRoleSelector, GuidedTour,
  Toast, NotificationDrawer, TopBar,
  EventCard, Dashboard, Schedule,
  SlotRelease, CancelRequests, FAQ,
  Profile, Settings,
  LoginCredentials, LoginMFA, FirstLoginPrompt,
  SignupConfirmModal, CancelRequestModal,
  SgtApprovals, RescheduleModal,
  SupervisorDashboard, PostEventForm, FireWatchForm,
  AnalyticsDashboard, MySchedule, EventDetail,
  DaysOffSettings,
} from "./Components";

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
        setEvents(prev => prev.map(e => e.id === req.eventId ? { ...e, waitQueue: remaining } : e));
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
    const confirmedOfficerIds = confirmed.filter(c => c.eventId === eventId).map(c => c.officerId);
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

  // ── Tiered Understaffed Event Alert System ────────────────────────────────
  // Rule 41: If event is 72h away and ≤50% filled → Critical alert to all unfilled officers
  // Rule 42: If event is 48h away and 51–75% filled → Warning alert
  // Rule 43: If event is 24h away and 76–99% filled → Heads Up alert
  // Rule 44: Supervisor receives a separate dashboard alert for any understaffed event
  useEffect(() => {
    const checkUnderstaffed = () => {
      if (!events || !officer) return;
      const now = Date.now();
      events.forEach(ev => {
        if (!ev.date || ev.status === "CANCELED" || ev.filled >= ev.slots) return;
        const fillPct = ev.slots > 0 ? (ev.filled / ev.slots) * 100 : 0;
        const openSlots = ev.slots - ev.filled;
        // Parse event date/time to get ms timestamp
        const evDateStr = ev.date + " 2026 " + (ev.time?.split("-")[0] || "0800");
        const evTime = new Date(evDateStr).getTime();
        if (isNaN(evTime)) return;
        const hoursAway = (evTime - now) / (1000 * 60 * 60);
        // Determine alert tier
        let tier = null;
        let urgency = "";
        let color = "";
        if (fillPct <= 50 && hoursAway <= 72 && hoursAway > 48) {
          tier = "critical"; urgency = "🔴 URGENT"; color = "#DC2626";
        } else if (fillPct > 50 && fillPct <= 75 && hoursAway <= 48 && hoursAway > 24) {
          tier = "warning"; urgency = "🟡 REMINDER"; color = "#D97706";
        } else if (fillPct > 75 && fillPct < 100 && hoursAway <= 24 && hoursAway > 0) {
          tier = "headsup"; urgency = "🟢 HEADS UP"; color = "#059669";
        }
        if (!tier) return;
        // Notify officers not yet signed up
        const msg = `${urgency}: ${ev.title} — ${openSlots} slot${openSlots > 1 ? "s" : ""} still available. Event is in ${Math.round(hoursAway)}h.`;
        addNotif(msg, tier === "critical" ? "warn" : "info");
        // Supervisor alert
        if (isSpecialistPlus(officer?.rank)) {
          addNotif(`📋 Staffing Alert: ${ev.title} is ${Math.round(fillPct)}% filled with ${Math.round(hoursAway)}h remaining. ${openSlots} slot${openSlots > 1 ? "s" : ""} unfilled.`, "warn");
        }
      });
    };
    // Run on load and every hour
    checkUnderstaffed();
    const interval = setInterval(checkUnderstaffed, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [events, officer]);

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
      setConfirmed(prev => [...prev, { eventId, officerId: promoted.officerId, signedAt: Date.now() }]);
      addNotif(
        `A slot opened in ${ev.title}! You've been automatically confirmed from the waitlist.`,
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
    <div style={{ minHeight: "100vh", background: appBg, fontFamily: DS.fontSans, maxWidth: 430, margin: "0 auto", position: "relative",
    overflowX: "hidden",
    paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
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
