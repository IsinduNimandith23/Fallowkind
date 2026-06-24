import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import {
  sendOrderConfirmationEmail,
  sendOwnerNotificationEmail,
  type EmailAttachment,
} from "@/lib/email";

const SHIPPING_FEE = 425;
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

    // ── Stock check & reservation ──────────────────────────────────
    // Aggregate the requested quantity per (product, size) - the cart can
    // hold the same size in different colours as separate lines.
    type StockItem = { productId: number; name: string; size: string; quantity: number };
    const required = new Map<
      string,
      { productId: number; size: string; name: string; qty: number }
    >();
    for (const i of items as StockItem[]) {
      const key = `${i.productId}__${i.size}`;
      const cur = required.get(key);
      if (cur) cur.qty += i.quantity;
      else required.set(key, { productId: i.productId, size: i.size, name: i.name, qty: i.quantity });
    }

    const productIds = [...new Set((items as StockItem[]).map((i) => i.productId))];
    const { data: stockRows, error: stockErr } = await supabase
      .from("products")
      .select("id, size_quantities")
      .in("id", productIds);
    if (stockErr) {
      console.error("Stock check error:", stockErr);
      return NextResponse.json(
        { error: "Could not verify stock. Please try again." },
        { status: 500 }
      );
    }
    const stockById = new Map<number, Record<string, number>>(
      (stockRows ?? []).map((r) => [
        r.id as number,
        (r.size_quantities ?? {}) as Record<string, number>,
      ])
    );

    // Reject if a tracked size doesn't have enough on hand. Untracked sizes
    // (no number set) are treated as unlimited and skipped.
    for (const { productId, size, name, qty } of required.values()) {
      const available = stockById.get(productId)?.[size];
      if (typeof available === "number" && available < qty) {
        return NextResponse.json(
          {
            error:
              available <= 0
                ? `Sorry, "${name}" (size ${size}) just sold out. Please remove it from your cart.`
                : `Sorry, only ${available} of "${name}" (size ${size}) ${
                    available === 1 ? "is" : "are"
                  } left. Please lower the quantity and try again.`,
          },
          { status: 409 }
        );
      }
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: `${customer.firstName} ${customer.lastName}`.trim(),
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_phone_2: customer.phone2 || null,
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

    // ── Decrement tracked stock now that the order is placed ──
    // The DB function is a no-op for untracked sizes and clamps at 0,
    // flipping a product to Sold Out when its last size runs out.
    await Promise.all(
      [...required.values()].map(({ productId, size, qty }) =>
        supabase.rpc("decrement_product_stock", {
          p_product_id: productId,
          p_size: size,
          p_qty: qty,
        })
      )
    );
    // Refresh the cached store pages so the new stock/sold-out state shows.
    revalidatePath("/");
    revalidatePath("/shop");
    for (const id of productIds) revalidatePath(`/shop/${id}`);

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
      customer_phone_2: customer.phone2 || undefined,
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
