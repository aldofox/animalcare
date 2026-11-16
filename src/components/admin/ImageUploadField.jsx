import React, { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Image } from "@/components/ui/image";
import db from "@/api/base44Client";

export default function ImageUploadField({ label, value, onChange, aspect = "aspect-video" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const result = await db.integrations.Core.UploadFile({ file });
      onChange(result.file_url);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="sm:col-span-2">
      <Label>{label}</Label>
      <div className={`mt-2 overflow-hidden rounded-2xl border-2 border-dashed border-border ${aspect}`}>
        {value ? (
          <Image src={value} alt="Pré-visualização" className="h-full w-full" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Nenhuma imagem selecionada"}
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onChange={onFile} className="hidden" />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium disabled:opacity-50">
        <Upload className="h-4 w-4" /> {value ? "Trocar imagem" : "Enviar imagem"}
      </button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
