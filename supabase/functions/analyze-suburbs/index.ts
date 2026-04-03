import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      goal,
      budget_min,
      budget_max,
      budget_unknown,
      income,
      deposit,
      has_existing_home,
      open_to_interstate,
      home_age_preference,
      risk_growth_preference,
      timeline,
      user_id,
    } = await req.json();

    // Validate required fields
    if (!goal || !timeline) {
      return jsonResponse({ error: "goal and timeline are required" }, 400);
    }

    // 1. Save quiz submission
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: submission, error: insertError } = await supabaseAdmin
      .from("quiz_submissions")
      .insert({
        goal,
        budget_min,
        budget_max,
        budget_unknown: budget_unknown ?? false,
        income,
        deposit,
        has_existing_home,
        open_to_interstate: open_to_interstate ?? false,
        home_age_preference,
        risk_growth_preference: risk_growth_preference ?? 50,
        timeline,
        user_id: user_id || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return jsonResponse({ error: "Failed to save quiz submission" }, 500);
    }

    const submissionId = submission.id;

    // 2. Build AI prompt
    const budgetInfo = budget_unknown
      ? "Budget unknown — estimate based on income and deposit."
      : `Budget range: $${budget_min?.toLocaleString() ?? "?"} – $${budget_max?.toLocaleString() ?? "?"}`;

    const prompt = `You are an Australian property investment analyst. Based on the following buyer profile, recommend exactly 5 Australian suburbs that best match their criteria. Use real suburb names and realistic current market data.

BUYER PROFILE:
- Goal: ${goal === "first-home" ? "First home buyer" : goal === "investment" ? "Investment property" : "Not sure yet"}
- ${budgetInfo}
- Annual income: $${income?.toLocaleString() ?? "not provided"}
- Deposit saved: $${deposit?.toLocaleString() ?? "not provided"}
- Already owns a home: ${has_existing_home === true ? "Yes" : has_existing_home === false ? "No" : "Not specified"}
- Open to interstate: ${open_to_interstate ? "Yes" : "No"}
- Home age preference: ${home_age_preference ?? "No preference"}
- Risk tolerance: ${risk_growth_preference ?? 50}/100 (0 = conservative, 100 = high growth)
- Timeline: ${timeline}

For each suburb provide realistic Australian market data. Match scores should reflect how well the suburb aligns with the buyer's specific profile.`;

    // 3. Call Lovable AI with structured output
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return jsonResponse({ error: "AI service not configured" }, 500);
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are an expert Australian property analyst. Return structured suburb recommendations using the provided tool.",
            },
            { role: "user", content: prompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "recommend_suburbs",
                description:
                  "Return 5 suburb recommendations with market data and match analysis",
                parameters: {
                  type: "object",
                  properties: {
                    suburbs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          suburb_name: { type: "string" },
                          state: {
                            type: "string",
                            enum: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"],
                          },
                          postcode: { type: "string" },
                          match_score: {
                            type: "integer",
                            description: "0-100 match score",
                          },
                          risk_level: {
                            type: "string",
                            enum: ["low", "medium", "high"],
                          },
                          median_price: {
                            type: "integer",
                            description: "Median house price in AUD",
                          },
                          rental_yield: {
                            type: "number",
                            description: "Gross rental yield percentage",
                          },
                          vacancy_rate: {
                            type: "number",
                            description: "Vacancy rate percentage",
                          },
                          population_growth: {
                            type: "number",
                            description: "Annual population growth percentage",
                          },
                          days_on_market: {
                            type: "integer",
                            description: "Average days on market",
                          },
                          rental_range_low: {
                            type: "integer",
                            description: "Weekly rent low end in AUD",
                          },
                          rental_range_high: {
                            type: "integer",
                            description: "Weekly rent high end in AUD",
                          },
                          weekly_out_of_pocket: {
                            type: "integer",
                            description:
                              "Estimated weekly out-of-pocket cost after rent for investors",
                          },
                          best_for_tag: {
                            type: "string",
                            description:
                              "Short tag like 'Best Yield', 'Best Growth', 'Most Affordable', 'Lowest Risk', 'Best Overall'",
                          },
                          confidence: {
                            type: "string",
                            enum: ["low", "medium", "high"],
                          },
                          reasoning: {
                            type: "string",
                            description:
                              "2-3 sentence explanation of why this suburb matches the buyer",
                          },
                        },
                        required: [
                          "suburb_name",
                          "state",
                          "postcode",
                          "match_score",
                          "risk_level",
                          "median_price",
                          "rental_yield",
                          "vacancy_rate",
                          "days_on_market",
                          "rental_range_low",
                          "rental_range_high",
                          "best_for_tag",
                          "confidence",
                          "reasoning",
                        ],
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
          tool_choice: {
            type: "function",
            function: { name: "recommend_suburbs" },
          },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return jsonResponse({ error: "AI rate limit exceeded. Please try again shortly." }, 429);
      }
      if (aiResponse.status === 402) {
        return jsonResponse({ error: "AI credits exhausted. Please contact support." }, 402);
      }
      return jsonResponse({ error: "AI analysis failed" }, 500);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response:", JSON.stringify(aiData));
      return jsonResponse({ error: "AI returned unexpected format" }, 500);
    }

    const { suburbs } = JSON.parse(toolCall.function.arguments);

    // 4. Save results to DB
    const suburbRows = suburbs.map((s: any) => ({
      quiz_submission_id: submissionId,
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
      best_for_tag: s.best_for_tag,
      confidence: s.confidence,
      reasoning: s.reasoning,
    }));

    const { data: savedResults, error: resultsError } = await supabaseAdmin
      .from("suburb_results")
      .insert(suburbRows)
      .select();

    if (resultsError) {
      console.error("Results insert error:", resultsError);
      return jsonResponse({ error: "Failed to save results" }, 500);
    }

    return jsonResponse({
      submission_id: submissionId,
      results: savedResults,
    });
  } catch (e) {
    console.error("analyze-suburbs error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500
    );
  }
});
