import db from "@/api/base44Client";

import React, { useEffect, useRef, useState } from "react";

import { Plus, Trash2, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image as Img } from "@/components/ui/image";
import PageTitle from "@/components/admin/PageTitle";

const empty = { pet_nome: "", pet_especie: "cao", legenda: "", foto_url: "", ativo: true, ordem: 0 };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = async () => setItems(await db.entities.GalleryImage.list("ordem", 100));
  useEffect(() => { load(); }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, foto_url: file_url }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    if (!form.foto_url || !form.pet_nome) return;
    await db.entities.GalleryImage.create({ ...form, ordem: Number(form.ordem) || 0 });
    setForm(empty);
    load();
  };
  const toggle = async (g) => { await db.entities.GalleryImage.update(g.id, { ativo: !g.ativo }); load(); };
  const remove = async (id) => { await db.entities.GalleryImage.delete(id); load(); };

  return (
    <div>
      <PageTitle eyebrow="RECORDES" title="Galeria de fotos" />

      <div className="rounded-3xl bg-card border border-border p-7">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label>Foto do pet</Label>
            <div className="mt-2 rounded-2xl border-2 border-dashed border-border p-4">
              {form.foto_url ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <Img src={form.foto_url} fittingType="fill" className="absolute inset-0 w-full h-full" />
                </div>
              ) : (
                <div className="aspect-video grid place-items-center text-muted-foreground text-sm">
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Pré-visualização aparecerá aqui"}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" id="gallery-upload" />
              <label htmlFor="gallery-upload" className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium cursor-pointer hover:bg-secondary/80 transition-colors">
                <Upload className="w-4 h-4" /> {form.foto_url ? "Trocar imagem" : "Enviar imagem"}
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <div><Label>Nome do pet</Label><Input className="mt-2 rounded-xl" value={form.pet_nome} onChange={(e) => setForm({ ...form, pet_nome: e.target.value })} /></div>
            <div>
              <Label>Espécie</Label>
              <div className="mt-2 flex gap-2">
                {[{ v: "cao", l: "Cão" }, { v: "gato", l: "Gato" }, { v: "outro", l: "Outro" }].map((s) => (
                  <button key={s.v} type="button" onClick={() => setForm({ ...form, pet_especie: s.v })} className={`rounded-xl px-4 py-2 text-sm border transition-colors ${form.pet_especie === s.v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>{s.l}</button>
                ))}
              </div>
            </div>
            <div><Label>Legenda (opcional)</Label><Textarea rows={2} className="mt-2 rounded-xl" value={form.legenda} onChange={(e) => setForm({ ...form, legenda: e.target.value })} /></div>
            <div><Label>Ordem (menor aparece primeiro)</Label><Input type="number" className="mt-2 rounded-xl" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: e.target.value })} /></div>
          </div>
        </div>
        <button onClick={save} disabled={!form.pet_nome || !form.foto_url || uploading} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
          <Plus className="w-4 h-4" /> Adicionar à galeria
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">Nenhuma foto na galeria ainda.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((g) => (
            <div key={g.id} className="soft-lift rounded-2xl bg-card border border-border overflow-hidden">
              <div className="relative aspect-square">
                <Img src={g.foto_url} alt={g.pet_nome} fittingType="fill" className="absolute inset-0 w-full h-full" />
                {!g.ativo && <div className="absolute inset-0 bg-black/50 grid place-items-center"><span className="text-white text-xs font-semibold">OCULTO</span></div>}
              </div>
              <div className="p-4">
                <p className="font-bold text-primary text-sm">{g.pet_nome}</p>
                {g.legenda && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.legenda}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toggle(g)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-secondary transition-colors" aria-label="Publicar">
                    {g.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(g.id)} className="w-9 h-9 grid place-items-center rounded-xl border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors" aria-label="Excluir"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}