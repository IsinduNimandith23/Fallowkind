import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOrderProcessingEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

const VALID_ORDER_STATUSES = ["pending", "processing", "delivered", "returned"];
const VALID_PAYMENT_STATUSES = ["pending", "paid", "failed"];

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { order_status, payment_status, tracking_number } = body;

  const update: Record<string, string | null> = {};

  if (order_status !== undefined) {
    if (!VALID_ORDER_STATUSES.includes(order_status)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }
    update.order_status = order_status;
  }

  if (payment_status !== undefined) {
    if (!VALID_PAYMENT_STATUSES.includes(payment_status)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }
    update.payment_status = payment_status;
  }

  if (tracking_number !== undefined) {
    const trimmed = typeof tracking_number === "string" ? tracking_number.trim() : "";
    update.tracking_number = trimmed === "" ? null : trimmed;
  }

  if (order_status === "processing") {
    const tracking =
      update.tracking_number !== undefined
        ? update.tracking_number
        : null;
    if (!tracking) {
      return NextResponse.json(
        { error: "Tracking number is required to move an order to processing." },
        { status: 400 }
      );
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("orders")
    .select("order_status, tracking_number, order_number, customer_name, customer_email")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("orders")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const movedToProcessing =
    order_status === "processing" && existing.order_status !== "processing";

  if (movedToProcessing) {
    const trackingForEmail =
      typeof update.tracking_number === "string"
        ? update.tracking_number
        : existing.tracking_number;

    if (trackingForEmail) {
      try {
        await sendOrderProcessingEmail({
          customer_name: existing.customer_name,
          customer_email: existing.customer_email,
          order_number: existing.order_number,
          tracking_number: trackingForEmail,
        });
      } catch (err) {
        console.error("Failed to send processing email:", err);
      }
    }
  }

  return NextResponse.json({ success: true });
}
