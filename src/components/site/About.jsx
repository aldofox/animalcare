import React from "react";
import { Leaf, Stethoscope, Sparkles, HeartHandshake } from "lucide-react";
import { Image } from "@/components/ui/image";

const pillars = [
  { icon: Leaf, title: "Protocolo Biofílico", text: "Produtos naturais, ambientes com luz difusa e aromaterapia calmante em cada atendimento." },
  { icon: Stethoscope, title: "Precisão Clínica", text: "Diagnóstico preventivo com equipe especializada e histórico completo de cada paciente." },
  { icon: Sparkles, title: "Ritual Sensorial", text: "Banho, hidratação e finalização conduzidos em ritmo respeitoso ao temperamento do animal." },
  { icon: HeartHandshake, title: "Tutoria Contínua", text: "Acompanhamento pós-atendimento com orientações personalizadas de nutrição e rotina." },
];

export default function About() {
  return (
    <section id="instituto" className="py-28 lg:py-36">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-5">
          <div className="rounded-[2rem] overflow-hidden shadow-[0_40px_80px_-40px_rgba(45,90,76,0.45)]">
            <Image
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=85"
              alt="Mãos cuidadosas examinando a pata de um cão"
              className="w-full aspect-[4/5]"
            />
          </div>
        </div>
        <div className="lg:col-span-7">
          <p className="text-xs tracking-[0.3em] text-accent font-semibold">O INSTITUTO</p>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary max-w-xl break-words">
            Onde o mercado vê banho e tosa, nós arquitetamos bem-estar.
          </h2>
          <p className="mt-6 text-foreground/70 max-w-xl">
            O Anima Care Institute nasceu da convicção de que cuidar de um animal é um ato de precisão e afeto.
            Cada sala foi desenhada para reduzir estresse, cada protocolo revisado por médicos veterinários,
            cada detalhe pensado para tutores exigentes.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {pillars.map((p) => (
              <div key={p.title} className="soft-lift rounded-3xl bg-card border border-border p-7">
                <div className="w-11 h-11 rounded-2xl bg-secondary grid place-items-center">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-primary">{p.title}</h3>
                <p className="mt-2 text-sm text-foreground/65">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}