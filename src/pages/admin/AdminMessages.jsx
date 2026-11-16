import React, { useEffect, useState } from "react";
import { Mail, Trash2, Check } from "lucide-react";
import db from "@/api/base44Client";
import PageTitle from "@/components/admin/PageTitle";
import { Button } from "@/components/ui/button";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setMessages(await db.entities.ContactMessage.list("-created_date", 200));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (message) => {
    await db.entities.ContactMessage.update(message.id, { lida: true });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir esta mensagem?")) return;
    await db.entities.ContactMessage.delete(id);
    load();
  };

  return (
    <div>
      <PageTitle eyebrow="COMUNICAÇÃO" title="Mensagens de contato" />
      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      <div className="space-y-3">
        {messages.map((message) => (
          <article key={message.id} className={`rounded-2xl border border-border bg-card p-5 ${message.lida ? "" : "border-primary/40"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Mail className="h-4 w-4" /> {message.nome}
                  {!message.lida && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">Nova</span>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{message.email || "Sem e-mail"} {message.telefone && `· ${message.telefone}`}</p>
                <p className="mt-4 whitespace-pre-wrap text-sm">{message.mensagem}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!message.lida && <Button size="icon" variant="outline" onClick={() => markRead(message)} title="Marcar como lida"><Check className="h-4 w-4" /></Button>}
                <Button size="icon" variant="outline" onClick={() => remove(message.id)} title="Excluir"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </article>
        ))}
        {!messages.length && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">Nenhuma mensagem recebida.</p>}
      </div>
    </div>
  );
}
