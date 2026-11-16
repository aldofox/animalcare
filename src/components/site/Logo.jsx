import React from "react";
import { PawPrint } from "lucide-react";

export default function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl grid place-items-center ${light ? "bg-[#F9F7F2]/15" : "bg-primary"}`}>
        <PawPrint className={`w-5 h-5 ${light ? "text-[#F9F7F2]" : "text-primary-foreground"}`} />
      </div>
      <div className="leading-none">
        <p className={`font-heading font-extrabold text-lg tracking-tight ${light ? "text-[#F9F7F2]" : "text-primary"}`}>
          ANIMA CARE
        </p>
        <p className={`text-[10px] tracking-[0.32em] ${light ? "text-[#F9F7F2]/60" : "text-muted-foreground"}`}>
          INSTITUTE
        </p>
      </div>
    </div>
  );
}