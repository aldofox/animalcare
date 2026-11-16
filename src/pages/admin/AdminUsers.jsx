import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, UserRound } from "lucide-react";
import db from "@/api/base44Client";
import PageTitle from "@/components/admin/PageTitle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const createEmptyForm = () => ({ email: "", password: "", role: "user", verified: true });

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setUsers(await db.entities.User.list("-created_date", 200));
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      const data = { email: form.email, role: form.role, verified: form.verified };
      if (form.password) data.password = form.password;
      if (editing) await db.entities.User.update(editing, data);
      else await db.entities.User.create({ ...data, password: form.password });
      setForm(createEmptyForm());
      setEditing(null);
      await load();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (user) => {
    setEditing(user.id);
    setForm({ email: user.email, password: "", role: user.role, verified: Boolean(user.verified) });
    setError("");
  };

  const remove = async (user) => {
    if (!window.confirm(`Excluir o usuário ${user.email}?`)) return;
    try {
      await db.entities.User.delete(user.id);
      await load();
    } catch (removeError) {
      setError(removeError.message);
    }
  };

  return (
    <div>
      <PageTitle eyebrow="ADMINISTRAÇÃO" title="Usuários" />
      <div className="rounded-3xl border border-border bg-card p-7">
        <h2 className="font-bold text-primary">{editing ? "Editar usuário" : "Novo usuário"}</h2>
        <form autoComplete="off" onSubmit={(event) => { event.preventDefault(); save(); }} className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="user-email">E-mail</Label>
            <Input id="user-email" name="animalcare-new-user-email" type="email" autoComplete="new-password" className="mt-2 rounded-xl" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="user-password">{editing ? "Nova senha (opcional)" : "Senha"}</Label>
            <Input id="user-password" name="animalcare-new-user-password" type="password" autoComplete="new-password" minLength={6} className="mt-2 rounded-xl" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
          </div>
          <div>
            <Label htmlFor="user-role">Perfil</Label>
            <select id="user-role" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <label className="flex items-center gap-3 self-end text-sm">
            <input type="checkbox" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
            E-mail verificado
          </label>
        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving || !form.email || (!editing && !form.password)} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            <Plus className="h-4 w-4" /> {saving ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar usuário"}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(createEmptyForm()); setError(""); }} className="rounded-full border border-border px-6 py-3 text-sm">Cancelar</button>}
        </div>
        </form>
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-border text-muted-foreground">
            <tr><th className="p-5">Usuário</th><th className="p-5">Perfil</th><th className="p-5">Status</th><th className="p-5 text-right">Ações</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="p-5"><span className="flex items-center gap-2 font-medium text-primary"><UserRound className="h-4 w-4" />{user.email}</span></td>
                <td className="p-5 capitalize">{user.role === "admin" ? "Administrador" : "Usuário"}</td>
                <td className="p-5">{user.verified ? "Verificado" : "Pendente"}</td>
                <td className="p-5"><div className="flex justify-end gap-2"><button onClick={() => edit(user)} className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:bg-secondary" aria-label="Editar usuário"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(user)} className="grid h-9 w-9 place-items-center rounded-xl border border-border hover:bg-destructive hover:text-destructive-foreground" aria-label="Excluir usuário"><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <p className="p-8 text-center text-muted-foreground">Nenhum usuário cadastrado.</p>}
      </div>
    </div>
  );
}
