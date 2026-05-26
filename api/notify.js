// api/notify.js — SendGrid email notification proxy
// Deploy this file to your GitHub repo at api/notify.js

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

  const { type, officer, event, reason, status, appUrl = "https://ps-event-tracker.vercel.app" } = body;
  if (!type || !officer?.email) return res.status(400).json({ error: "Missing type or officer email" });
  if (!process.env.SENDGRID_API_KEY) return res.status(500).json({ error: "SENDGRID_API_KEY not configured" });

  // ── Email templates ────────────────────────────────────────────────────────
  const templates = {

    new_event: {
      subject: `🚨 New OT Event Posted: ${event?.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
          <div style="background:#0D2547;padding:24px 28px;">
            <div style="color:#D4A017;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">CUNY PUBLIC SAFETY DEPARTMENT</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">New OT Event Available</div>
            <div style="color:#93C5FD;font-size:13px;margin-top:4px;">Bernard Baruch College</div>
          </div>
          <div style="padding:28px;">
            <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <b>${officer.name.split(" ")[0]}</b>,</p>
            <p style="color:#334155;font-size:14px;margin:0 0 20px;">A new overtime event has been posted and is available for sign-up.</p>
            <div style="background:#F1F5F9;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #1D4ED8;">
              <div style="font-size:18px;font-weight:800;color:#0F172A;margin-bottom:12px;">${event?.title}</div>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;width:100px;">Date</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.date}</td></tr>
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Time</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.time}</td></tr>
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Type</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.type}</td></tr>
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Slots</td><td style="color:#059669;font-size:13px;font-weight:800;">${event?.slots - event?.filled} of ${event?.slots} available</td></tr>
                ${event?.hold ? '<tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Hold</td><td style="color:#D97706;font-size:13px;font-weight:600;">72-hour hold applies after approval</td></tr>' : ''}
              </table>
            </div>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
                Sign Up Now →
              </a>
            </div>
            <p style="color:#94A3B8;font-size:12px;margin:0;">Slots fill up fast. Log in to secure your spot before the event is full.</p>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety Department — Bernard Baruch College | This is an automated notification. Do not reply to this email.</p>
          </div>
        </div>`,
    },

    event_canceled: {
      subject: `⚠️ Event Canceled: ${event?.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
          <div style="background:#0D2547;padding:24px 28px;">
            <div style="color:#D4A017;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">CUNY PUBLIC SAFETY DEPARTMENT</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">Event Canceled</div>
            <div style="color:#93C5FD;font-size:13px;margin-top:4px;">Bernard Baruch College</div>
          </div>
          <div style="padding:28px;">
            <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <b>${officer.name.split(" ")[0]}</b>,</p>
            <div style="background:#FEF2F2;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #DC2626;">
              <div style="color:#DC2626;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:8px;">EVENT CANCELED</div>
              <div style="font-size:17px;font-weight:800;color:#0F172A;">${event?.title}</div>
              <div style="color:#64748B;font-size:13px;margin-top:6px;">${event?.date} · ${event?.time}</div>
            </div>
            <p style="color:#334155;font-size:14px;">You were assigned to this event. Your slot has been automatically released — no further action is needed on your part.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
                Browse Other Events →
              </a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety Department — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },

    request_approved: {
      subject: `✅ Request Approved: ${event?.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
          <div style="background:#0D2547;padding:24px 28px;">
            <div style="color:#D4A017;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">CUNY PUBLIC SAFETY DEPARTMENT</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">${reason === "slot-release" ? "Slot Release Approved" : "Cancellation Approved"}</div>
            <div style="color:#93C5FD;font-size:13px;margin-top:4px;">Bernard Baruch College</div>
          </div>
          <div style="padding:28px;">
            <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <b>${officer.name.split(" ")[0]}</b>,</p>
            <div style="background:#F0FDF4;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #059669;">
              <div style="color:#059669;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:8px;">REQUEST APPROVED</div>
              <div style="font-size:17px;font-weight:800;color:#0F172A;">${event?.title}</div>
              <div style="color:#64748B;font-size:13px;margin-top:6px;">${event?.date} · ${event?.time}</div>
            </div>
            <p style="color:#334155;font-size:14px;">Your ${reason === "slot-release" ? "slot release" : "cancellation"} request for <b>${event?.title}</b> has been approved by your supervisor. You are no longer assigned to this event.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
                Browse Open Events →
              </a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety Department — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },

    request_denied: {
      subject: `❌ Request Denied: ${event?.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
          <div style="background:#0D2547;padding:24px 28px;">
            <div style="color:#D4A017;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">CUNY PUBLIC SAFETY DEPARTMENT</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">Request Denied</div>
            <div style="color:#93C5FD;font-size:13px;margin-top:4px;">Bernard Baruch College</div>
          </div>
          <div style="padding:28px;">
            <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <b>${officer.name.split(" ")[0]}</b>,</p>
            <div style="background:#FEF2F2;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #DC2626;">
              <div style="color:#DC2626;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:8px;">REQUEST DENIED</div>
              <div style="font-size:17px;font-weight:800;color:#0F172A;">${event?.title}</div>
              <div style="color:#64748B;font-size:13px;margin-top:6px;">${event?.date} · ${event?.time}</div>
            </div>
            <p style="color:#334155;font-size:14px;">Your ${reason === "slot-release" ? "slot release" : "cancellation"} request for <b>${event?.title}</b> has been denied. You remain assigned to this event.</p>
            <p style="color:#334155;font-size:14px;">If you have questions, please contact your supervisor directly.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
                View My Schedule →
              </a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety Department — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },


    event_reminder_24h: {
      subject: `Reminder Tomorrow: ${event?.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
          <div style="background:#0D2547;padding:24px 28px;">
            <div style="color:#D4A017;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">CUNY PUBLIC SAFETY DEPARTMENT</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">Shift Reminder — Tomorrow</div>
            <div style="color:#93C5FD;font-size:13px;margin-top:4px;">Bernard Baruch College</div>
          </div>
          <div style="padding:28px;">
            <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <b>${officer.name.split(" ")[0]}</b>,</p>
            <p style="color:#334155;font-size:14px;margin:0 0 20px;">This is a reminder that you are scheduled for an overtime assignment <b>tomorrow</b>. Please review the details below.</p>
            <div style="background:#F1F5F9;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #1D4ED8;">
              <div style="font-size:18px;font-weight:800;color:#0F172A;margin-bottom:12px;">${event?.title}</div>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;width:100px;">Date</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.date}</td></tr>
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Time</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.time}</td></tr>
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Type</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.type}</td></tr>
              </table>
            </div>
            <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
              <div style="font-size:13px;color:#92400E;font-weight:600;">If you are unable to work this assignment, submit a cancel request through the app immediately.</div>
            </div>
            <div style="text-align:center;">
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">Open App</a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },

    event_reminder_2h: {
      subject: `Starting in 2 Hours: ${event?.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
          <div style="background:#059669;padding:24px 28px;">
            <div style="color:#D1FAE5;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">CUNY PUBLIC SAFETY DEPARTMENT</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">Starting in 2 Hours</div>
            <div style="color:#A7F3D0;font-size:13px;margin-top:4px;">Bernard Baruch College</div>
          </div>
          <div style="padding:28px;">
            <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <b>${officer.name.split(" ")[0]}</b>,</p>
            <p style="color:#334155;font-size:14px;margin:0 0 20px;">Your overtime assignment starts in <b>2 hours</b>. Please ensure you are prepared and on your way.</p>
            <div style="background:#F0FDF4;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #059669;">
              <div style="font-size:18px;font-weight:800;color:#0F172A;margin-bottom:12px;">${event?.title}</div>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;width:100px;">Time</td><td style="color:#059669;font-size:15px;font-weight:800;">${event?.time}</td></tr>
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Type</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.type}</td></tr>
              </table>
            </div>
            <div style="text-align:center;">
              <a href="${appUrl}" style="background:#059669;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">View My Schedule</a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },

    waitlist_promoted: {
      subject: `🎉 You're Confirmed: ${event?.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
          <div style="background:#0D2547;padding:24px 28px;">
            <div style="color:#D4A017;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">CUNY PUBLIC SAFETY DEPARTMENT</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">You've Been Confirmed!</div>
            <div style="color:#93C5FD;font-size:13px;margin-top:4px;">Bernard Baruch College</div>
          </div>
          <div style="padding:28px;">
            <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <b>${officer.name.split(" ")[0]}</b>,</p>
            <p style="color:#334155;font-size:14px;margin:0 0 20px;">Great news — a slot opened up and you've been automatically confirmed from the waitlist!</p>
            <div style="background:#F0FDF4;border-radius:10px;padding:20px;margin-bottom:24px;border-left:4px solid #059669;">
              <div style="color:#059669;font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:8px;">CONFIRMED FROM WAITLIST</div>
              <div style="font-size:18px;font-weight:800;color:#0F172A;margin-bottom:12px;">${event?.title}</div>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;width:100px;">Date</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.date}</td></tr>
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Time</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.time}</td></tr>
                <tr><td style="padding:5px 0;color:#64748B;font-size:13px;">Type</td><td style="color:#0F172A;font-size:13px;font-weight:600;">${event?.type}</td></tr>
              </table>
            </div>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}" style="background:#059669;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">
                View My Schedule →
              </a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety Department — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },
  };

  const template = templates[type];
  if (!template) return res.status(400).json({ error: `Unknown notification type: ${type}` });

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: officer.email, name: officer.name }] }],
        from: { email: process.env.FROM_EMAIL || "noreply@baruch-publicsafety.cuny.edu", name: "CUNY Public Safety" },
        subject: template.subject,
        content: [{ type: "text/html", value: template.html }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    return res.status(200).json({ success: true, type, to: officer.email });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
