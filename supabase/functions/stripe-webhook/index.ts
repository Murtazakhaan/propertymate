import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" });
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    logStep("ERROR", { message: "No stripe-signature header" });
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    logStep("Signature verification failed", { error: String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  logStep("Event received", { type: event.type, id: event.id });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription || !session.customer_email) {
          logStep("Skipping non-subscription checkout");
          break;
        }

        // Find user by email
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const matchedUser = users?.users?.find(u => u.email === session.customer_email);
        if (!matchedUser) {
          logStep("No matching user for email", { email: session.customer_email });
          break;
        }

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const { error } = await supabaseAdmin.from("subscriptions").upsert({
          user_id: matchedUser.id,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: sub.id,
          status: sub.status,
          price_id: sub.items.data[0]?.price?.id ?? null,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        }, { onConflict: "stripe_subscription_id" });

        if (error) logStep("Upsert error", { error });
        else logStep("Subscription upserted for checkout.session.completed");
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const { error } = await supabaseAdmin.from("subscriptions").update({
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          price_id: sub.items.data[0]?.price?.id ?? null,
        }).eq("stripe_subscription_id", sub.id);

        if (error) logStep("Update error", { error });
        else logStep("Subscription updated");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const { error } = await supabaseAdmin.from("subscriptions").update({
          status: "canceled",
        }).eq("stripe_subscription_id", sub.id);

        if (error) logStep("Delete update error", { error });
        else logStep("Subscription marked canceled");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const { error } = await supabaseAdmin.from("subscriptions").update({
            status: "past_due",
          }).eq("stripe_subscription_id", invoice.subscription as string);

          if (error) logStep("Past due update error", { error });
          else logStep("Subscription marked past_due");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    logStep("Processing error", { error: String(err) });
    return new Response("Processing error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
