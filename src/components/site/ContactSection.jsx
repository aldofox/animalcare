import db from "@/api/base44Client";

import React, { useState } from "react";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const info = [
  { icon: MapPin, title: "Endereço", text: "Rua das Acácias, 480 — Jardim Botânico, São Paulo/SP" },
  { icon: Phone, title: "Telefone", text: "(11) 4002-8922" },
  { icon: Mail, title: "E-mail", text: "contato@animacare.institute" },
  { icon: Clock, title: "Horários", text: "Seg a Sáb, 08h às 19h" },
];

export default function ContactSection() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);

  const send = async () => {
    setSaving(true);
    await db.entities.ContactMessage.create(form);
    setSaving(false);
    setSent(true);
    setForm({ nome: "", email: "", telefone: "", mensagem: "" });
  };

  return (
    <section id="contato" className="py-28 lg:py-36 bg-secondary/60">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-14">
        <div>
          <p className="text-xs tracking-[0.3em] text-accent font-semibold">CONTATO</p>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary break-words">Vamos conversar sobre seu companheiro</h2>
          <div className="mt-10 grid sm:grid-cols-2 gap-5">
            {info.map((i) => (
              <div key={i.title} className="soft-lift rounded-3xl bg-card border border-border p-6">
                <i.icon className="w-5 h-5 text-accent" />
                <p className="mt-4 font-bold text-primary">{i.title}</p>
                <p className="mt-1 text-sm text-foreground/65">{i.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-card border border-border p-8 sm:p-10">
          {sent ? (
            <p className="text-primary font-medium">Mensagem enviada. Responderemos em até um dia útil.</p>
          ) : (
            <div className="space-y-5">
              <div><Label>Nome</Label><Input className="mt-2 rounded-xl" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
              <div><Label>E-mail</Label><Input className="mt-2 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input className="mt-2 rounded-xl" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} /></div>
              <div><Label>Mensagem</Label><Textarea rows={5} className="mt-2 rounded-xl" value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} /></div>
              <button onClick={send} disabled={!form.nome || !form.mensagem || saving} className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:brightness-110 transition-all">
                {saving ? "Enviando..." : "Enviar mensagem"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}