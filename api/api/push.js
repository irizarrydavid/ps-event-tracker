// ═══════════════════════════════════════════════════════════════════════════════
// ONESIGNAL BROWSER PUSH NOTIFICATION SETUP
// ═══════════════════════════════════════════════════════════════════════════════
//
// WHAT THIS FILE IS:
// Instructions and ready-to-use code for integrating OneSignal Web Push
// notifications into the CUNY PS Event Management Tracker.
//
// PREREQUISITES (IT must do these once):
// 1. Create a free account at onesignal.com
// 2. Create a new App → Web Push → select "Typical Site"
// 3. Enter your production URL (e.g. publicsafety.baruch.cuny.edu)
// 4. Copy your OneSignal App ID
// 5. Add ONESIGNAL_APP_ID to Vercel environment variables
// 6. Add ONESIGNAL_API_KEY to Vercel environment variables (from OneSignal dashboard → Settings → Keys)
//
// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Add OneSignal SDK to public/index.html
// ─────────────────────────────────────────────────────────────────────────────
// Add this script tag inside <head> in public/index.html:
//
// <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
//
// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Add this initialization code to src/App.js
// ─────────────────────────────────────────────────────────────────────────────
// Add inside the root App component, after the officer state is set on login:
//
//   const initOneSignal = async (officer) => {
//     if (!window.OneSignalDeferred) return;
//     window.OneSignalDeferred = window.OneSignalDeferred || [];
//     window.OneSignalDeferred.push(async (OneSignal) => {
//       await OneSignal.init({
//         appId: "YOUR_ONESIGNAL_APP_ID", // replace with your App ID
//         notifyButton: { enable: false }, // we use our own UI
//         allowLocalhostAsSecureOrigin: true, // for local dev
//       });
//       // Request permission
//       await OneSignal.Notifications.requestPermission();
//       // Tag the officer so we can target them by badge/rank
//       await OneSignal.User.addTags({
//         badge: officer.badge,
//         rank: officer.rank,
//         officer_id: String(officer.id),
//       });
//     });
//   };
//
// Call initOneSignal(officer) right after a successful login.
//
// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Add this Vercel serverless function as api/push.js
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const {
    type,           // notification type
    officer,        // { badge, name, email }
    event,          // { title, date, time, type, location }
    targetAll,      // true = send to all officers
    appUrl = "https://ps-event-tracker.vercel.app",
  } = body;

  if (!type) return res.status(400).json({ error: "Missing type" });
  if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_API_KEY) {
    return res.status(500).json({ error: "OneSignal env vars not configured" });
  }

  // ── Build notification content per type ───────────────────────────────────
  const messages = {
    new_event: {
      heading: "New OT Event Posted",
      content: `${event?.title} — ${event?.date} ${event?.time}. Tap to sign up.`,
    },
    event_reminder_24h: {
      heading: "Shift Reminder — Tomorrow",
      content: `${event?.title} is tomorrow at ${event?.time}. Tap to view details.`,
    },
    event_reminder_2h: {
      heading: "Starting in 2 Hours",
      content: `${event?.title} starts at ${event?.time}. Make sure you're on your way.`,
    },
    request_approved: {
      heading: "Request Approved",
      content: `Your cancel request for ${event?.title} has been approved.`,
    },
    request_denied: {
      heading: "Request Denied",
      content: `Your cancel request for ${event?.title} was denied. You remain assigned.`,
    },
    waitlist_promoted: {
      heading: "You're Confirmed!",
      content: `A slot opened — you've been confirmed for ${event?.title} on ${event?.date}.`,
    },
    event_canceled: {
      heading: "Event Canceled",
      content: `${event?.title} on ${event?.date} has been canceled. Your slot is released.`,
    },
  };

  const msg = messages[type];
  if (!msg) return res.status(400).json({ error: `Unknown type: ${type}` });

  // ── Build OneSignal payload ────────────────────────────────────────────────
  const payload = {
    app_id: process.env.ONESIGNAL_APP_ID,
    headings: { en: msg.heading },
    contents: { en: msg.content },
    url: appUrl,
    chrome_web_icon: `${appUrl}/logo192.png`,
    firefox_icon: `${appUrl}/logo192.png`,
    // Target specific officer by badge tag, or all officers
    ...(targetAll
      ? { included_segments: ["Total Subscriptions"] }
      : { filters: [{ field: "tag", key: "badge", relation: "=", value: officer?.badge }] }
    ),
  };

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.ONESIGNAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id, type, recipients: data.recipients });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
