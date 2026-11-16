import React from "react";

export default function KpiCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="soft-lift rounded-3xl bg-card border border-border p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="w-9 h-9 rounded-xl bg-secondary grid place-items-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}