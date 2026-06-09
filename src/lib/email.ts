import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Update this to match your verified Resend sending domain
const FROM_ADDRESS = "Fallowkind <orders@fallowkind.com>";

export type OrderItem = {
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  price_display: string;
  price_value: number;
};

export type OrderEmailData = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes?: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  coupon_code?: string;
  total: number;
  payment_method: "card" | "cod" | "bank_transfer";
  payment_status: string;
  order_items: OrderItem[];
};

export type EmailAttachment = {
  filename: string;
  content: Buffer;
};

function fmt(value: number): string {
  return "Rs. " + value.toLocaleString("en-LK");
}

function esc(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function itemRows(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #EDE6D3;vertical-align:top">
        <span style="font-weight:600;color:#2A3D2A">${esc(item.product_name)}</span><br>
        <span style="color:#7A9070;font-size:12px">${esc(item.color)} &middot; Size ${esc(item.size)}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #EDE6D3;text-align:center;color:#4F6B4A">${esc(item.quantity)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #EDE6D3;text-align:right;color:#2A3D2A">${esc(item.price_display)}</td>
    </tr>`
    )
    .join("");
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:24px 0;background:#F5F0E5;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:580px;margin:0 auto">
    <div style="background:#2A3D2A;padding:28px 40px;text-align:center">
      <p style="color:#F5F0E5;font-size:22px;letter-spacing:5px;margin:0;font-weight:400">FALLOWKIND</p>
      <p style="color:#7A9070;font-size:10px;letter-spacing:3px;margin:6px 0 0;text-transform:uppercase">Rooted in the Land</p>
    </div>
    <div style="background:#ffffff;padding:40px">
      ${content}
    </div>
    <div style="background:#2A3D2A;padding:20px 40px;text-align:center">
      <p style="color:#7A9070;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0">Clothing rooted in the land &mdash; Fallowkind</p>
    </div>
  </div>
</body>
</html>`;
}

function customerContent(order: OrderEmailData): string {
  const firstName = esc(order.customer_name.split(" ")[0]);
  const paymentLabel =
    order.payment_method === "cod"
      ? "Cash on Delivery &mdash; pay when your order arrives"
      : order.payment_method === "bank_transfer"
      ? "Bank transfer &mdash; " + (order.payment_status === "paid" ? "received" : "awaiting verification")
      : "Card payment &mdash; " + (order.payment_status === "paid" ? "paid" : "pending confirmation");

  const bankTransferNote =
    order.payment_method === "bank_transfer" && order.payment_status !== "paid"
      ? `<p style="color:#5a6a5a;font-size:14px;line-height:1.8;margin:0 0 16px">
           We have received your receipt and will verify the payment within 1&ndash;2 business days.
           Your order will be packed and shipped once the funds have cleared in our account.
         </p>`
      : "";

  return `
    <p style="color:#7A9070;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px">Order Confirmed</p>
    <h2 style="color:#2A3D2A;font-size:22px;margin:0 0 6px;font-weight:400">${esc(order.order_number)}</h2>
    <p style="color:#5a6a5a;font-size:15px;margin:0 0 32px">Hi ${firstName}, your order has been received and is being prepared.</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#F5F0E5">
          <th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;font-weight:normal">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;font-weight:normal">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;font-weight:normal">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows(order.order_items)}</tbody>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:32px">
      <tr>
        <td style="padding:6px 0;color:#5a6a5a;font-size:14px">Subtotal</td>
        <td style="padding:6px 0;text-align:right;color:#2A3D2A;font-size:14px">${fmt(order.subtotal)}</td>
      </tr>
      ${
        order.discount_amount > 0
          ? `<tr>
        <td style="padding:6px 0;color:#5a6a5a;font-size:14px">Discount${order.coupon_code ? ` (${esc(order.coupon_code)})` : ""}</td>
        <td style="padding:6px 0;text-align:right;color:#4F6B4A;font-size:14px">&minus;${fmt(order.discount_amount)}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:6px 0;color:#5a6a5a;font-size:14px">Shipping</td>
        <td style="padding:6px 0;text-align:right;color:#2A3D2A;font-size:14px">${fmt(order.shipping_fee)}</td>
      </tr>
      <tr style="border-top:2px solid #EDE6D3">
        <td style="padding:14px 0 0;color:#2A3D2A;font-size:16px;font-weight:bold">Total</td>
        <td style="padding:14px 0 0;text-align:right;color:#2A3D2A;font-size:16px;font-weight:bold">${fmt(order.total)}</td>
      </tr>
    </table>

    <div style="background:#F5F0E5;padding:20px;margin-bottom:24px">
      <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;margin:0 0 10px">Shipping to</p>
      <p style="color:#2A3D2A;font-size:14px;margin:0;line-height:1.8">
        ${esc(order.customer_name)}<br>${esc(order.address)}<br>${esc(order.city)}, ${esc(order.postal_code)}<br>Sri Lanka
      </p>
    </div>

    <p style="color:#5a6a5a;font-size:14px;margin:0 0 24px">
      <strong style="color:#2A3D2A">Payment:</strong> ${paymentLabel}
    </p>
    ${bankTransferNote}
    <p style="color:#5a6a5a;font-size:14px;line-height:1.8;margin:0">
      We will reach out once your order is on its way. If you have any questions, simply reply to this email.
    </p>`;
}

function ownerContent(order: OrderEmailData): string {
  return `
    <p style="color:#7A9070;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px">New Order</p>
    <h2 style="color:#2A3D2A;font-size:22px;margin:0 0 32px;font-weight:400">${esc(order.order_number)}</h2>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
      <div style="background:#F5F0E5;padding:18px">
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;margin:0 0 10px">Customer</p>
        <p style="color:#2A3D2A;font-size:14px;margin:0;line-height:1.9">
          <strong>${esc(order.customer_name)}</strong><br>${esc(order.customer_email)}<br>${esc(order.customer_phone)}
        </p>
      </div>
      <div style="background:#F5F0E5;padding:18px">
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;margin:0 0 10px">Ship to</p>
        <p style="color:#2A3D2A;font-size:14px;margin:0;line-height:1.9">
          ${esc(order.address)}<br>${esc(order.city)}, ${esc(order.postal_code)}<br>Sri Lanka
        </p>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <thead>
        <tr style="background:#F5F0E5">
          <th style="padding:10px 12px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;font-weight:normal">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;font-weight:normal">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;font-weight:normal">Price</th>
        </tr>
      </thead>
      <tbody>${itemRows(order.order_items)}</tbody>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
      <tr><td style="padding:6px 0;color:#5a6a5a;font-size:14px">Subtotal</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#2A3D2A">${fmt(order.subtotal)}</td></tr>
      ${order.discount_amount > 0 ? `<tr><td style="padding:6px 0;color:#5a6a5a;font-size:14px">Discount</td><td style="padding:6px 0;text-align:right;color:#4F6B4A;font-size:14px">&minus;${fmt(order.discount_amount)}</td></tr>` : ""}
      <tr><td style="padding:6px 0;color:#5a6a5a;font-size:14px">Shipping</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#2A3D2A">${fmt(order.shipping_fee)}</td></tr>
      <tr style="border-top:2px solid #EDE6D3">
        <td style="padding:14px 0 0;font-size:16px;font-weight:bold;color:#2A3D2A">Total</td>
        <td style="padding:14px 0 0;text-align:right;font-size:16px;font-weight:bold;color:#2A3D2A">${fmt(order.total)}</td>
      </tr>
    </table>

    <div style="background:#F5F0E5;padding:16px">
      <p style="font-size:14px;color:#2A3D2A;margin:0">
        <strong>Payment:</strong> ${
          order.payment_method === "cod"
            ? "Cash on Delivery"
            : order.payment_method === "bank_transfer"
            ? "Bank Transfer"
            : "Card"
        } &nbsp;&middot;&nbsp;
        <strong>Status:</strong> ${
          order.payment_status === "paid"
            ? "✓ Paid"
            : order.payment_method === "cod"
            ? "Collect on delivery"
            : order.payment_method === "bank_transfer"
            ? "Awaiting verification &mdash; receipt attached"
            : "Pending"
        }
      </p>
      ${
        order.payment_method === "bank_transfer" && order.payment_status !== "paid"
          ? `<p style="font-size:13px;color:#5a6a5a;margin:10px 0 0;line-height:1.6">
               Verify the deposit in the bank account, then mark this order as paid in the admin panel and ship the package.
             </p>`
          : ""
      }
    </div>
    ${order.notes ? `<p style="color:#5a6a5a;font-size:14px;margin:20px 0 0"><strong>Customer note:</strong> ${esc(order.notes)}</p>` : ""}`;
}

function processingContent(
  customerName: string,
  orderNumber: string,
  trackingCode: string
): string {
  const firstName = esc(customerName.split(" ")[0]);
  const trackUrl = `https://track.citypak.lk/track?tracking_number=${encodeURIComponent(trackingCode)}`;
  return `
    <p style="color:#7A9070;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px">Order Processing</p>
    <h2 style="color:#2A3D2A;font-size:22px;margin:0 0 24px;font-weight:400">${esc(orderNumber)}</h2>

    <p style="color:#5a6a5a;font-size:15px;line-height:1.8;margin:0 0 16px">Hi ${firstName},</p>
    <p style="color:#5a6a5a;font-size:15px;line-height:1.8;margin:0 0 16px">
      Thank you for shopping with Fallowkind. We truly appreciate your order and support.
    </p>
    <p style="color:#5a6a5a;font-size:15px;line-height:1.8;margin:0 0 24px">
      Your order has been confirmed and is now being processed.
    </p>

    <div style="background:#F5F0E5;padding:20px;margin-bottom:24px">
      <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;margin:0 0 8px">Tracking Code</p>
      <p style="color:#2A3D2A;font-size:16px;margin:0;font-family:Arial,Helvetica,sans-serif;font-weight:500">${esc(trackingCode)}</p>
    </div>

    <p style="color:#5a6a5a;font-size:14px;line-height:1.8;margin:0 0 8px">You can track your order here:</p>
    <p style="margin:0 0 28px">
      <a href="${esc(trackUrl)}" style="color:#2A3D2A;font-size:14px;font-family:Arial,Helvetica,sans-serif;word-break:break-all">${esc(trackUrl)}</a>
    </p>

    <p style="color:#5a6a5a;font-size:14px;line-height:1.8;margin:0 0 16px">
      We&rsquo;ll make sure your order reaches you as soon as possible. If you have any questions, feel free to reply to this email.
    </p>
    <p style="color:#5a6a5a;font-size:14px;line-height:1.8;margin:0 0 24px">
      Thank you once again for choosing Fallowkind.
    </p>
    <p style="color:#2A3D2A;font-size:14px;line-height:1.8;margin:0">
      Regards,<br>Fallowkind Team
    </p>`;
}

export async function sendOrderProcessingEmail(params: {
  customer_name: string;
  customer_email: string;
  order_number: string;
  tracking_number: string;
}) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: params.customer_email,
    subject: `Your Fallowkind order is being processed - ${params.order_number}`,
    html: baseLayout(processingContent(params.customer_name, params.order_number, params.tracking_number)),
  });
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: order.customer_email,
    subject: `Your Fallowkind order is confirmed - ${order.order_number}`,
    html: baseLayout(customerContent(order)),
  });
}

function contactMessageContent(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const safeMessage = esc(params.message).replace(/\n/g, "<br>");
  return `
    <p style="color:#7A9070;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px">New Contact Message</p>
    <h2 style="color:#2A3D2A;font-size:22px;margin:0 0 24px;font-weight:400">${esc(params.subject)}</h2>

    <div style="background:#F5F0E5;padding:18px;margin-bottom:24px">
      <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;margin:0 0 10px">From</p>
      <p style="color:#2A3D2A;font-size:14px;margin:0;line-height:1.9">
        <strong>${esc(params.name)}</strong><br>${esc(params.email)}
      </p>
    </div>

    <div>
      <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7A9070;margin:0 0 10px">Message</p>
      <p style="color:#2A3D2A;font-size:14px;line-height:1.8;margin:0;white-space:pre-wrap">${safeMessage}</p>
    </div>`;
}

export async function sendContactMessageEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: process.env.CONTACT_EMAIL || process.env.OWNER_EMAIL!,
    replyTo: params.email,
    subject: `Contact form - ${params.subject}`,
    html: baseLayout(contactMessageContent(params)),
  });
}

export async function sendOwnerNotificationEmail(
  order: OrderEmailData,
  attachments?: EmailAttachment[]
) {
  return resend.emails.send({
    from: FROM_ADDRESS,
    to: process.env.OWNER_EMAIL!,
    subject: `New order received - ${order.order_number}`,
    html: baseLayout(ownerContent(order)),
    attachments: attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });
}
