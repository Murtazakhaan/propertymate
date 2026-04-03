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

function buildOwnerOccupierPrompt(params: any) {
  const budgetInfo = params.budget_unknown
    ? "Budget unknown - estimate based on income and deposit."
    : `Budget range: $${params.budget_min?.toLocaleString() ?? "?"} - $${params.budget_max?.toLocaleString() ?? "?"}`;

  return `You are an Australian property analyst helping an owner occupier find a home to live in.

BUYER PROFILE:
- Goal: Owner Occupier (${params.is_first_home ? "First home buyer - eligible for stamp duty concessions" : "Not a first home buyer - full stamp duty applies"})
- ${budgetInfo}
- Annual income: $${params.income?.toLocaleString() ?? "not provided"}
- Deposit saved: $${params.deposit?.toLocaleString() ?? "not provided"}
- Open to interstate: ${params.open_to_interstate ? "Yes" : "No"}
- Home age preference: ${params.home_age_preference ?? "No preference"}
- Risk tolerance: ${params.risk_growth_preference ?? 50}/100
- Timeline: ${params.timeline}

For each suburb provide:
- Realistic Australian market data (median price, capital growth rate, population growth)
- Stamp duty estimate for that state (apply first home buyer concessions if applicable)
- Local amenities: nearest hospital name, number of schools within 5km, whether there's a train station, crime rate level (low/medium/high), nearest shopping centre name
- 5 realistic property listings matching the buyer's budget and preferences from that suburb (realistic addresses, prices in budget range, bedroom/bathroom counts, property type)

Match scores should reflect liveability, affordability, and amenity access.`;
}

function buildInvestorPrompt(params: any) {
  const budgetInfo = params.budget_unknown
    ? "Budget unknown - estimate based on income and deposit."
    : `Budget range: $${params.budget_min?.toLocaleString() ?? "?"} - $${params.budget_max?.toLocaleString() ?? "?"}`;

  const strategy = params.investor_strategy === "capital-growth"
    ? "Capital Growth - prioritise suburbs with highest growth potential"
    : "Rental Return - prioritise suburbs with best rental yields";

  let existingPropInfo = "";
  if (params.has_existing_home && params.existing_property_value) {
    existingPropInfo = `
- Existing property: ${params.existing_property_address || "Address not provided"}
- Estimated value: $${params.existing_property_value?.toLocaleString()}
- Remaining loan: $${params.existing_loan_amount?.toLocaleString() ?? "not provided"}`;
  }

  return `You are an Australian property investment analyst.

INVESTOR PROFILE:
- Strategy: ${strategy}
- ${budgetInfo}
- Annual income: $${params.income?.toLocaleString() ?? "not provided"}
- Deposit saved: $${params.deposit?.toLocaleString() ?? "not provided"}
- Already owns a home: ${params.has_existing_home ? "Yes" : "No"}${existingPropInfo}
- Open to interstate: ${params.open_to_interstate ? "Yes" : "No"}
- Home age preference: ${params.home_age_preference ?? "No preference"}
- Timeline: ${params.timeline}

For each suburb provide:
- ${params.investor_strategy === "capital-growth" ? "Focus on capital growth rate, population growth, and upcoming infrastructure" : "Focus on rental yield, vacancy rate, and rental income potential"}
- Stamp duty estimate for that state
- Infrastructure projects in the area that could boost property values
- Separate weekly rental return for houses and units (house_weekly_rent, unit_weekly_rent)
- 5 realistic investment property listings matching the budget (realistic addresses, prices, bedroom/bathroom counts, property type House or Unit, expected weekly rent)

Match scores should reflect ${params.investor_strategy === "capital-growth" ? "growth potential and infrastructure development" : "rental yield and tenant demand"}.`;
}

function buildNotSurePrompt(params: any) {
  const budgetInfo = params.budget_unknown
    ? "Budget unknown - estimate based on income and deposit."
    : `Budget range: $${params.budget_min?.toLocaleString() ?? "?"} - $${params.budget_max?.toLocaleString() ?? "?"}`;

  return `You are an Australian property analyst. The buyer is exploring options and isn't sure if they want to live in the property or invest.

BUYER PROFILE:
- Goal: Exploring options
- ${budgetInfo}
- Annual income: $${params.income?.toLocaleString() ?? "not provided"}
- Deposit saved: $${params.deposit?.toLocaleString() ?? "not provided"}
- Open to interstate: ${params.open_to_interstate ? "Yes" : "No"}
- Home age preference: ${params.home_age_preference ?? "No preference"}
- Risk tolerance: ${params.risk_growth_preference ?? 50}/100
- Timeline: ${params.timeline}

For each suburb provide well-rounded data covering both liveability and investment potential. Include capital growth, amenities, and 5 property listings.`;
}

function getToolSchema(goal: string) {
  const baseProperties: any = {
    suburb_name: { type: "string" },
    state: { type: "string", enum: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"] },
    postcode: { type: "string" },
    match_score: { type: "integer", description: "0-100 match score" },
    median_price: { type: "integer", description: "Median house price in AUD" },
    capital_growth_rate: { type: "number", description: "Annual capital growth percentage" },
    population_growth: { type: "number", description: "Annual population growth percentage" },
    best_for_tag: { type: "string", description: "Short tag like 'Best Growth', 'Most Affordable', 'Best Location', 'Best Overall'" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    reasoning: { type: "string", description: "2-3 sentence explanation of why this suburb matches" },
    listings: {
      type: "array",
      description: "5 property listings matching the buyer's budget",
      items: {
        type: "object",
        properties: {
          address: { type: "string" },
          price: { type: "integer" },
          bedrooms: { type: "integer" },
          bathrooms: { type: "integer" },
          property_type: { type: "string", description: "e.g. House, Unit, Townhouse, Apartment" },
        },
        required: ["address", "price", "bedrooms", "bathrooms", "property_type"],
        additionalProperties: false,
      },
    },
  };

  const baseRequired = ["suburb_name", "state", "postcode", "match_score", "median_price", "capital_growth_rate", "population_growth", "best_for_tag", "confidence", "reasoning", "listings"];

  if (goal === "first-home") {
    // Owner occupier: amenities + stamp duty
    Object.assign(baseProperties, {
      stamp_duty_estimate: { type: "integer", description: "Estimated stamp duty in AUD (apply first home concessions if applicable)" },
      nearest_hospital: { type: "string", description: "Name of nearest hospital" },
      num_schools: { type: "integer", description: "Number of schools within 5km" },
      has_train_station: { type: "boolean", description: "Whether suburb has a train station" },
      crime_rate_level: { type: "string", enum: ["low", "medium", "high"] },
      nearest_shopping_centre: { type: "string", description: "Name of nearest shopping centre" },
    });
    baseRequired.push("stamp_duty_estimate", "nearest_hospital", "num_schools", "has_train_station", "crime_rate_level", "nearest_shopping_centre");
  } else if (goal === "investment") {
    // Investor: rental metrics + infrastructure + stamp duty + house/unit rent
    Object.assign(baseProperties, {
      stamp_duty_estimate: { type: "integer", description: "Estimated stamp duty in AUD" },
      rental_yield: { type: "number", description: "Gross rental yield percentage" },
      vacancy_rate: { type: "number", description: "Vacancy rate percentage" },
      days_on_market: { type: "integer", description: "Average days on market" },
      rental_range_low: { type: "integer", description: "Weekly rent low end in AUD" },
      rental_range_high: { type: "integer", description: "Weekly rent high end in AUD" },
      weekly_out_of_pocket: { type: "integer", description: "Estimated weekly out-of-pocket cost after rent" },
      infrastructure_projects: { type: "string", description: "Upcoming infrastructure projects in the area" },
      house_weekly_rent: { type: "integer", description: "Typical weekly rent for a house in AUD" },
      unit_weekly_rent: { type: "integer", description: "Typical weekly rent for a unit in AUD" },
    });
    baseRequired.push("stamp_duty_estimate", "rental_yield", "vacancy_rate", "infrastructure_projects", "house_weekly_rent", "unit_weekly_rent");
  } else {
    // Not sure: include a mix
    Object.assign(baseProperties, {
      rental_yield: { type: "number" },
      vacancy_rate: { type: "number" },
      nearest_hospital: { type: "string" },
      num_schools: { type: "integer" },
      has_train_station: { type: "boolean" },
      crime_rate_level: { type: "string", enum: ["low", "medium", "high"] },
      infrastructure_projects: { type: "string" },
    });
  }

  return {
    type: "function",
    function: {
      name: "recommend_suburbs",
      description: "Return 5 suburb recommendations with market data and analysis",
      parameters: {
        type: "object",
        properties: {
          suburbs: {
            type: "array",
            items: {
              type: "object",
              properties: baseProperties,
              required: baseRequired,
              additionalProperties: false,
            },
          },
        },
        required: ["suburbs"],
        additionalProperties: false,
      },
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params = await req.json();

    const {
      goal, timeline, user_id,
      budget_min, budget_max, budget_unknown, income, deposit,
      has_existing_home, open_to_interstate, home_age_preference,
      risk_growth_preference,
      is_first_home, existing_property_address, existing_property_value,
      existing_loan_amount, investor_strategy,
    } = params;

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
        is_first_home: is_first_home ?? null,
        existing_property_address: existing_property_address || null,
        existing_property_value: existing_property_value ?? null,
        existing_loan_amount: existing_loan_amount ?? null,
        investor_strategy: investor_strategy || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return jsonResponse({ error: "Failed to save quiz submission" }, 500);
    }

    const submissionId = submission.id;

    // 2. Build prompt based on goal
    let prompt: string;
    if (goal === "first-home") {
      prompt = buildOwnerOccupierPrompt(params);
    } else if (goal === "investment") {
      prompt = buildInvestorPrompt(params);
    } else {
      prompt = buildNotSurePrompt(params);
    }

    // 3. Call AI
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
              content: "You are an expert Australian property analyst. Return structured suburb recommendations using the provided tool. Use realistic Australian suburb names, postcodes, and market data.",
            },
            { role: "user", content: prompt },
          ],
          tools: [getToolSchema(goal)],
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
        return jsonResponse({ error: "Rate limit exceeded. Please try again shortly." }, 429);
      }
      if (aiResponse.status === 402) {
        return jsonResponse({ error: "Credits exhausted. Please contact support." }, 402);
      }
      return jsonResponse({ error: "Analysis failed" }, 500);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response:", JSON.stringify(aiData));
      return jsonResponse({ error: "Unexpected response format" }, 500);
    }

    const { suburbs } = JSON.parse(toolCall.function.arguments);

    // 4. Save results to DB
    const suburbRows = suburbs.map((s: any) => ({
      quiz_submission_id: submissionId,
      suburb_name: s.suburb_name,
      state: s.state,
      postcode: s.postcode,
      match_score: s.match_score,
      risk_level: s.risk_level ?? "medium",
      median_price: s.median_price,
      rental_yield: s.rental_yield ?? null,
      vacancy_rate: s.vacancy_rate ?? null,
      population_growth: s.population_growth,
      days_on_market: s.days_on_market ?? null,
      rental_range_low: s.rental_range_low ?? null,
      rental_range_high: s.rental_range_high ?? null,
      weekly_out_of_pocket: s.weekly_out_of_pocket ?? null,
      best_for_tag: s.best_for_tag,
      confidence: s.confidence,
      reasoning: s.reasoning,
      stamp_duty_estimate: s.stamp_duty_estimate ?? null,
      capital_growth_rate: s.capital_growth_rate ?? null,
      nearest_hospital: s.nearest_hospital ?? null,
      num_schools: s.num_schools ?? null,
      has_train_station: s.has_train_station ?? null,
      crime_rate_level: s.crime_rate_level ?? null,
      nearest_shopping_centre: s.nearest_shopping_centre ?? null,
      infrastructure_projects: s.infrastructure_projects ?? null,
      house_weekly_rent: s.house_weekly_rent ?? null,
      unit_weekly_rent: s.unit_weekly_rent ?? null,
    }));

    const { data: savedResults, error: resultsError } = await supabaseAdmin
      .from("suburb_results")
      .insert(suburbRows)
      .select();

    if (resultsError) {
      console.error("Results insert error:", resultsError);
      return jsonResponse({ error: "Failed to save results" }, 500);
    }

    // 5. Save property listings
    const allListings: any[] = [];
    for (const result of savedResults) {
      const matchingSuburb = suburbs.find((s: any) => s.suburb_name === result.suburb_name);
      if (matchingSuburb?.listings) {
        for (const listing of matchingSuburb.listings) {
          allListings.push({
            suburb_result_id: result.id,
            address: listing.address,
            price: listing.price,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            property_type: listing.property_type,
          });
        }
      }
    }

    if (allListings.length > 0) {
      const { error: listingsError } = await supabaseAdmin
        .from("property_listings")
        .insert(allListings);

      if (listingsError) {
        console.error("Listings insert error:", listingsError);
        // Non-fatal: results still valid
      }
    }

    // 6. Fetch listings to return with results
    const resultIds = savedResults.map((r: any) => r.id);
    const { data: listings } = await supabaseAdmin
      .from("property_listings")
      .select("*")
      .in("suburb_result_id", resultIds);

    return jsonResponse({
      submission_id: submissionId,
      results: savedResults,
      listings: listings ?? [],
    });
  } catch (e) {
    console.error("analyze-suburbs error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Unknown error" },
      500
    );
  }
});
