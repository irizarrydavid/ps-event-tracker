// api/notify.js — Microsoft Graph API email notification proxy
// Use this version if CUNY has Microsoft 365 / Azure AD already configured.
//
// REQUIRED ENVIRONMENT VARIABLES IN VERCEL:
// AZURE_TENANT_ID      — Found in Azure AD > Overview > Tenant ID
// AZURE_CLIENT_ID      — Found in Azure AD > App registrations > your app > Application (client) ID
// AZURE_CLIENT_SECRET  — Found in Azure AD > App registrations > your app > Certificates & secrets
// FROM_EMAIL           — The Microsoft 365 mailbox to send from (e.g. publicsafety@baruch.cuny.edu)
//
// AZURE AD SETUP (IT must do this once):
// 1. Go to portal.azure.com > Azure Active Directory > App registrations > New registration
// 2. Name it "CUNY PS Event Tracker Notifications"
// 3. Under API permissions > Add permission > Microsoft Graph > Application > Mail.Send
// 4. Grant admin consent
// 5. Create a client secret under Certificates & secrets
// 6. Copy Tenant ID, Client ID, and Client Secret into Vercel environment variables

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

  const { type, officer, event, reason, appUrl = "https://ps-event-tracker.vercel.app" } = body;
  if (!type || !officer?.email) return res.status(400).json({ error: "Missing type or officer email" });

  const { AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, FROM_EMAIL } = process.env;
  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !FROM_EMAIL) {
    return res.status(500).json({ error: "Missing Azure AD environment variables" });
  }

  // ── Step 1: Get access token from Azure AD ────────────────────────────────
  let accessToken;
  try {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type:    "client_credentials",
          client_id:     AZURE_CLIENT_ID,
          client_secret: AZURE_CLIENT_SECRET,
          scope:         "https://graph.microsoft.com/.default",
        }),
      }
    );
    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return res.status(401).json({ error: `Azure token error: ${err}` });
    }
    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
  } catch (err) {
    return res.status(500).json({ error: `Failed to get Azure token: ${err.message}` });
  }

  // ── Step 2: Build email templates ─────────────────────────────────────────
  const templates = {

    new_event: {
      subject: `New OT Event Posted: ${event?.title}`,
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
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">Sign Up Now →</a>
            </div>
            <p style="color:#94A3B8;font-size:12px;margin:0;">Slots fill up fast. Log in to secure your spot before the event is full.</p>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },

    event_canceled: {
      subject: `Event Canceled: ${event?.title}`,
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
            <p style="color:#334155;font-size:14px;">You were assigned to this event. Your slot has been automatically released — no action needed.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">Browse Other Events →</a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },

    request_approved: {
      subject: `Request Approved: ${event?.title}`,
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
            <p style="color:#334155;font-size:14px;">Your ${reason === "slot-release" ? "slot release" : "cancellation"} request for <b>${event?.title}</b> has been approved. You are no longer assigned to this event.</p>
            <div style="text-align:center;margin:24px 0;">
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">Browse Open Events →</a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },

    request_denied: {
      subject: `Request Denied: ${event?.title}`,
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
              <a href="${appUrl}" style="background:#1D4ED8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">View My Schedule →</a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },

    waitlist_promoted: {
      subject: `You're Confirmed: ${event?.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #E2E8F0;">
          <div style="background:#0D2547;padding:24px 28px;">
            <div style="color:#D4A017;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:6px;">CUNY PUBLIC SAFETY DEPARTMENT</div>
            <div style="color:#fff;font-size:22px;font-weight:800;">You've Been Confirmed!</div>
            <div style="color:#93C5FD;font-size:13px;margin-top:4px;">Bernard Baruch College</div>
          </div>
          <div style="padding:28px;">
            <p style="color:#334155;font-size:15px;margin:0 0 20px;">Hi <b>${officer.name.split(" ")[0]}</b>,</p>
            <p style="color:#334155;font-size:14px;margin:0 0 20px;">A slot opened up and you've been automatically confirmed from the waitlist!</p>
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
              <a href="${appUrl}" style="background:#059669;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;display:inline-block;">View My Schedule →</a>
            </div>
          </div>
          <div style="background:#F8FAFC;padding:16px 28px;border-top:1px solid #E2E8F0;">
            <p style="color:#94A3B8;font-size:11px;margin:0;">CUNY Public Safety — Bernard Baruch College | Automated notification. Do not reply.</p>
          </div>
        </div>`,
    },
  };

  const template = templates[type];
  if (!template) return res.status(400).json({ error: `Unknown notification type: ${type}` });

  // ── Step 3: Send email via Microsoft Graph API ────────────────────────────
  try {
    const graphRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${FROM_EMAIL}/sendMail`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject: template.subject,
            body: { contentType: "HTML", content: template.html },
            toRecipients: [{ emailAddress: { address: officer.email, name: officer.name } }],
            from: { emailAddress: { address: FROM_EMAIL, name: "CUNY Public Safety" } },
          },
          saveToSentItems: false,
        }),
      }
    );

    if (!graphRes.ok) {
      const err = await graphRes.text();
      return res.status(graphRes.status).json({ error: err });
    }

    return res.status(200).json({ success: true, type, to: officer.email, provider: "Microsoft Graph" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
