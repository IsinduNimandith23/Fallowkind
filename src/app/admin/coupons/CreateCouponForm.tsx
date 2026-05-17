"use client";

import { useState } from "react";
import CouponForm from "./CouponForm";

export default function CreateCouponForm() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 bg-forest text-linen text-sm rounded hover:bg-forest/90 transition-colors duration-150"
      >
        {open ? "Cancel" : "+ New Coupon"}
      </button>

      {open && (
        <div className="mt-4">
          <CouponForm mode="create" onDone={() => setOpen(false)} onCancel={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
