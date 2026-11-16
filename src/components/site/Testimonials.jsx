import React from "react";
import { Star, Quote } from "lucide-react";

export default function Testimonials({ testimonials }) {
  return (
    <section id="depoimentos" className="py-28 lg:py-36 bg-secondary/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.3em] text-accent font-semibold">CONFIANÇA</p>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary break-words">Tutores que não aceitam menos</h2>
        </div>
        <div className="mt-16 grid md:grid-cols-3 gap-7">
          {testimonials.map((t) => (
            <figure key={t.id} className="soft-lift rounded-[2rem] bg-card border border-border p-8 flex flex-col">
              <Quote className="w-8 h-8 text-accent/50" />
              <blockquote className="mt-5 text-foreground/75 flex-1">{t.texto}</blockquote>
              <div className="mt-6 flex items-center gap-1">
                {Array.from({ length: t.nota || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <figcaption className="mt-4 border-t border-border pt-4">
                <p className="font-bold text-primary">{t.autor}</p>
                <p className="text-sm text-muted-foreground">tutor(a) de {t.pet_nome}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}