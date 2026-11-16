import db from "@/api/base44Client";

import React, { useEffect, useState } from "react";

import { Plus, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageTitle from "@/components/admin/PageTitle";
import ImageUploadField from "@/components/admin/ImageUploadField";

const empty = { nome: "", descricao: "", categoria: "higiene", preco: "", duracao_minutos: 30, imagem_url: "", ativo: true };

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = async () => setItems(await db.entities.Service.list("-created_date", 100));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const data = { ...form, preco: Number(form.preco), duracao_minutos: Number(form.duracao_minutos) };
    if (editing) await db.entities.Service.update(editing, data);
    else await db.entities.Service.create(data);
    setForm(empty); setEditing(null); load();
  };

  const edit = (s) => { setEditing(s.id); setForm({ ...empty, ...s }); };
  const remove = async (id) => { await db.entities.Service.delete(id); load(); };

  return (
    <div>
      <PageTitle eyebrow="CATÁLOGO" title="Serviços" />
      <div className="rounded-3xl bg-card border border-border p-7">
        <h2 className="font-bold text-primary">{editing ? "Editar serviço" : "Novo serviço"}</h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-5">
          <div><Label>Nome</Label><Input className="mt-2 rounded-xl" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
          <div>
            <Label>Categoria</Label>
            <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              <option value="higiene">Higiene</option>
              <option value="veterinario">Veterinário</option>
              <option value="estetica">Estética</option>
              <option value="bem_estar">Bem-estar</option>
            </select>
          </div>
          <div><Label>Preço (R$)</Label><Input type="number" className="mt-2 rounded-xl" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} /></div>
          <div><Label>Duração (min)</Label><Input type="number" className="mt-2 rounded-xl" value={form.duracao_minutos} onChange={(e) => setForm({ ...form, duracao_minutos: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Descrição</Label><Textarea rows={3} className="mt-2 rounded-xl" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
          <ImageUploadField label="Imagem do serviço" value={form.imagem_url} onChange={(imagem_url) => setForm({ ...form, imagem_url })} />
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={save} disabled={!form.nome || !form.preco} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            <Plus className="w-4 h-4" /> {editing ? "Salvar alterações" : "Adicionar serviço"}
          </button>
          {editing && <button onClick={() => { setEditing(null); setForm(empty); }} className="rounded-full border border-border px-6 py-3 text-sm">Cancelar</button>}
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {items.map((s) => (
          <div key={s.id} className="soft-lift rounded-3xl bg-card border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-primary">{s.nome}</p>
                <p className="text-sm text-muted-foreground">R$ {Number(s.preco).toFixed(2).replace(".", ",")} · {s.duracao_minutos} min</p>
                <p className="mt-2 text-sm text-foreground/65">{s.descricao}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(s)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-secondary transition-colors" aria-label="Editar"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(s.id)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors" aria-label="Excluir"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}