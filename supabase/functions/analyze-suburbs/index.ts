import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { submission_id, answers } = await req.json();

    if (!submission_id || !answers) {
      return new Response(
        JSON.stringify({ error: "submission_id and answers are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert Australian property investment analyst with deep knowledge of:
- Every suburb across all Australian states and territories
- Current median house prices, unit prices, and rental yields (as of early 2025)
- Vacancy rates, days on market, and population growth trends
- Major infrastructure projects from Infrastructure Australia, state government pipelines, and local council plans
- Government data sources including:
  * Infrastructure Australia (infrastructureaustralia.gov.au)
  * Infrastructure Pipeline (infrastructurepipeline.org)
  * NSW Infrastructure pipeline and data.nsw.gov.au
  * Victoria Major Projects Pipeline and Big Build projects
  * Queensland Infrastructure Pipeline and data.qld.gov.au
  * SA Major Developments Directory and DIT major projects
  * WA Pipeline of Works and Infrastructure WA
  * Tasmania Infrastructure Pipeline
  * NT Major Projects
  * ACT Major Projects
- REA Group (realestate.com.au) and Domain.com.au market data and trends
- First home buyer grants, stamp duty concessions, and government incentives by state
- Rental market dynamics, supply constraints, and demand drivers

When recommending suburbs, consider:
1. The user's budget and borrowing capacity
2. Infrastructure projects that will drive capital growth (rail, road, hospital, university, commercial precinct)
3. Supply-demand dynamics (vacancy rates, population growth, new dwelling approvals)
4. Rental yield and cash flow potential
5. Risk factors (oversupply, single-industry towns, flood/bushfire zones)
6. Market timing based on the user's timeline

Always provide realistic, data-informed recommendations. Use approximate but reasonable figures for median prices, yields, and growth rates. Prioritise suburbs where infrastructure investment signals future growth.`;

    const userPrompt = `Analyze and recommend the top 5 Australian suburbs for this buyer profile:

Goal: ${answers.goal === "first-home" ? "First home buyer" : answers.goal === "investment" ? "Investment property" : "Not sure yet"}
Budget: ${answers.budgetUnknown ? "Unknown — estimate from income" : `$${answers.budget?.toLocaleString() ?? "Not specified"}`}
${answers.income ? `Annual income: $${answers.income.toLocaleString()}` : ""}
${answers.deposit ? `Deposit saved: $${answers.deposit.toLocaleString()}` : ""}
Has existing home: ${answers.hasExistingHome === true ? "Yes" : answers.hasExistingHome === false ? "No" : "Not specified"}
Open to interstate: ${answers.interstateOpen ? "Yes" : "No"}
Home age preference: ${answers.homeAgePreference === "new" ? "New builds" : answers.homeAgePreference === "established" ? "Established homes" : "No preference"}
Risk tolerance: ${answers.riskTolerance}/100 (0 = conservative/low risk, 100 = aggressive/high growth)
Timeline: ${answers.timeline} months

For each suburb, provide detailed financial metrics and a clear reasoning for the recommendation. Consider nearby infrastructure projects that could drive growth.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_suburbs",
              description: "Return 5 suburb recommendations with financial metrics and reasoning",
              parameters: {
                type: "object",
                properties: {
                  suburbs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        suburb_name: { type: "string", description: "Suburb name" },
                        state: { type: "string", description: "State abbreviation (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)" },
                        postcode: { type: "string", description: "Postcode" },
                        match_score: { type: "integer", description: "Match score 0-100 based on how well it fits the buyer profile" },
                        risk_level: { type: "string", enum: ["low", "medium", "high"], description: "Risk level" },
                        median_price: { type: "integer", description: "Approximate median house/unit price in AUD" },
                        rental_yield: { type: "number", description: "Gross rental yield as percentage e.g. 4.5" },
                        vacancy_rate: { type: "number", description: "Vacancy rate as percentage e.g. 1.2" },
                        population_growth: { type: "number", description: "Annual population growth as percentage e.g. 2.1" },
                        days_on_market: { type: "integer", description: "Average days on market" },
                        rental_range_low: { type: "integer", description: "Low end of weekly rent in AUD" },
                        rental_range_high: { type: "integer", description: "High end of weekly rent in AUD" },
                        weekly_out_of_pocket: { type: "integer", description: "Estimated weekly out-of-pocket cost after rent (negative means positive cash flow)" },
                        reasoning: { type: "string", description: "2-3 sentence explanation of why this suburb is recommended, mentioning specific infrastructure projects if relevant" },
                        best_for_tag: { type: "string", description: "Short tag like 'Best Yield', 'Best Growth', 'Most Affordable', 'Best for First Home Buyers', 'Lowest Risk'" },
                        confidence: { type: "string", enum: ["low", "medium", "high"], description: "Confidence in the recommendation" },
                      },
                      required: ["suburb_name", "state", "postcode", "match_score", "risk_level", "median_price", "rental_yield", "vacancy_rate", "population_growth", "days_on_market", "rental_range_low", "rental_range_high", "weekly_out_of_pocket", "reasoning", "best_for_tag", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["suburbs"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_suburbs" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("AI did not return structured suburb data");
    }

    const { suburbs } = JSON.parse(toolCall.function.arguments);

    // Insert results into suburb_results using service role
    const inserts = suburbs.map((s: any) => ({
      quiz_submission_id: submission_id,
      suburb_name: s.suburb_name,
      state: s.state,
      postcode: s.postcode,
      match_score: s.match_score,
      risk_level: s.risk_level,
      median_price: s.median_price,
      rental_yield: s.rental_yield,
      vacancy_rate: s.vacancy_rate,
      population_growth: s.population_growth,
      days_on_market: s.days_on_market,
      rental_range_low: s.rental_range_low,
      rental_range_high: s.rental_range_high,
      weekly_out_of_pocket: s.weekly_out_of_pocket,
      reasoning: s.reasoning,
      best_for_tag: s.best_for_tag,
      confidence: s.confidence,
    }));

    const { data: insertedResults, error: insertError } = await supabase
      .from("suburb_results")
      .insert(inserts)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to save results: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, results: insertedResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-suburbs error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
