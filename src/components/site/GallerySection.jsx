import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { Camera } from "lucide-react";

const filtros = [
  { key: "todos", label: "Todos" },
  { key: "cao", label: "Cães" },
  { key: "gato", label: "Gatos" },
  { key: "outro", label: "Outros" },
];

export default function GallerySection({ images = [] }) {
  const [filtro, setFiltro] = React.useState("todos");
  if (images.length === 0) return null;

  const visiveis = filtro === "todos" ? images : images.filter((img) => (img.pet_especie || "cao") === filtro);

  return (
    <section id="galeria" className="bg-background py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-accent">
            <Camera className="w-4 h-4" /> Galeria
          </span>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary break-words">
            Bichinhos que passaram por aqui
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Um recorte dos companheiros que receberam nossos rituais de cuidado — cada foto é um registro do carinho que dedicamos.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`rounded-full px-5 py-2 text-sm font-medium border transition-colors ${
                filtro === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/40 text-foreground/70"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
          {visiveis.map((img, i) => (
            <motion.figure
              key={img.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className={`soft-lift group relative overflow-hidden rounded-3xl bg-secondary ${
                i % 5 === 0 ? "row-span-2" : ""
              }`}
            >
              <div className={`relative w-full ${i % 5 === 0 ? "h-full min-h-[320px]" : "aspect-square"}`}>
                <Image
                  src={img.foto_url}
                  alt={img.pet_nome}
                  fittingType="fill"
                  className="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-white font-bold text-sm">{img.pet_nome}</p>
                  {img.legenda && (
                    <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{img.legenda}</p>
                  )}
                </figcaption>
              </div>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}