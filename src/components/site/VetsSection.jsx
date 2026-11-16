import React from "react";
import { BadgeCheck } from "lucide-react";
import { Image } from "@/components/ui/image";

const fallbacks = [
  "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85",
];

export default function VetsSection({ vets }) {
  return (
    <section id="veterinarios" className="py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.3em] text-accent font-semibold">CORPO CLÍNICO</p>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary break-words">
            Médicos veterinários que tratam cada paciente como único
          </h2>
        </div>
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {vets.map((v, i) => (
            <article key={v.id} className="group soft-lift rounded-[2rem] bg-card border border-border overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[3/2]">
                <Image
                  src={v.foto_url || fallbacks[i % fallbacks.length]}
                  alt={`Retrato de ${v.nome}`}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0F221C]/85 to-transparent" />
                <div className="absolute bottom-5 left-6 right-6">
                  <h3 className="text-xl font-bold text-[#F9F7F2]">{v.nome}</h3>
                  <p className="text-sm text-[#F9F7F2]/75">{v.especialidade}</p>
                </div>
              </div>
              <div className="p-7">
                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                  <BadgeCheck className="w-4 h-4 text-accent" /> CRMV {v.crmv}
                </span>
                <p className="mt-3 text-sm text-foreground/65">{v.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}