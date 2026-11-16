import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[60svh] sm:min-h-[70svh] flex items-end overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1800&q=85"
        alt="Cão de raça nobre olhando para o horizonte em ambiente minimalista"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F221C]/95 via-[#0F221C]/55 to-[#0F221C]/25" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-20 pt-40">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F9F7F2]/12 border border-[#F9F7F2]/20 px-4 py-1.5 text-xs tracking-[0.2em] text-[#F9F7F2]/85">
            <ShieldCheck className="w-3.5 h-3.5" /> BEM-ESTAR ANIMAL DE ELITE
          </span>
          <h1 className="mt-7 text-[#F9F7F2] text-[2.1rem] sm:text-5xl lg:text-[5rem] font-extrabold max-w-4xl break-words hyphens-auto">
            Rituais de higiene sensorial e medicina preventiva de precisão.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#F9F7F2]/80">
            Um instituto onde a serenidade do cuidado natural encontra o rigor clínico. Seu companheiro merece mais do que um pet shop.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#agendamento" className="group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-[0_20px_50px_-15px_rgba(200,121,65,0.7)] hover:brightness-110 transition-all">
              Agendar agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#servicos" className="inline-flex rounded-full border border-[#F9F7F2]/30 px-8 py-4 text-base text-[#F9F7F2] hover:bg-[#F9F7F2]/10 transition-colors">
              Ver serviços
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}