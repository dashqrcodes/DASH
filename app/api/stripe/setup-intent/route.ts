import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/utils/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email." },
        { status: 400 }
      );
    }

    const { data: userRow, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !userRow?.id) {
      return NextResponse.json(
        { error: userError?.message || "User not found." },
        { status: 404 }
      );
    }

    let customerId = userRow.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userRow.email || email,
        metadata: { user_id: userRow.id },
      });
      customerId = customer.id;
      await supabaseAdmin
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", userRow.id);
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session",
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create setup intent." },
      { status: 500 }
    );
  }
}
