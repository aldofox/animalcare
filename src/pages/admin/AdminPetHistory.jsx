import db from "@/api/base44Client";

import React, { useEffect, useMemo, useState } from "react";

import { ChevronDown, PawPrint, Search } from "lucide-react";
import PageTitle from "@/components/admin/PageTitle";

const badge = {
  pendente: "bg-accent/15 text-accent",
  confirmado: "bg-primary/12 text-primary",
  concluido: "bg-secondary text-primary",
  cancelado: "bg-muted text-muted-foreground",
};

const especieLabel = { cao: "Cão", gato: "Gato", outro: "Outro" };

export default function AdminPetHistory() {
  const [items, setItems] = useState([]);
  const [openPet, setOpenPet] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => setItems(await db.entities.Appointment.list("-data_agendada", 500));
  useEffect(() => { load(); }, []);

  const pets = useMemo(() => {
    const map = {};
    items.forEach((a) => {
      const key = a.pet_nome?.trim() || "(sem nome)";
      if (!map[key]) {
        map[key] = {
          pet_nome: key,
          pet_especie: a.pet_especie,
          pet_raca: a.pet_raca,
          tutor_nome: a.tutor_nome,
          tutor_telefone: a.tutor_telefone,
          appointments: [],
          total: 0,
        };
      }
      map[key].appointments.push(a);
      if (a.status === "concluido") map[key].total += a.valor || 0;
    });
    return Object.values(map).sort((a, b) => b.appointments.length - a.appointments.length);
  }, [items]);

  const filtered = useMemo(
    () => pets.filter((p) => p.pet_nome.toLowerCase().includes(search.toLowerCase()) || p.tutor_nome?.toLowerCase().includes(search.toLowerCase())),
    [pets, search]
  );

  return (
    <div>
      <PageTitle eyebrow="HISTÓRICO" title="Atendimentos por pet" />

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por pet ou tutor..."
          className="w-full rounded-full border border-border bg-card pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhum atendimento registrado ainda.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((pet) => {
            const isOpen = openPet === pet.pet_nome;
            const lastVisit = pet.appointments[0];
            return (
              <div key={pet.pet_nome} className="rounded-3xl bg-card border border-border overflow-hidden">
                <button
                  onClick={() => setOpenPet(isOpen ? null : pet.pet_nome)}
                  className="w-full flex items-center gap-4 p-6 text-left hover:bg-secondary/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center shrink-0">
                    <PawPrint className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-primary">{pet.pet_nome}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {especieLabel[pet.pet_especie] || "Pet"}{pet.pet_raca ? ` · ${pet.pet_raca}` : ""} · {pet.tutor_nome}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-right">
                    <div>
                      <p className="text-2xl font-bold text-primary">{pet.appointments.length}</p>
                      <p className="text-xs text-muted-foreground">atendimentos</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-primary">R$ {pet.total.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">total investido</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-border p-6 space-y-3">
                    {pet.tutor_telefone && (
                      <p className="text-sm text-muted-foreground mb-2">Telefone do tutor: {pet.tutor_telefone}</p>
                    )}
                    {pet.appointments.map((a) => (
                      <div key={a.id} className="flex items-start gap-4 rounded-2xl bg-background p-4 border border-border">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{a.service_nome}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {a.data_agendada} às {a.hora}{a.vet_nome ? ` · ${a.vet_nome}` : ""}
                          </p>
                          {a.observacoes && <p className="text-xs text-foreground/60 mt-1 italic">"{a.observacoes}"</p>}
                        </div>
                        <div className="text-right shrink-0">
                          {a.valor > 0 && <p className="text-sm font-semibold text-primary">R$ {a.valor.toFixed(0)}</p>}
                          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${badge[a.status]}`}>{a.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}