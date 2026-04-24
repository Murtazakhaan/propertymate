import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const fmt = (n: number | null | undefined, prefix = "", suffix = "") =>
  n == null ? "—" : `${prefix}${typeof n === "number" ? n.toLocaleString() : n}${suffix}`;

const fmtPrice = (n: number | null | undefined) =>
  n == null ? "—" : `$${(n / 1000).toFixed(0)}k`;

function buildHtml(suburb: any, listings: any[], userEmail: string | null) {
  const date = new Date().toLocaleDateString("en-AU", {
    day: "numeric", month: "long", year: "numeric",
  });

  const listingRows = listings
    .map((l) => `
      <tr>
        <td>${l.search_label ?? `${l.bedrooms ?? "?"}-bed ${l.property_type ?? ""}`}</td>
        <td>${l.bedrooms ?? "—"} / ${l.bathrooms ?? "—"}</td>
        <td>${fmtPrice(l.price_min)}–${fmtPrice(l.price_max)}</td>
        <td>
          ${l.realestate_url ? `<a href="${l.realestate_url}">realestate.com.au</a>` : ""}
          ${l.realestate_url && l.domain_url ? " · " : ""}
          ${l.domain_url ? `<a href="${l.domain_url}">Domain</a>` : ""}
        </td>
      </tr>
    `).join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<title>PropertyMate Report — ${suburb.suburb_name}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1f36; line-height: 1.5; font-size: 11pt; }
  .cover { text-align: center; padding: 60px 0 80px; border-bottom: 4px solid #2563EB; margin-bottom: 32px; page-break-after: always; }
  .cover .brand { font-size: 14pt; font-weight: 800; color: #2563EB; letter-spacing: 1px; }
  .cover h1 { font-size: 36pt; margin: 24px 0 8px; line-height: 1.1; }
  .cover .meta { color: #6b7280; font-size: 11pt; margin-top: 32px; }
  h2 { color: #2563EB; font-size: 16pt; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; }
  h3 { font-size: 12pt; margin: 20px 0 8px; color: #374151; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 12px 0; }
  .stat { background: #f3f4f6; border-radius: 8px; padding: 12px 14px; }
  .stat .label { font-size: 9pt; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat .value { font-size: 16pt; font-weight: 700; color: #111827; margin-top: 2px; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #dbeafe; color: #1e40af; font-size: 9pt; font-weight: 600; margin-right: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; }
  th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }
  a { color: #2563EB; text-decoration: none; }
  .narrative { background: #f9fafb; border-left: 3px solid #2563EB; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 12px 0; }
  .footer { margin-top: 48px; padding-top: 18px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 9pt; text-align: center; }
  .pillrow { margin: 8px 0 16px; }
  .section { page-break-inside: avoid; }
</style></head>
<body>
  <div class="cover">
    <div class="brand">PROPERTYMATE</div>
    <h1>${suburb.suburb_name}</h1>
    <div style="font-size: 16pt; color: #6b7280;">${suburb.state} ${suburb.postcode ?? ""}</div>
    <div class="meta">
      Suburb Profile Report<br/>
      Generated ${date}<br/>
      ${userEmail ? `Prepared for ${userEmail}` : ""}
    </div>
  </div>

  <div class="section">
    <h2>Suburb Snapshot</h2>
    <div class="pillrow">
      ${suburb.best_for_tag ? `<span class="badge">${suburb.best_for_tag}</span>` : ""}
      ${suburb.risk_level ? `<span class="badge">Risk: ${suburb.risk_level}</span>` : ""}
      ${suburb.confidence ? `<span class="badge">Confidence: ${suburb.confidence}</span>` : ""}
    </div>
    <div class="grid">
      <div class="stat"><div class="label">Median Price</div><div class="value">${fmtPrice(suburb.median_price)}</div></div>
      <div class="stat"><div class="label">Capital Growth</div><div class="value">${fmt(suburb.capital_growth_rate, "", "%")}</div></div>
      <div class="stat"><div class="label">Rental Yield</div><div class="value">${fmt(suburb.rental_yield, "", "%")}</div></div>
      <div class="stat"><div class="label">Vacancy Rate</div><div class="value">${fmt(suburb.vacancy_rate, "", "%")}</div></div>
      <div class="stat"><div class="label">Population Growth</div><div class="value">${fmt(suburb.population_growth, "", "%")}</div></div>
      <div class="stat"><div class="label">Days on Market</div><div class="value">${fmt(suburb.days_on_market)}</div></div>
    </div>
  </div>

  ${suburb.reasoning ? `
  <div class="section">
    <h2>Why This Suburb</h2>
    <div class="narrative">${suburb.reasoning}</div>
  </div>` : ""}

  <div class="section">
    <h2>Demographics & Population</h2>
    <div class="grid">
      <div class="stat"><div class="label">Total Population</div><div class="value">${fmt(suburb.population_total)}</div></div>
      <div class="stat"><div class="label">Median Age</div><div class="value">${fmt(suburb.median_age)}</div></div>
    </div>
    ${suburb.household_composition ? `<p><strong>Household composition:</strong> ${suburb.household_composition}</p>` : ""}
  </div>

  ${suburb.suburb_history ? `
  <div class="section">
    <h2>Suburb History</h2>
    <p>${suburb.suburb_history}</p>
  </div>` : ""}

  <div class="section">
    <h2>Infrastructure & Amenities</h2>
    <div class="grid">
      <div class="stat"><div class="label">Schools nearby</div><div class="value">${fmt(suburb.num_schools)}</div></div>
      <div class="stat"><div class="label">Train Station</div><div class="value">${suburb.has_train_station == null ? "—" : suburb.has_train_station ? "Yes" : "No"}</div></div>
    </div>
    ${suburb.nearest_hospital ? `<p><strong>Nearest hospital:</strong> ${suburb.nearest_hospital}</p>` : ""}
    ${suburb.nearest_shopping_centre ? `<p><strong>Nearest shopping centre:</strong> ${suburb.nearest_shopping_centre}</p>` : ""}
    ${suburb.crime_rate_level ? `<p><strong>Crime rate level:</strong> ${suburb.crime_rate_level}</p>` : ""}
    ${suburb.infrastructure_projects ? `<div class="narrative"><strong>Infrastructure projects:</strong> ${suburb.infrastructure_projects}</div>` : ""}
  </div>

  <div class="section">
    <h2>Market Performance</h2>
    <div class="grid">
      ${suburb.house_weekly_rent != null ? `<div class="stat"><div class="label">House weekly rent</div><div class="value">$${suburb.house_weekly_rent}</div></div>` : ""}
      ${suburb.unit_weekly_rent != null ? `<div class="stat"><div class="label">Unit weekly rent</div><div class="value">$${suburb.unit_weekly_rent}</div></div>` : ""}
      ${suburb.rental_range_low != null ? `<div class="stat"><div class="label">Weekly rent range</div><div class="value">$${suburb.rental_range_low}–$${suburb.rental_range_high ?? "?"}</div></div>` : ""}
      ${suburb.stamp_duty_estimate != null ? `<div class="stat"><div class="label">Stamp duty estimate</div><div class="value">${fmtPrice(suburb.stamp_duty_estimate)}</div></div>` : ""}
    </div>
  </div>

  ${suburb.weekly_out_of_pocket != null ? `
  <div class="section">
    <h2>Investment Maths</h2>
    <div class="stat" style="max-width: 280px;">
      <div class="label">Estimated weekly out-of-pocket</div>
      <div class="value">$${suburb.weekly_out_of_pocket}/wk</div>
    </div>
    <p style="color:#6b7280;font-size:10pt;">Based on indicative loan repayments minus rental income. Excludes maintenance, insurance, and management fees.</p>
  </div>` : ""}

  ${listings.length > 0 ? `
  <div class="section">
    <h2>Matching Listings</h2>
    <p style="color:#6b7280;font-size:10pt;">Live searches on realestate.com.au and Domain, deep-linked to your criteria.</p>
    <table>
      <thead><tr><th>Profile</th><th>Beds / Baths</th><th>Price band</th><th>Live searches</th></tr></thead>
      <tbody>${listingRows}</tbody>
    </table>
  </div>` : ""}

  <div class="footer">
    <p><strong>Data sources:</strong> Australian Bureau of Statistics, state infrastructure registers, realestate.com.au, Domain.</p>
    <p>Generated ${date} by PropertyMate. This report is general guidance only and does not constitute financial advice. Always consult a licensed professional.</p>
  </div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { suburb_result_id } = await req.json();
    if (!suburb_result_id) return jsonResponse({ error: "suburb_result_id required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Auth
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;
    if (authHeader) {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data.user?.id ?? null;
      userEmail = data.user?.email ?? null;
    }
    if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

    // Load suburb
    const { data: suburb, error } = await supabase
      .from("suburb_results")
      .select("*")
      .eq("id", suburb_result_id)
      .maybeSingle();
    if (error || !suburb) return jsonResponse({ error: "Suburb not found" }, 404);

    const { data: listings } = await supabase
      .from("property_listings")
      .select("*")
      .eq("suburb_result_id", suburb_result_id);

    // Lazy-fill demographics + history if missing (older rows)
    let enriched = suburb;
    const needsEnrichment =
      !suburb.population_total || !suburb.median_age || !suburb.household_composition || !suburb.suburb_history;

    if (needsEnrichment) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (LOVABLE_API_KEY) {
        try {
          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [{
                role: "user",
                content: `For the Australian suburb ${suburb.suburb_name}, ${suburb.state} ${suburb.postcode ?? ""}, return JSON with keys population_total (integer), median_age (integer), household_composition (short string like "60% renters, mostly young professionals"), suburb_history (2-3 sentences on origin, transformation, recent developments). Return ONLY valid JSON.`,
              }],
            }),
          });
          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const txt = aiData.choices?.[0]?.message?.content ?? "";
            const match = txt.match(/\{[\s\S]*\}/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              enriched = { ...suburb, ...parsed };
              await supabase.from("suburb_results").update(parsed).eq("id", suburb_result_id);
            }
          }
        } catch (e) {
          console.error("Enrichment failed (non-fatal):", e);
        }
      }
    }

    const html = buildHtml(enriched, listings ?? [], userEmail);

    // Drop a "report ready" notification
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "report_ready",
      title: `Suburb report ready: ${suburb.suburb_name}`,
      body: `Your PropertyMate profile report for ${suburb.suburb_name}, ${suburb.state} has been generated.`,
      link: "/results",
      suburb_result_id,
    }).catch((e) => console.error("Notif insert failed:", e));

    // Return HTML — browser prints to PDF via window.print() as a fallback.
    // For a true PDF we'd need a headless renderer; serving printable HTML
    // lets the user save as PDF directly from the browser dialog.
    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="PropertyMate-${suburb.suburb_name.replace(/\s+/g, "-")}-Report.html"`,
      },
    });
  } catch (e) {
    console.error("generate-suburb-report error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
