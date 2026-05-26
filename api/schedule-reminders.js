// ═══════════════════════════════════════════════════════════════════════════════
// REMINDER SCHEDULER — api/schedule-reminders.js
// ═══════════════════════════════════────────────────────────────────────────────
//
// WHAT THIS DOES:
// A Vercel serverless function that IT runs on a schedule (e.g. every hour via
// Vercel Cron or a Supabase scheduled function). It checks for upcoming events
// and sends both email AND push notifications to confirmed officers at:
//   - 24 hours before the event
//   - 2 hours before the event
//
// REQUIRES:
// - Supabase backend (officers, events, signups tables)
// - SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel env vars
// - ONESIGNAL_APP_ID and ONESIGNAL_API_KEY in Vercel env vars
// - SENDGRID_API_KEY (or AZURE vars) in Vercel env vars
//
// TO SCHEDULE THIS IN VERCEL:
// Add a vercel.json file to your repo root:
// {
//   "crons": [{ "path": "/api/schedule-reminders", "schedule": "0 * * * *" }]
// }
// This runs the function every hour on the hour.
//
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Allow manual trigger via GET for testing, or scheduled POST from Vercel Cron
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const APP_URL = process.env.APP_URL || "https://ps-event-tracker.vercel.app";
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in2h  = new Date(now.getTime() +  2 * 60 * 60 * 1000);

  const results = { sent_24h: [], sent_2h: [], errors: [] };

  try {
    // ── 1. Fetch upcoming events from Supabase ────────────────────────────────
    // Replace with your actual Supabase project URL and service key
    const eventsRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/events?status=eq.OPEN&select=*`,
      { headers: {
        "apikey": process.env.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      }}
    );
    const events = await eventsRes.json();

    for (const event of events) {
      // Parse event datetime (combine date + time start)
      const eventStart = parseEventDateTime(event.date, event.time);
      if (!eventStart) continue;

      const hoursUntil = (eventStart - now) / 3600000;

      // ── 2. Check if we should send 24h reminder (between 24h and 23h away) ─
      if (hoursUntil <= 24 && hoursUntil > 23) {
        await sendRemindersForEvent(event, "event_reminder_24h", APP_URL, results);
      }

      // ── 3. Check if we should send 2h reminder (between 2h and 1h away) ────
      if (hoursUntil <= 2 && hoursUntil > 1) {
        await sendRemindersForEvent(event, "event_reminder_2h", APP_URL, results);
      }
    }

    return res.status(200).json({
      success: true,
      checked: events.length,
      sent_24h: results.sent_24h.length,
      sent_2h: results.sent_2h.length,
      errors: results.errors.length,
      timestamp: now.toISOString(),
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ── Fetch confirmed officers for an event and send both email + push ──────────
async function sendRemindersForEvent(event, type, appUrl, results) {
  try {
    // Get all confirmed officers for this event from Supabase
    const signupsRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/signups?event_id=eq.${event.id}&select=officer_id,officers(name,email,badge)`,
      { headers: {
        "apikey": process.env.SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      }}
    );
    const signups = await signupsRes.json();

    for (const signup of signups) {
      const officer = signup.officers;
      if (!officer?.email) continue;

      // Send email reminder
      await fetch(`${appUrl}/api/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, officer, event, appUrl }),
      });

      // Send push notification
      await fetch(`${appUrl}/api/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, officer, event, appUrl }),
      });

      const bucket = type === "event_reminder_24h" ? results.sent_24h : results.sent_2h;
      bucket.push({ officer: officer.badge, event: event.title });
    }
  } catch (err) {
    results.errors.push({ event: event.title, error: err.message });
  }
}

// ── Parse event date string + time range into a JS Date ──────────────────────
function parseEventDateTime(dateStr, timeRange) {
  try {
    // timeRange format: "0800-1600" — we use the start time
    const startTime = timeRange?.split("-")[0];
    if (!startTime || startTime.length !== 4) return null;
    const hours   = parseInt(startTime.slice(0, 2));
    const minutes = parseInt(startTime.slice(2, 4));
    // dateStr format: "May 14" — parse with current year
    const parsed = new Date(`${dateStr} 2026 ${hours}:${minutes}:00`);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch { return null; }
}
