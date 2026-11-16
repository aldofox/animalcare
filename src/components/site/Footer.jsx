import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-primary text-[#F9F7F2] pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm text-[#F9F7F2]/70">
            Ecossistema de bem-estar animal de elite. Rituais de higiene sensorial e medicina preventiva de precisão.
          </p>
          <div className="mt-6 flex gap-3">
            {[[Instagram, "https://instagram.com"], [Facebook, "https://facebook.com"], [Linkedin, "https://linkedin.com"]].map(([Icon, url], i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-[#F9F7F2]/25 grid place-items-center hover:bg-[#F9F7F2]/10 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide">Navegação</p>
          <ul className="mt-4 space-y-3 text-sm text-[#F9F7F2]/70">
            <li><a href="#instituto" className="hover:text-accent transition-colors">Instituto</a></li>
            <li><a href="#servicos" className="hover:text-accent transition-colors">Serviços</a></li>
            <li><a href="#veterinarios" className="hover:text-accent transition-colors">Veterinários</a></li>
            <li><a href="#agendamento" className="hover:text-accent transition-colors">Agendamento</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide">Institucional</p>
          <ul className="mt-4 space-y-3 text-sm text-[#F9F7F2]/70">
            <li><a href="#depoimentos" className="hover:text-accent transition-colors">Depoimentos</a></li>
            <li><a href="#contato" className="hover:text-accent transition-colors">Contato</a></li>
            <li><Link to="/admin" className="hover:text-accent transition-colors">Área administrativa</Link></li>
            <li><a href="tel:+551140028922" className="hover:text-accent transition-colors">(11) 4002-8922</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-14 pt-6 border-t border-[#F9F7F2]/15 text-xs text-[#F9F7F2]/50">
        © {new Date().getFullYear()} Anima Care Institute. Todos os direitos reservados.
      </div>
    </footer>
  );
}