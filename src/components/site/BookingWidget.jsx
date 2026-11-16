import db from "@/api/base44Client";

import React, { useState } from "react";

import { Check, ArrowRight, ArrowLeft, PawPrint, CalendarCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const hours = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const steps = ["Animal", "Serviço", "Data & Hora"];

export default function BookingWidget({ services, vets }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calendarWarning, setCalendarWarning] = useState("");
  const [form, setForm] = useState({
    tutor_nome: "", tutor_email: "", tutor_telefone: "",
    pet_nome: "", pet_especie: "cao", pet_raca: "",
    service_id: "", vet_id: "", data_agendada: "", hora: "", observacoes: "",
    metodo_pagamento: "pix",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const service = services.find((s) => s.id === form.service_id);
  const vet = vets.find((v) => v.id === form.vet_id);

  const canNext =
    step === 0 ? form.tutor_nome && form.tutor_telefone && form.pet_nome :
    step === 1 ? form.service_id :
    form.data_agendada && form.hora && form.metodo_pagamento;

  const submit = async () => {
    setSaving(true);
    const created = await db.entities.Appointment.create({
      ...form,
      service_nome: service?.nome,
      vet_nome: vet?.nome || "",
      valor: service?.preco || 0,
      status: "pendente",
    });

    // Sync to Google Calendar — fails silently if the connector is not authorized
    try {
      const res = await db.functions.invoke("sync-google-calendar", {
        action: "create",
        appointment: { ...form, appointmentId: created.id, service_nome: service?.nome, vet_nome: vet?.nome || "" },
        duracao_minutos: service?.duracao_minutos || 30,
      });
      const result = res?.data ?? res;
      if (result?.synced && result?.eventId) {
        await db.entities.Appointment.update(created.id, {
          google_calendar_event_id: result.eventId,
        });
      }
    } catch {
      setCalendarWarning("O agendamento foi salvo, mas não conseguimos sincronizá-lo com o calendário. Nossa recepção fará a confirmação.");
    }

    setSaving(false);
    setDone(true);
  };

  return (
    <section id="agendamento" className="py-28 lg:py-36">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs tracking-[0.3em] text-accent font-semibold">AGENDAMENTO DE PRECISÃO</p>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary break-words">Três passos. Zero fricção.</h2>
        </div>

        <div className="mt-14 rounded-[2rem] bg-card border border-border p-7 sm:p-12 shadow-[0_40px_80px_-50px_rgba(45,90,76,0.4)]">
          {done ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-primary grid place-items-center mx-auto">
                <CalendarCheck className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-primary">Agendamento recebido</h3>
              <p className="mt-3 text-foreground/70">
                {form.pet_nome} está reservado para {form.data_agendada} às {form.hora}. Nossa recepção confirmará em breve.
              </p>
              {calendarWarning && (
                <p role="status" className="mt-4 text-sm text-accent">
                  {calendarWarning}
                </p>
              )}
              <button onClick={() => { setDone(false); setCalendarWarning(""); setStep(0); }} className="mt-8 rounded-full border border-primary/25 px-6 py-3 text-sm text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                Novo agendamento
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 sm:gap-5">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 flex-1">
                    <div className={`w-9 h-9 shrink-0 rounded-full grid place-items-center text-sm font-semibold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {i < step ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-sm hidden sm:block ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{s}</span>
                    {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />}
                  </div>
                ))}
              </div>

              <div className="mt-10">
                {step === 0 && (
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div><Label>Seu nome</Label><Input name="tutor_nome" className="mt-2 rounded-xl" value={form.tutor_nome} onChange={(e) => set("tutor_nome", e.target.value)} /></div>
                    <div><Label>Telefone / WhatsApp</Label><Input name="tutor_telefone" className="mt-2 rounded-xl" value={form.tutor_telefone} onChange={(e) => set("tutor_telefone", e.target.value)} /></div>
                    <div><Label>E-mail</Label><Input name="tutor_email" className="mt-2 rounded-xl" value={form.tutor_email} onChange={(e) => set("tutor_email", e.target.value)} /></div>
                    <div><Label>Nome do pet</Label><Input name="pet_nome" className="mt-2 rounded-xl" value={form.pet_nome} onChange={(e) => set("pet_nome", e.target.value)} /></div>
                    <div>
                      <Label>Espécie</Label>
                      <div className="mt-2 flex gap-2">
                        {[["cao", "Cão"], ["gato", "Gato"], ["outro", "Outro"]].map(([v, l]) => (
                          <button key={v} onClick={() => set("pet_especie", v)} className={`rounded-full px-4 py-2 text-sm border transition-colors ${form.pet_especie === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div><Label>Raça</Label><Input className="mt-2 rounded-xl" value={form.pet_raca} onChange={(e) => set("pet_raca", e.target.value)} /></div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Selecione o serviço</p>
                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                      {services.map((s) => (
                        <button key={s.id} onClick={() => set("service_id", s.id)} className={`text-left rounded-2xl border p-5 transition-all ${form.service_id === s.id ? "border-primary bg-secondary/60" : "border-border hover:border-primary/40"}`}>
                          <p className="font-semibold text-primary">{s.nome}</p>
                          <p className="mt-1 text-sm text-muted-foreground">R$ {Number(s.preco).toFixed(2).replace(".", ",")} · {s.duracao_minutos} min</p>
                        </button>
                      ))}
                    </div>
                    <p className="mt-8 text-sm text-muted-foreground">Veterinário (opcional)</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {vets.map((v) => (
                        <button key={v.id} onClick={() => set("vet_id", form.vet_id === v.id ? "" : v.id)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${form.vet_id === v.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
                          <PawPrint className="w-4 h-4" /> {v.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label>Data</Label>
                      <Input type="date" className="mt-2 rounded-xl" value={form.data_agendada} onChange={(e) => set("data_agendada", e.target.value)} />
                      <Label className="block mt-6">Observações</Label>
                      <Textarea className="mt-2 rounded-xl" rows={4} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
                    </div>
                    <div>
                      <Label>Horário</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {hours.map((h) => (
                          <button key={h} onClick={() => set("hora", h)} className={`rounded-xl border py-2.5 text-sm transition-colors ${form.hora === h ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
                            {h}
                          </button>
                        ))}
                      </div>
                      {service && (
                        <div className="mt-6 rounded-2xl bg-secondary/60 p-5 text-sm">
                          <p className="font-semibold text-primary">{service.nome}</p>
                          <p className="text-muted-foreground">{vet ? `com ${vet.nome}` : "Sem veterinário"}</p>
                          <p className="mt-2 text-lg font-bold text-accent">R$ {Number(service.preco).toFixed(2).replace(".", ",")}</p>
                        </div>
                      )}
                      <Label className="block mt-6">Como pretende pagar?</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {[["pix", "Pix"], ["debito", "Débito"], ["credito", "Crédito"]].map(([value, label]) => (
                          <button
                            type="button"
                            key={value}
                            onClick={() => set("metodo_pagamento", value)}
                            className={`rounded-xl border py-2.5 text-sm transition-colors ${form.metodo_pagamento === value ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">O pagamento será confirmado pela recepção.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-10 flex items-center justify-between">
                <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="inline-flex items-center gap-2 text-sm text-muted-foreground disabled:opacity-40 hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                {step < 2 ? (
                  <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:brightness-110 transition-all">
                    Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={submit} disabled={!canNext || saving} className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground disabled:opacity-40 hover:brightness-110 transition-all">
                    {saving ? "Enviando..." : "Confirmar agendamento"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}