"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      subject: String(data.get("subject") ?? ""),
      message: String(data.get("message") ?? ""),
    };

    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body?.error || "Failed to send message");
        setStatus("error");
        return;
      }
      form.reset();
      setStatus("sent");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form className="flex flex-col gap-7" onSubmit={handleSubmit} noValidate>
      <div className="grid md:grid-cols-2 gap-6">
        <FormField id="name" label="Name" type="text" />
        <FormField id="email" label="Email address" type="email" />
      </div>
      <FormField id="subject" label="Subject" type="text" />
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-[10px] tracking-widest uppercase text-forest/75">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={5000}
          className="glass-input-soft px-5 py-4 text-sm text-forest placeholder:text-forest/50 resize-none border-forest/30 hover:border-forest/50"
          placeholder="Your message..."
        />
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
        {status === "sent" && (
          <p className="text-sm text-moss">Thanks - your message is on its way.</p>
        )}
        {status === "error" && errorMsg && (
          <p className="text-sm text-red-700">{errorMsg}</p>
        )}
      </div>
    </form>
  );
}

function FormField({ id, label, type }: { id: string; label: string; type: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] tracking-widest uppercase text-forest/75">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        className="glass-input px-5 py-3.5 text-sm text-forest placeholder:text-forest/50 border-forest/30 hover:border-forest/50"
        placeholder={label}
      />
    </div>
  );
}
