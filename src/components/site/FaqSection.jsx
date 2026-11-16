import React from "react";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqSection({ faqs = [] }) {
  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-24 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-accent">
            <HelpCircle className="w-4 h-4" /> Dúvidas Frequentes
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary break-words">
            Perguntas que tutores costumam fazer
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Reunimos as respostas para as dúvidas mais comuns sobre nossos procedimentos e atendimentos.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-2xl border border-border bg-card px-5 sm:px-6 overflow-hidden data-[state=open]:border-primary/30 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-primary hover:no-underline py-5">
                  {item.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-foreground/70 leading-relaxed pb-5 text-base">
                  {item.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}