import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface AlertPayload {
  user_id: string;
  type?: string; // new_match | listing_alert | report_ready | system
  title: string;
  body?: string;
  link?: string;
  suburb_result_id?: string;
}

async function sendSms(toE164: string, body: string) {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from = Deno.env.get("TWILIO_FROM_NUMBER");
  if (!sid || !token || !from) {
    console.log("Twilio not configured — skipping SMS");
    return { skipped: true };
  }
  const auth = btoa(`${sid}:${token}`);
  const params = new URLSearchParams({ To: toE164, From: from, Body: body });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Twilio error:", res.status, txt);
    return { error: txt };
  }
  return { ok: true };
}

async function sendEmail(toEmail: string, subject: string, html: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!apiKey || !from) {
    console.log("Resend not configured — skipping email");
    return { skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: toEmail, subject, html }),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Resend error:", res.status, txt);
    return { error: txt };
  }
  return { ok: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload: AlertPayload = await req.json();
    if (!payload.user_id || !payload.title) {
      return jsonResponse({ error: "user_id and title are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Load user's prefs
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", payload.user_id)
      .maybeSingle();

    // Default prefs if none stored
    const inappEnabled = prefs?.inapp_enabled ?? true;
    const emailEnabled = prefs?.email_enabled ?? true;
    const smsEnabled = prefs?.sms_enabled ?? false;
    const phone = prefs?.phone_e164 ?? null;

    const channels: Record<string, unknown> = {};

    // 1. In-app
    if (inappEnabled) {
      const { error } = await supabase.from("notifications").insert({
        user_id: payload.user_id,
        type: payload.type ?? "system",
        title: payload.title,
        body: payload.body ?? null,
        link: payload.link ?? null,
        suburb_result_id: payload.suburb_result_id ?? null,
      });
      channels.inapp = error ? { error: error.message } : { ok: true };
    }

    // 2. Email — pull user's email from auth
    if (emailEnabled) {
      const { data: userData } = await supabase.auth.admin.getUserById(payload.user_id);
      const email = userData?.user?.email;
      if (email) {
        const html = `
          <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1a1a1a; margin: 0 0 12px;">${payload.title}</h2>
            <p style="color: #555; line-height: 1.5;">${payload.body ?? ""}</p>
            ${payload.link ? `<p><a href="https://propertymate.app${payload.link}" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#2563EB;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">View in PropertyMate</a></p>` : ""}
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="font-size:12px;color:#999;">PropertyMate — your digital property strategist.</p>
          </div>`;
        channels.email = await sendEmail(email, payload.title, html);
      } else {
        channels.email = { skipped: true, reason: "no email" };
      }
    }

    // 3. SMS
    if (smsEnabled && phone) {
      const text = `PropertyMate: ${payload.title}${payload.body ? ` — ${payload.body}` : ""}${payload.link ? ` https://propertymate.app${payload.link}` : ""}`;
      channels.sms = await sendSms(phone, text);
    } else if (smsEnabled) {
      channels.sms = { skipped: true, reason: "no phone number" };
    }

    return jsonResponse({ ok: true, channels });
  } catch (e) {
    console.error("send-alert error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
