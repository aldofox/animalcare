import db from "@/api/base44Client";

import React, { useEffect, useState } from "react";

import { CalendarDays, Wallet, Clock, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import PageTitle from "@/components/admin/PageTitle";
import KpiCard from "@/components/admin/KpiCard";
import AlertsPanel from "@/components/admin/AlertsPanel";

const statusColors = { pendente: "#C87941", confirmado: "#2D5A4C", concluido: "#6B9A8A", cancelado: "#B0A99B" };
const amount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
};

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    (async () => {
      const [a, f] = await Promise.all([
        db.entities.Appointment.list("-created_date", 200),
        db.entities.FinancialRecord.list("-created_date", 200),
      ]);
      setAppointments(a);
      setRecords(f);
    })();
  }, []);

  const receita = records.filter((r) => r.tipo === "receita").reduce((s, r) => s + amount(r.valor), 0);
  const despesa = records.filter((r) => r.tipo === "despesa").reduce((s, r) => s + amount(r.valor), 0);
  const pendentes = appointments.filter((a) => a.status === "pendente").length;

  const byService = Object.values(
    appointments.reduce((acc, a) => {
      const k = a.service_nome || "Outros";
      acc[k] = acc[k] || { name: k, total: 0 };
      acc[k].total += 1;
      return acc;
    }, {})
  );

  const byStatus = Object.entries(
    appointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageTitle eyebrow="CONTROL TOWER" title="Visão geral do instituto" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard icon={Wallet} label="Receita registrada" value={`R$ ${receita.toFixed(2).replace(".", ",")}`} hint={`Despesas: R$ ${despesa.toFixed(2).replace(".", ",")}`} />
        <KpiCard icon={CalendarDays} label="Agendamentos" value={appointments.length} hint="Total histórico" />
        <KpiCard icon={Clock} label="Pendentes" value={pendentes} hint="Aguardando confirmação" />
        <KpiCard icon={Users} label="Resultado" value={`R$ ${(receita - despesa).toFixed(2).replace(".", ",")}`} hint="Receita menos despesas" />
      </div>

      <div className="mt-8">
        <AlertsPanel appointments={appointments} records={records} />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-card border border-border p-7">
          <h2 className="font-bold text-primary">Demanda por serviço</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byService}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#B0A99B" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#B0A99B" />
                <Tooltip />
                <Bar dataKey="total" fill="#2D5A4C" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl bg-card border border-border p-7">
          <h2 className="font-bold text-primary">Status</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={3}>
                  {byStatus.map((s) => (
                    <Cell key={s.name} fill={statusColors[s.name] || "#B0A99B"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5 text-sm">
            {byStatus.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 capitalize text-foreground/70">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[s.name] }} /> {s.name}
                </span>
                <span className="font-semibold text-primary">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}