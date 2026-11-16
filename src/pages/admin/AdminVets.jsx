import db from "@/api/base44Client";

import React, { useEffect, useState } from "react";

import { Plus, Trash2, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageTitle from "@/components/admin/PageTitle";
import ImageUploadField from "@/components/admin/ImageUploadField";

const empty = { nome: "", crmv: "", especialidade: "", bio: "", foto_url: "", ativo: true };

export default function AdminVets() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = async () => setItems(await db.entities.Veterinarian.list("-created_date", 100));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing) await db.entities.Veterinarian.update(editing, form);
    else await db.entities.Veterinarian.create(form);
    setForm(empty); setEditing(null); load();
  };
  const remove = async (id) => { await db.entities.Veterinarian.delete(id); load(); };

  return (
    <div>
      <PageTitle eyebrow="CORPO CLÍNICO" title="Veterinários" />
      <div className="rounded-3xl bg-card border border-border p-7">
        <h2 className="font-bold text-primary">{editing ? "Editar veterinário" : "Novo veterinário"}</h2>
        <div className="mt-5 grid sm:grid-cols-2 gap-5">
          <div><Label>Nome</Label><Input className="mt-2 rounded-xl" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
          <div><Label>CRMV</Label><Input className="mt-2 rounded-xl" value={form.crmv} onChange={(e) => setForm({ ...form, crmv: e.target.value })} /></div>
          <div><Label>Especialidade</Label><Input className="mt-2 rounded-xl" value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} /></div>
          <ImageUploadField label="Foto do veterinário" value={form.foto_url} onChange={(foto_url) => setForm({ ...form, foto_url })} aspect="aspect-[4/3]" />
          <div className="sm:col-span-2"><Label>Bio</Label><Textarea rows={3} className="mt-2 rounded-xl" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={save} disabled={!form.nome} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            <Plus className="w-4 h-4" /> {editing ? "Salvar alterações" : "Adicionar"}
          </button>
          {editing && <button onClick={() => { setEditing(null); setForm(empty); }} className="rounded-full border border-border px-6 py-3 text-sm">Cancelar</button>}
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {items.map((v) => (
          <div key={v.id} className="soft-lift rounded-3xl bg-card border border-border p-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-primary">{v.nome}</p>
              <p className="text-sm text-muted-foreground">{v.especialidade} · CRMV {v.crmv}</p>
              <p className="mt-2 text-sm text-foreground/65">{v.bio}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(v.id); setForm({ ...empty, ...v }); }} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-secondary transition-colors" aria-label="Editar"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(v.id)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors" aria-label="Excluir"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}