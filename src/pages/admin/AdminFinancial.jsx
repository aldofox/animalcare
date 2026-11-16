import db from "@/api/base44Client";

import React, { useEffect, useState } from "react";

import { Plus, Trash2, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageTitle from "@/components/admin/PageTitle";
import KpiCard from "@/components/admin/KpiCard";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const empty = { descricao: "", valor: "", tipo: "receita", metodo_pagamento: "pix", data_pagamento: "" };
const amount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.abs(parsed) : 0;
};
const brl = (n) => `R$ ${amount(n).toFixed(2).replace(".", ",")}`;
const paymentLabels = { pix: "Pix", credito: "Crédito", debito: "Débito", dinheiro: "Dinheiro", transferencia: "Transferência" };

const PERIODS = [
  { id: "semana", label: "Esta semana" },
  { id: "mes", label: "Este mês" },
  { id: "mes_anterior", label: "Mês anterior" },
  { id: "total", label: "Tudo" },
];

function getRange(periodo) {
  const now = new Date();
  if (periodo === "semana") {
    return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) };
  }
  if (periodo === "mes") {
    return { start: startOfMonth(now), end: endOfMonth(now) };
  }
  if (periodo === "mes_anterior") {
    const prev = subMonths(now, 1);
    return { start: startOfMonth(prev), end: endOfMonth(prev) };
  }
  return null;
}

function rangeLabel(periodo) {
  if (periodo === "total") return "Todos os lançamentos";
  const { start, end } = getRange(periodo);
  return `${format(start, "dd/MM", { locale: ptBR })} a ${format(end, "dd/MM/yyyy", { locale: ptBR })}`;
}

export default function AdminFinancial() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [periodo, setPeriodo] = useState("mes");

  const load = async () => setItems(await db.entities.FinancialRecord.list("-data_pagamento", 200));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const valor = amount(form.valor);
    if (!form.descricao.trim() || valor <= 0) return;
    await db.entities.FinancialRecord.create({ ...form, valor });
    setForm(empty); load();
  };
  const remove = async (id) => { await db.entities.FinancialRecord.delete(id); load(); };

  const range = getRange(periodo);
  const filtered = range
    ? items.filter((i) => {
        if (!i.data_pagamento) return false;
        const d = new Date(i.data_pagamento + "T00:00:00");
        return d >= range.start && d <= range.end;
      })
    : items;

  const receita = filtered.filter((i) => i.tipo === "receita").reduce((s, i) => s + amount(i.valor), 0);
  const despesa = filtered.filter((i) => i.tipo === "despesa").reduce((s, i) => s + amount(i.valor), 0);

  return (
    <div>
      <PageTitle eyebrow="FINANCEIRO" title="Receitas e despesas" />
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriodo(p.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${periodo === p.id ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
          >
            {p.label}
          </button>
        ))}
        <span className="ml-1 text-sm text-muted-foreground">{rangeLabel(periodo)}</span>
      </div>
      <div className="grid sm:grid-cols-3 gap-5 mt-5">
        <KpiCard icon={TrendingUp} label="Receitas" value={brl(receita)} />
        <KpiCard icon={TrendingDown} label="Despesas" value={brl(despesa)} />
        <KpiCard icon={Scale} label="Saldo" value={brl(receita - despesa)} />
      </div>

      <div className="mt-8 rounded-3xl bg-card border border-border p-7">
        <h2 className="font-bold text-primary">Novo lançamento</h2>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="sm:col-span-2"><Label>Descrição</Label><Input className="mt-2 rounded-xl" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
          <div><Label>Valor</Label><Input type="number" className="mt-2 rounded-xl" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
          <div><Label>Data</Label><Input type="date" className="mt-2 rounded-xl" value={form.data_pagamento} onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })} /></div>
          <div>
            <Label>Tipo</Label>
            <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div>
            <Label>Método</Label>
            <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={form.metodo_pagamento} onChange={(e) => setForm({ ...form, metodo_pagamento: e.target.value })}>
              <option value="pix">Pix</option>
              <option value="credito">Crédito</option>
              <option value="debito">Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="transferencia">Transferência</option>
            </select>
          </div>
        </div>
        <button onClick={save} disabled={!form.descricao.trim() || amount(form.valor) <= 0} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
          <Plus className="w-4 h-4" /> Lançar
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-10">Nenhum lançamento no período selecionado.</p>
        )}
        {filtered.map((i) => (
          <div key={i.id} className="rounded-2xl bg-card border border-border px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-primary">{i.descricao}</p>
              <p className="text-sm text-muted-foreground">{i.data_pagamento || "—"} · {paymentLabels[i.metodo_pagamento] || "Não informado"}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-bold ${i.tipo === "receita" ? "text-primary" : "text-accent"}`}>
                {i.tipo === "receita" ? "+" : "−"} {brl(i.valor)}
              </span>
              <button onClick={() => remove(i.id)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors" aria-label="Excluir"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}