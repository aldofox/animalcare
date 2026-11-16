import React from "react";

export default function PageTitle({ eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
      <div>
        <p className="text-xs tracking-[0.3em] text-accent font-semibold">{eyebrow}</p>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold text-primary">{title}</h1>
      </div>
      {action}
    </div>
  );
}