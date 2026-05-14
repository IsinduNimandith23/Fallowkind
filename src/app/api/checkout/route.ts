import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  sendOrderConfirmationEmail,
  sendOwnerNotificationEmail,
  type EmailAttachment,
} from "@/lib/email";

const SHIPPING_FEE = 400;
const VALID_METHODS = new Set(["cod", "bank_transfer"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      items,
      paymentMethod,
      couponCode,
      discountAmount = 0,
      receipt,
    } = body;

    if (!customer || !items?.length || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!VALID_METHODS.has(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }
    if (paymentMethod === "bank_transfer" && (!receipt?.path || !receipt?.filename)) {
      return NextResponse.json(
        { error: "Payment receipt is required for bank transfer" },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, i: { priceValue: number; quantity: number }) => sum + i.priceValue * i.quantity,
      0
    );
    const total = subtotal - discountAmount + SHIPPING_FEE;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
        customer_email: customer.email,
        customer_phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postal_code: customer.postalCode,
        notes: customer.notes || null,
        subtotal,
        shipping_fee: SHIPPING_FEE,
        discount_amount: discountAmount,
        coupon_code: couponCode || null,
        total,
        payment_method: paymentMethod,
        payment_status: "pending",
        order_status: "pending",
        receipt_path: paymentMethod === "bank_transfer" ? receipt.path : null,
        receipt_filename: paymentMethod === "bank_transfer" ? receipt.filename : null,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order insert error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderItems = items.map((item: {
      productId: number; name: string; category: string;
      price: string; priceValue: number; color: string; size: string; quantity: number;
    }) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      category: item.category,
      price_display: item.price,
      price_value: item.priceValue,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    if (couponCode) {
      await supabase.rpc("increment_coupon_usage", { coupon_code: couponCode });
    }

    // Fetch the receipt file so we can attach it to the owner email.
    let ownerAttachments: EmailAttachment[] | undefined;
    if (paymentMethod === "bank_transfer") {
      const { data: file, error: downloadError } = await supabase.storage
        .from("payment-receipts")
        .download(receipt.path);

      if (!downloadError && file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        ownerAttachments = [{ filename: receipt.filename, content: buffer }];
      } else {
        console.error("Receipt download error:", downloadError);
      }
    }

    const emailData = {
      id: order.id,
      order_number: order.order_number,
      customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
      customer_email: customer.email,
      customer_phone: customer.phone,
      address: customer.address,
      city: customer.city,
      postal_code: customer.postalCode,
      notes: customer.notes,
      subtotal,
      shipping_fee: SHIPPING_FEE,
      discount_amount: discountAmount,
      coupon_code: couponCode,
      total,
      payment_method: paymentMethod as "cod" | "bank_transfer",
      payment_status: "pending",
      order_items: orderItems.map((i: typeof orderItems[0]) => ({
        product_name: i.product_name,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        price_display: i.price_display,
        price_value: i.price_value,
      })),
    };

    await Promise.allSettled([
      sendOrderConfirmationEmail(emailData),
      sendOwnerNotificationEmail(emailData, ownerAttachments),
    ]);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
