import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LayoutDashboard } from "lucide-react";
import Logo from "./Logo";

const links = [
  { label: "Instituto", href: "#instituto" },
  { label: "Serviços", href: "#servicos" },
  { label: "Veterinários", href: "#veterinarios" },
  { label: "Agendar", href: "#agendamento" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-[#0F221C]/95 text-[#F9F7F2] shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-500 ${solid ? "border-b border-white/10 py-3" : "border-b border-transparent py-5"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#top"><Logo light /></a>
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[#F9F7F2]/85 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#F9F7F2]/35 px-4 py-2 text-sm text-[#F9F7F2] hover:bg-[#F9F7F2] hover:text-[#0F221C] transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> Área Admin
          </Link>
          <a href="#agendamento" className="hidden md:inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:brightness-110 transition-all">
            Agendar agora
          </a>
          <button onClick={() => setOpen(!open)} className="lg:hidden w-10 h-10 grid place-items-center rounded-full border border-white/30 text-[#F9F7F2] hover:bg-white/10 transition-colors" aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[#0F221C] px-6 py-6 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-base text-[#F9F7F2]/85 hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
          <Link to="/admin" className="text-base text-[#F9F7F2] font-medium">Área Admin</Link>
        </div>
      )}
    </header>
  );
}