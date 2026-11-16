import db from "@/api/base44Client";

import React, { useEffect, useState } from "react";

import { Trash2, Clock, CircleDollarSign, CheckCircle2 } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";

const statuses = ["pendente", "confirmado", "concluido", "cancelado"];
const badge = {
  pendente: "bg-accent/15 text-accent",
  confirmado: "bg-primary/12 text-primary",
  concluido: "bg-secondary text-primary",
  cancelado: "bg-muted text-muted-foreground",
};

export default function AdminBookings() {
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("todos");

  const load = async () => {
    const [a, f] = await Promise.all([
      db.entities.Appointment.list("-data_agendada", 200),
      db.entities.FinancialRecord.list("-created_date", 200),
    ]);
    setItems(a);
    setRecords(f);
  };
  useEffect(() => { load(); }, []);

  const isPaid = (appt) => records.some((r) => r.appointment_id === appt.id && r.tipo === "receita");
  const paymentLabel = { pix: "Pix", debito: "Débito", credito: "Crédito" };

  const removeFromCalendar = async (eventId) => {
    if (!eventId) return;
    try {
      await db.functions.invoke("sync-google-calendar", { action: "delete", eventId });
    } catch (error) {
      console.error("Não foi possível remover o evento do Google Calendar.", error);
    }
  };

  const changeStatus = async (item, status) => {
    await db.entities.Appointment.update(item.id, { status });
    if (status === "cancelado") {
      await removeFromCalendar(item.google_calendar_event_id);
    }
    load();
  };

  const registerPayment = async (item) => {
    if (isPaid(item)) return;
    const paymentDate = new Date().toISOString().slice(0, 10);
    await db.entities.FinancialRecord.create({
      appointment_id: item.id,
      descricao: `${item.service_nome} — ${item.pet_nome}`,
      valor: Number(item.valor || 0),
      tipo: "receita",
      metodo_pagamento: item.metodo_pagamento || "pix",
      data_pagamento: paymentDate,
    });
    await db.entities.Appointment.update(item.id, {
      pagamento_status: "pago",
      data_pagamento: paymentDate,
    });
    load();
  };

  const remove = async (item) => {
    await removeFromCalendar(item.google_calendar_event_id);
    await db.entities.Appointment.delete(item.id);
    load();
  };

  const list = filter === "todos" ? items : items.filter((i) => i.status === filter);

  return (
    <div>
      <PageTitle eyebrow="OPERAÇÃO" title="Agendamentos" />
      <div className="flex flex-wrap gap-2 mb-6">
        {["todos", ...statuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-4 py-2 text-sm capitalize border transition-colors ${filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {list.map((a) => {
          const semConfirmacao = a.status === "pendente";
          const naoPago = a.status !== "cancelado" && a.status !== "concluido" && !isPaid(a);
          const destaque = semConfirmacao || naoPago;
          return (
            <div
              key={a.id}
              className={`rounded-3xl border p-6 flex flex-wrap items-center gap-5 justify-between ${destaque ? "border-accent/40 bg-accent/5 ring-1 ring-accent/20" : "soft-lift bg-card border-border"}`}
            >
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-primary">{a.pet_nome} <span className="text-sm font-normal text-muted-foreground">· {a.tutor_nome}</span></p>
                  {semConfirmacao && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent text-[11px] font-medium px-2.5 py-0.5">
                      <Clock className="w-3 h-3" /> Não confirmado
                    </span>
                  )}
                  {naoPago && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 text-primary text-[11px] font-medium px-2.5 py-0.5">
                      <CircleDollarSign className="w-3 h-3" /> Não pago
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/65 mt-1">{a.service_nome}{a.vet_nome ? ` · ${a.vet_nome}` : ""}</p>
                <p className="text-sm text-muted-foreground">{a.data_agendada} às {a.hora} · {a.tutor_telefone}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Pagamento: <span className="font-medium text-foreground/80">{paymentLabel[a.metodo_pagamento] || "Não informado"}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isPaid(a) ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pago
                  </span>
                ) : a.status !== "cancelado" ? (
                  <button onClick={() => registerPayment(a)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all">
                    <CircleDollarSign className="w-3.5 h-3.5" /> Registrar pagamento
                  </button>
                ) : null}
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${badge[a.status]}`}>{a.status}</span>
                <select value={a.status} onChange={(e) => changeStatus(a, e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm capitalize">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => remove(a)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors" aria-label="Excluir">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-muted-foreground">Nenhum agendamento neste filtro.</p>}
      </div>
    </div>
  );
}