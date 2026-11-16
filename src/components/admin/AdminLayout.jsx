import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, Scissors, Stethoscope, Wallet, MessageSquareQuote, Images, History, Home, Menu, X, HelpCircle, Mail, Users } from "lucide-react";
import Logo from "@/components/site/Logo";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { to: "/admin/servicos", label: "Serviços", icon: Scissors },
  { to: "/admin/veterinarios", label: "Veterinários", icon: Stethoscope },
  { to: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquareQuote },
  { to: "/admin/galeria", label: "Galeria", icon: Images },
  { to: "/admin/faq", label: "Perguntas Frequentes", icon: HelpCircle },
  { to: "/admin/historico-pets", label: "Histórico por pet", icon: History },
  { to: "/admin/mensagens", label: "Mensagens", icon: Mail },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-72 bg-sidebar text-sidebar-foreground p-7 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <Logo light />
        <nav className="mt-12 space-y-1.5 flex-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${pathname === n.to ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60"}`}
            >
              <n.icon className="w-4 h-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60 transition-colors">
          <Home className="w-4 h-4" /> Ver o site
        </Link>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden sticky top-0 z-30 glass border-b border-border px-5 py-4 flex items-center justify-between">
          <Logo />
          <button onClick={() => setOpen(!open)} className="w-10 h-10 grid place-items-center rounded-full border border-border" aria-label="Menu admin">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <main className="p-6 lg:p-10 max-w-6xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}