import db from "@/api/base44Client";

import React, { useEffect, useState } from "react";

import { HelpCircle, Pencil, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const CATEGORIAS = [
  { value: "geral", label: "Geral" },
  { value: "procedimentos", label: "Procedimentos" },
  { value: "agendamento", label: "Agendamento" },
  { value: "pagamento", label: "Pagamento" },
];

const FORM_INIT = { pergunta: "", resposta: "", categoria: "geral", ordem: 0 };

export default function AdminFaq() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(FORM_INIT);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    const data = await db.entities.FAQ.list("ordem", 100);
    setFaqs(data);
  };

  useEffect(() => {
    carregar();
  }, []);

  const limpar = () => {
    setForm(FORM_INIT);
    setEditId(null);
  };

  const salvar = async (e) => {
    e.preventDefault();
    if (!form.pergunta.trim() || !form.resposta.trim()) return;
    setLoading(true);
    try {
      if (editId) {
        await db.entities.FAQ.update(editId, form);
      } else {
        await db.entities.FAQ.create(form);
      }
      limpar();
      await carregar();
    } finally {
      setLoading(false);
    }
  };

  const editar = (item) => {
    setEditId(item.id);
    setForm({ pergunta: item.pergunta, resposta: item.resposta, categoria: item.categoria || "geral", ordem: item.ordem || 0 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const excluir = async (id) => {
    await db.entities.FAQ.delete(id);
    await carregar();
  };

  const toggleAtivo = async (item) => {
    await db.entities.FAQ.update(item.id, { ativo: !item.ativo });
    await carregar();
  };

  return (
    <div>
      <PageTitle
        eyebrow="Conteúdo"
        title="Perguntas Frequentes"
        action={
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <HelpCircle className="w-4 h-4" /> {faqs.filter((f) => f.ativo).length} ativas
          </span>
        }
      />

      <form onSubmit={salvar} className="mt-8 rounded-3xl bg-card border border-border p-6 space-y-4">
        <h3 className="font-semibold text-primary">{editId ? "Editar pergunta" : "Nova pergunta"}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="pergunta">Pergunta</Label>
            <Input id="pergunta" value={form.pergunta} onChange={(e) => setForm({ ...form, pergunta: e.target.value })} placeholder="Ex: Preciso agendar com antecedência?" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoria</Label>
            <select
              id="categoria"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="resposta">Resposta</Label>
          <Textarea id="resposta" value={form.resposta} onChange={(e) => setForm({ ...form, resposta: e.target.value })} placeholder="Digite a resposta que aparecerá na home..." rows={3} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ordem">Ordem (menor aparece primeiro)</Label>
          <Input id="ordem" type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })} />
        </div>
        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={loading}>{editId ? "Salvar alterações" : "Adicionar pergunta"}</Button>
          {editId && <Button type="button" variant="outline" onClick={limpar}>Cancelar</Button>}
        </div>
      </form>

      <div className="mt-8 space-y-3">
        {faqs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Nenhuma pergunta cadastrada ainda.</div>
        )}
        {faqs.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">{CATEGORIAS.find((c) => c.value === item.categoria)?.label || "Geral"}</span>
                {!item.ativo && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">oculta</span>}
              </div>
              <p className="mt-2 font-semibold text-primary">{item.pergunta}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.resposta}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => toggleAtivo(item)} className="w-9 h-9 grid place-items-center rounded-lg border border-border hover:bg-secondary" title={item.ativo ? "Ocultar" : "Mostrar"}>
                {item.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => editar(item)} className="w-9 h-9 grid place-items-center rounded-lg border border-border hover:bg-secondary" title="Editar">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => excluir(item.id)} className="w-9 h-9 grid place-items-center rounded-lg border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" title="Excluir">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}