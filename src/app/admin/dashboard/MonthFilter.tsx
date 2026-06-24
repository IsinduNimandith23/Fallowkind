"use client";

import { useRouter } from "next/navigation";

type Option = { value: string; label: string };

export default function MonthFilter({
  options,
  selected,
}: {
  options: Option[];
  selected: string;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-gray-500">
      <span className="font-medium">Month</span>
      <select
        value={selected}
        onChange={(e) => router.push(`/admin/dashboard?month=${e.target.value}`)}
        className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-forest/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
