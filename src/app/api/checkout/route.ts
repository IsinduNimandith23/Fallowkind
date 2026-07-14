import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { hasPerColorStock, aggregateColorStock, applyColorDecrement } from "@/lib/stock";
import type { ProductColor } from "@/lib/products";
import {
  sendOrderConfirmationEmail,
  sendOwnerNotificationEmail,
  type EmailAttachment,
} from "@/lib/email";
import { computeShipping } from "@/lib/shipping";

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
    const totalQuantity = items.reduce(
      (sum: number, i: { quantity: number }) => sum + i.quantity,
      0
    );
    const shippingFee = computeShipping(totalQuantity);
    const total = subtotal - discountAmount + shippingFee;

    // ── Stock check & reservation ──────────────────────────────────
    // Aggregate the requested quantity per (product, colour, size). Products
    // that track stock per colour are checked against that colour's count;
    // legacy products fall back to the product-level count.
    type StockItem = {
      productId: number;
      name: string;
      color: string;
      size: string;
      quantity: number;
    };
    const required = new Map<
      string,
      { productId: number; color: string; size: string; name: string; qty: number }
    >();
    for (const i of items as StockItem[]) {
      const key = `${i.productId}__${i.color}__${i.size}`;
      const cur = required.get(key);
      if (cur) cur.qty += i.quantity;
      else
        required.set(key, {
          productId: i.productId,
          color: i.color,
          size: i.size,
          name: i.name,
          qty: i.quantity,
        });
    }

    const productIds = [...new Set((items as StockItem[]).map((i) => i.productId))];
    const { data: stockRows, error: stockErr } = await supabase
      .from("products")
      .select("id, size_quantities, colors")
      .in("id", productIds);
    if (stockErr) {
      console.error("Stock check error:", stockErr);
      return NextResponse.json(
        { error: "Could not verify stock. Please try again." },
        { status: 500 }
      );
    }
    const rowById = new Map<
      number,
      { size_quantities: Record<string, number>; colors: ProductColor[] }
    >(
      (stockRows ?? []).map((r) => [
        r.id as number,
        {
          size_quantities: (r.size_quantities ?? {}) as Record<string, number>,
          colors: (r.colors ?? []) as ProductColor[],
        },
      ])
    );

    // Reject if a colour/size is sold out or doesn't have enough on hand.
    // Untracked sizes (offered but no number set) are treated as unlimited.
    const soldOut = (name: string, color: string, size: string) =>
      NextResponse.json(
        { error: `Sorry, "${name}" (${color} / ${size}) just sold out. Please remove it from your cart.` },
        { status: 409 }
      );
    const notEnough = (name: string, color: string, size: string, available: number) =>
      NextResponse.json(
        {
          error: `Sorry, only ${available} of "${name}" (${color} / ${size}) ${
            available === 1 ? "is" : "are"
          } left. Please lower the quantity and try again.`,
        },
        { status: 409 }
      );

    for (const { productId, color, size, name, qty } of required.values()) {
      const row = rowById.get(productId);
      if (!row) continue;

      if (hasPerColorStock(row.colors)) {
        const col = row.colors.find((c) => c.name === color);
        if (!col) continue; // colour no longer exists - can't verify, let it pass
        // A size the colour no longer offers is sold out for that colour.
        if (!(col.sizes ?? []).includes(size)) return soldOut(name, color, size);
        const available = col.sizeQuantities?.[size];
        if (typeof available === "number" && available < qty) {
          return available <= 0
            ? soldOut(name, color, size)
            : notEnough(name, color, size, available);
        }
      } else {
        const available = row.size_quantities[size];
        if (typeof available === "number" && available < qty) {
          return available <= 0
            ? soldOut(name, color, size)
            : notEnough(name, color, size, available);
        }
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
        shipping_fee: shippingFee,
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
    // Per-colour products: update the colour's count in the JSONB and recompute
    // the product-level aggregate (sizes / size_quantities / in_stock) in one
    // write. Legacy products: the atomic per-size RPC clamps at 0 and flips the
    // product to Sold Out when its last size runs out.
    const decByProduct = new Map<number, { color: string; size: string; qty: number }[]>();
    for (const { productId, color, size, qty } of required.values()) {
      const arr = decByProduct.get(productId) ?? [];
      arr.push({ color, size, qty });
      decByProduct.set(productId, arr);
    }

    await Promise.all(
      [...decByProduct.entries()].map(async ([productId, decs]) => {
        const row = rowById.get(productId);
        if (row && hasPerColorStock(row.colors)) {
          let colors = row.colors;
          for (const d of decs) colors = applyColorDecrement(colors, d.color, d.size, d.qty);
          const agg = aggregateColorStock(colors);
          await supabase
            .from("products")
            .update({
              colors,
              sizes: agg.sizes,
              size_quantities: agg.sizeQuantities,
              in_stock: agg.inStock,
            })
            .eq("id", productId);
        } else {
          await Promise.all(
            decs.map((d) =>
              supabase.rpc("decrement_product_stock", {
                p_product_id: productId,
                p_size: d.size,
                p_qty: d.qty,
              })
            )
          );
        }
      })
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
      shipping_fee: shippingFee,
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
