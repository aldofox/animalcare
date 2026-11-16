import db from "@/api/base44Client";

import React, { useEffect, useState } from "react";

import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageTitle from "@/components/admin/PageTitle";

const empty = { autor: "", pet_nome: "", texto: "", nota: 5, publicado: true };

export default function AdminTestimonials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);

  const load = async () => setItems(await db.entities.Testimonial.list("-created_date", 100));
  useEffect(() => { load(); }, []);

  const save = async () => {
    await db.entities.Testimonial.create({ ...form, nota: Number(form.nota) });
    setForm(empty); load();
  };
  const toggle = async (t) => { await db.entities.Testimonial.update(t.id, { publicado: !t.publicado }); load(); };
  const remove = async (id) => { await db.entities.Testimonial.delete(id); load(); };

  return (
    <div>
      <PageTitle eyebrow="REPUTAÇÃO" title="Depoimentos" />
      <div className="rounded-3xl bg-card border border-border p-7">
        <div className="grid sm:grid-cols-3 gap-5">
          <div><Label>Autor</Label><Input className="mt-2 rounded-xl" value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} /></div>
          <div><Label>Nome do pet</Label><Input className="mt-2 rounded-xl" value={form.pet_nome} onChange={(e) => setForm({ ...form, pet_nome: e.target.value })} /></div>
          <div><Label>Nota (1-5)</Label><Input type="number" min="1" max="5" className="mt-2 rounded-xl" value={form.nota} onChange={(e) => setForm({ ...form, nota: e.target.value })} /></div>
          <div className="sm:col-span-3"><Label>Depoimento</Label><Textarea rows={3} className="mt-2 rounded-xl" value={form.texto} onChange={(e) => setForm({ ...form, texto: e.target.value })} /></div>
        </div>
        <button onClick={save} disabled={!form.autor || !form.texto} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
          <Plus className="w-4 h-4" /> Adicionar depoimento
        </button>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {items.map((t) => (
          <div key={t.id} className="soft-lift rounded-3xl bg-card border border-border p-6">
            <p className="text-sm text-foreground/70">{t.texto}</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">{t.autor}</p>
                <p className="text-xs text-muted-foreground">tutor(a) de {t.pet_nome} · {t.nota}★</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(t)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-secondary transition-colors" aria-label="Publicar">
                  {t.publicado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(t.id)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors" aria-label="Excluir"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}