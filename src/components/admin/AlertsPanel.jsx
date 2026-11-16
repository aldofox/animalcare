import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, CircleDollarSign, ChevronRight } from "lucide-react";

const brl = (n) => `R$ ${Number(n || 0).toFixed(2).replace(".", ",")}`;

// Um agendamento é considerado "pago" quando existe um FinancialRecord
// vinculado ao seu id (appointment_id).
function isPaid(appt, records) {
  return records.some((r) => r.appointment_id === appt.id && r.tipo === "receita");
}

export default function AlertsPanel({ appointments, records }) {
  const alertas = appointments
    .filter((a) => a.status !== "cancelado" && a.status !== "concluido")
    .map((a) => ({
      ...a,
      pago: isPaid(a, records),
    }))
    .filter((a) => a.status === "pendente" || !a.pago);

  const pendentes = alertas.filter((a) => a.status === "pendente").length;
  const naoPagos = alertas.filter((a) => a.status !== "pendente" && !a.pago).length;

  if (alertas.length === 0) {
    return (
      <div className="rounded-3xl bg-card border border-border p-7">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 grid place-items-center rounded-full bg-primary/10 text-primary">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold text-primary">Alertas</h2>
            <p className="text-sm text-muted-foreground">Tudo em dia — nenhum agendamento pendente.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-accent/5 border border-accent/30 p-7">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 grid place-items-center rounded-full bg-accent/15 text-accent">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-bold text-primary">Agendamentos que precisam de atenção</h2>
            <p className="text-sm text-muted-foreground">
              {pendentes} aguardando confirmação · {naoPagos} confirmados sem pagamento registrado
            </p>
          </div>
        </div>
        <Link to="/admin/agendamentos" className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:gap-2 transition-all">
          Resolver <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-5 space-y-2.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
        {alertas.map((a) => {
          const semConfirmacao = a.status === "pendente";
          return (
            <div
              key={a.id}
              className={`rounded-2xl border px-5 py-3.5 flex items-center justify-between gap-4 ${semConfirmacao ? "border-accent/40 bg-accent/8" : "border-primary/25 bg-primary/5"}`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-primary truncate">
                  {a.pet_nome} <span className="text-sm font-normal text-muted-foreground">· {a.tutor_nome}</span>
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {a.service_nome} · {a.data_agendada} às {a.hora}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {semConfirmacao && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 text-accent text-xs font-medium px-3 py-1">
                    <Clock className="w-3 h-3" /> Não confirmado
                  </span>
                )}
                {!a.pago && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 text-primary text-xs font-medium px-3 py-1">
                    <CircleDollarSign className="w-3 h-3" /> Não pago{a.valor ? ` · ${brl(a.valor)}` : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}