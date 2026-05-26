"use client";

import { useState, type ReactNode } from "react";

export type SiteTab = {
  id: string;
  label: string;
  description?: string;
  content: ReactNode;
};

export default function SiteTabs({ tabs }: { tabs: SiteTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Site sections"
        className="flex flex-wrap gap-1 border-b border-gray-200 mb-8"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? "border-forest text-forest"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {active && (
        <div
          role="tabpanel"
          id={`panel-${active.id}`}
          aria-labelledby={`tab-${active.id}`}
        >
          {active.description && (
            <p className="text-sm text-gray-500 mb-6">{active.description}</p>
          )}
          {active.content}
        </div>
      )}
    </div>
  );
}
