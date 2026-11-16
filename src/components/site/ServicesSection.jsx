import React, { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDroplet,
  faHeart,
  faPaw,
  faStethoscope,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";

const fallback = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=85";

const labels = { higiene: "Higiene Sensorial", veterinario: "Medicina Preventiva", estetica: "Estética", bem_estar: "Bem-estar" };
const categoryIcons = {
  higiene: { icon: faDroplet, colors: "bg-[#D8ECE5] text-[#236B57]" },
  veterinario: { icon: faStethoscope, colors: "bg-[#F4E1C8] text-[#9B5B24]" },
  estetica: { icon: faWandMagicSparkles, colors: "bg-[#E6E1F3] text-[#62518D]" },
  bem_estar: { icon: faHeart, colors: "bg-[#F4DEDF] text-[#A44F60]" },
};
const defaultCategoryIcon = { icon: faPaw, colors: "bg-[#D8ECE5] text-[#236B57]" };

export default function ServicesSection({ services }) {
  const track = useRef(null);
  const reduceMotion = useReducedMotion();
  const scroll = (dir) => {
    const container = track.current;
    const firstCard = container?.firstElementChild;
    if (!container || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(container).columnGap) || 0;
    container.scrollBy({ left: dir * (firstCard.getBoundingClientRect().width + gap), behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <section id="servicos" className="py-24 lg:py-32 bg-primary text-[#F9F7F2] rounded-[2.5rem] mx-3 lg:mx-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.3em] text-accent font-semibold">NOSSOS RITUAIS</p>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold max-w-lg break-words">Serviços desenhados sob medida</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={() => scroll(-1)} aria-label="Anterior" className="w-12 h-12 rounded-full border border-[#F9F7F2]/25 grid place-items-center hover:bg-[#F9F7F2]/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll(1)} aria-label="Próximo" className="w-12 h-12 rounded-full border border-[#F9F7F2]/25 grid place-items-center hover:bg-[#F9F7F2]/10 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div ref={track} className="mt-14 flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
          {services.map((s, index) => {
            const categoryIcon = categoryIcons[s.categoria] || defaultCategoryIcon;

            return (
              <motion.article
                key={s.id}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group snap-start shrink-0 w-[82vw] sm:w-[390px] overflow-hidden rounded-[2rem] border border-[#F9F7F2]/70 bg-[#F9F7F2] text-foreground shadow-[0_18px_45px_-25px_rgba(0,0,0,0.65)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_55px_-25px_rgba(0,0,0,0.8)] motion-reduce:transition-none motion-reduce:hover:transform-none"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <Image src={s.imagem_url || fallback} alt={s.nome} className="h-full w-full object-contain object-center p-3 transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-80" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-[#F9F7F2]/85 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-primary shadow-sm backdrop-blur-md">
                    {labels[s.categoria] || "Serviço"}
                  </span>
                  <span aria-hidden="true" className={`absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl shadow-md ring-1 ring-white/40 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:transform-none ${categoryIcon.colors}`}>
                    <FontAwesomeIcon icon={categoryIcon.icon} className="h-4 w-4" />
                  </span>
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5 text-accent" /> Cuidado especial
                  </span>
                </div>
                <div className="flex min-h-[245px] flex-col p-7">
                  <Link to={`/servicos/${s.id}`} className="text-xl font-bold leading-tight text-primary transition-colors hover:text-accent">{s.nome}</Link>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/65">{s.descricao || "Um cuidado pensado para promover mais saúde, conforto e bem-estar."}</p>
                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">A partir de</p>
                      <span className="mt-1 block text-xl font-extrabold text-accent">
                        R$ {Number(s.preco || 0).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-primary">
                      <Clock className="w-3.5 h-3.5" /> {s.duracao_minutos} min
                    </span>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <Link to={`/servicos/${s.id}`} className="flex-1 rounded-xl border border-primary/20 px-4 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-secondary">Ver detalhes</Link>
                    <a href="#agendamento" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85">
                      <span>Agendar</span> <ArrowUpRight className="h-4 w-4 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:transform-none" />
                    </a>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}