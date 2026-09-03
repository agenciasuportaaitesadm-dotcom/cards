import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  MapPin,
  Instagram,
  Facebook,
  Video,
  Star,
  Phone,
  Globe,
  Clock,
} from "lucide-react";
import { studioExemplo } from "@/data/mockData";

const LinkButton = ({ icon: Icon, label, href, testId, tint }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-testid={testId}
    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#18181B] px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-[#27272A] active:scale-[0.99]"
  >
    <span
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${tint}1A`, color: tint }}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
    <span className="font-medium text-zinc-100">{label}</span>
    <span className="ml-auto text-zinc-600 transition-colors group-hover:text-indigo-400">→</span>
  </a>
);

const DemoCard = () => {
  const c = studioExemplo;
  const [copied, setCopied] = useState(false);

  const whatsappHref = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(
    "Olá! Vim pelo cartão digital e gostaria de mais informações."
  )}`;

  return (
    <div className="flex min-h-screen justify-center bg-[#09090B] text-[#FAFAFA] selection:bg-indigo-500 selection:text-white sm:items-start sm:py-8 sm:px-4">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden bg-[#121215] shadow-2xl sm:min-h-[840px] sm:rounded-[32px] sm:border sm:border-[#27272A]">
        {/* Cover */}
        <div className="relative h-48 w-full">
          <img src={c.cover} alt="Capa do Studio Exemplo" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-[#121215]/30 to-transparent" />
        </div>

        {/* Perfil */}
        <div className="z-10 -mt-16 px-6 text-center">
          <img
            src={c.avatar}
            alt={c.nome}
            data-testid="card-profile-avatar"
            className="mx-auto h-28 w-28 rounded-3xl border-4 border-[#121215] object-cover shadow-xl"
          />
          <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight" data-testid="card-business-name">
            {c.nome}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
            {c.descricao}
          </p>
        </div>

        {/* Botões */}
        <div className="mt-6 space-y-3 px-6">
          <LinkButton icon={MessageCircle} label="WhatsApp" href={whatsappHref} tint="#25D366" testId="card-whatsapp-button" />
          <LinkButton icon={MapPin} label="Localização" href={c.mapsUrl} tint="#EA4335" testId="card-location-button" />
          <LinkButton icon={Instagram} label="Instagram" href={c.instagram} tint="#E4405F" testId="card-instagram-button" />
          <LinkButton icon={Facebook} label="Facebook" href={c.facebook} tint="#1877F2" testId="card-facebook-button" />
          <LinkButton icon={Video} label="TikTok" href={c.tiktok} tint="#F1F1F1" testId="card-tiktok-button" />
          <LinkButton icon={Star} label="Avaliar no Google" href={c.googleReviewUrl} tint="#FBBC05" testId="card-google-review-button" />
          <LinkButton icon={Phone} label="Ligar agora" href={`tel:${c.telefone.replace(/\D/g, "")}`} tint="#6366F1" testId="card-call-button" />
        </div>

        {/* Serviços */}
        <div className="mt-8 px-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Serviços</h2>
          <div className="mt-3 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-[#18181B]">
            {c.servicos.map((s) => (
              <div key={s.titulo} className="flex items-center justify-between px-4 py-3" data-testid={`card-service-${s.titulo}`}>
                <span className="text-sm text-zinc-200">{s.titulo}</span>
                <span className="text-sm text-zinc-500">{s.detalhe}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Endereço */}
        <div className="mt-6 px-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Endereço</h2>
          <div className="mt-3 rounded-2xl border border-white/10 bg-[#18181B] p-4">
            <p className="flex items-start gap-3 text-sm text-zinc-300">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" />
              {c.endereco}
            </p>
            <a
              href={c.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="card-address-maps-button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              <MapPin className="h-4 w-4" /> Localização
            </a>
          </div>
        </div>

        {/* Horário */}
        <div className="mt-6 px-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Horário de funcionamento</h2>
          <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-[#18181B] p-4">
            {c.horario.map((h) => (
              <div key={h.dia} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" /> {h.dia}
                </span>
                <span className={h.horas === "Fechado" ? "text-zinc-500" : "text-zinc-200"}>{h.horas}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Telefone */}
        <div className="mt-6 px-6">
          <a
            href={`tel:${c.telefone.replace(/\D/g, "")}`}
            data-testid="card-phone-link"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#18181B] py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-[#27272A]"
          >
            <Phone className="h-4 w-4 text-indigo-400" /> {c.telefone}
          </a>
        </div>

        {/* Rodapé */}
        <footer className="mt-8 px-6 pb-8 pt-4 text-center">
          <a href={c.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
            <Globe className="h-3.5 w-3.5" /> {c.website.replace("https://", "")}
          </a>
          <p className="mt-3 text-[11px] text-zinc-600">Cartão digital por Digital Cards IA</p>
        </footer>
      </div>
    </div>
  );
};

export default DemoCard;
