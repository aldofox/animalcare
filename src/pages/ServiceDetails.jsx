import React, { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import db from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const fallback = "https://media.db.com/images/public/6a6c3666b52fd438ad40ae9f/a26b7feb6_generated_fd7a5744.png";
const labels = { higiene: "Higiene Sensorial", veterinario: "Medicina Preventiva", estetica: "Estética", bem_estar: "Bem-estar" };

export default function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    db.entities.Service.get(id).then(setService).catch((loadError) => setError(loadError.message));
  }, [id]);

  if (error) return <main className="mx-auto max-w-3xl px-6 py-32 text-center"><p className="text-destructive">{error}</p><Link to="/" className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent"><ArrowLeft className="h-4 w-4" /> Voltar para a Home</Link></main>;
  if (!service) return <main className="grid min-h-screen place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></main>;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-accent"><ArrowLeft className="h-4 w-4" /> Voltar para serviços</Link>
        <div className="mt-10 grid overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-[0_30px_80px_-45px_rgba(45,90,76,0.5)] lg:grid-cols-2">
          <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-[#F9F7F2] to-secondary p-6 sm:min-h-[360px] lg:min-h-[460px]">
            <Image src={service.imagem_url || fallback} alt={service.nome} className="h-full max-h-[420px] w-full object-contain object-center" />
            <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-[#F9F7F2]/95 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur-md"><Sparkles className="h-4 w-4 text-accent" /> {labels[service.categoria] || "Serviço"}</span>
          </div>
          <div className="flex flex-col p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-semibold tracking-[0.3em] text-accent">CUIDADO PERSONALIZADO</p>
            <h1 className="mt-5 text-4xl font-extrabold text-primary sm:text-5xl">{service.nome}</h1>
            <p className="mt-7 whitespace-pre-line text-base leading-8 text-foreground/70">{service.descricao || "Um cuidado pensado para promover mais saúde, conforto e bem-estar."}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4 border-y border-border py-6">
              <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Investimento</p><p className="mt-1 text-2xl font-extrabold text-accent">R$ {Number(service.preco || 0).toFixed(2).replace(".", ",")}</p></div>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-primary"><Clock className="h-4 w-4 text-accent" /> {service.duracao_minutos || 30} minutos</span>
            </div>
            <Link to="/#agendamento" className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/85">Agendar este serviço <ArrowRight className="h-4 w-4 text-accent" /></Link>
          </div>
        </div>
      </div>
    </main>
  );
}
