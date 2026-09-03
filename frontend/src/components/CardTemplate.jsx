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

const DEFAULT_COVER =
  "https://images.pexels.com/photos/13068380/pexels-photo-13068380.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&w=400&q=80";

const onlyDigits = (v) => (v || "").replace(/\D/g, "");

const LinkButton = ({ icon: Icon, label, href, testId, tint }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-testid={testId}
    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-white/10 active:scale-[0.99]"
  >
    <span
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${tint}1A`, color: tint }}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
    <span className="font-medium text-zinc-100">{label}</span>
    <span className="ml-auto text-zinc-500 transition-colors group-hover:text-indigo-400">→</span>
  </a>
);

const parseHorario = (horario) => {
  if (!horario) return [];
  if (Array.isArray(horario)) return horario;
  return String(horario)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { dia: line, horas: "" };
      return { dia: line.slice(0, idx).trim(), horas: line.slice(idx + 1).trim() };
    });
};

/**
 * Template visual compartilhado do cartão digital.
 * data: { nome, descricao, avatar, cover, corFundo, corBotoes,
 *   whatsapp, telefone, mapsUrl, endereco, instagram, facebook, tiktok,
 *   website, googleReviewUrl, horario, servicos }
 */
const CardTemplate = ({ data }) => {
  const c = data || {};
  const corFundo = c.corFundo || "#121215";
  const corBotoes = c.corBotoes || "#6366F1";
  const cover = c.cover || DEFAULT_COVER;
  const avatar = c.avatar || DEFAULT_AVATAR;
  const horario = parseHorario(c.horario);
  const servicos = c.servicos || [];

  const buttons = [
    c.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/${onlyDigits(c.whatsapp)}`,
      tint: "#25D366",
      testId: "card-whatsapp-button",
    },
    c.mapsUrl && {
      icon: MapPin,
      label: "Localização",
      href: c.mapsUrl,
      tint: "#EA4335",
      testId: "card-location-button",
    },
    c.instagram && {
      icon: Instagram,
      label: "Instagram",
      href: c.instagram,
      tint: "#E4405F",
      testId: "card-instagram-button",
    },
    c.facebook && {
      icon: Facebook,
      label: "Facebook",
      href: c.facebook,
      tint: "#1877F2",
      testId: "card-facebook-button",
    },
    c.tiktok && {
      icon: Video,
      label: "TikTok",
      href: c.tiktok,
      tint: "#F1F1F1",
      testId: "card-tiktok-button",
    },
    c.website && {
      icon: Globe,
      label: "Website",
      href: c.website,
      tint: corBotoes,
      testId: "card-website-button",
    },
    c.googleReviewUrl && {
      icon: Star,
      label: "Avaliar no Google",
      href: c.googleReviewUrl,
      tint: "#FBBC05",
      testId: "card-google-review-button",
    },
    c.telefone && {
      icon: Phone,
      label: "Ligar agora",
      href: `tel:${onlyDigits(c.telefone)}`,
      tint: corBotoes,
      testId: "card-call-button",
    },
  ].filter(Boolean);

  return (
    <div className="flex min-h-screen justify-center bg-[#09090B] text-[#FAFAFA] selection:bg-indigo-500 selection:text-white sm:items-start sm:py-8 sm:px-4">
      <div
        className="relative flex w-full max-w-md flex-col overflow-hidden shadow-2xl sm:min-h-[840px] sm:rounded-[32px] sm:border sm:border-[#27272A]"
        style={{ backgroundColor: corFundo }}
      >
        {/* Cover */}
        <div className="relative h-48 w-full">
          <img src={cover} alt={`Capa de ${c.nome || "cliente"}`} className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${corFundo}, ${corFundo}4D, transparent)` }}
          />
        </div>

        {/* Perfil */}
        <div className="z-10 -mt-16 px-6 text-center">
          <img
            src={avatar}
            alt={c.nome}
            data-testid="card-profile-avatar"
            className="mx-auto h-28 w-28 rounded-3xl border-4 object-cover shadow-xl"
            style={{ borderColor: corFundo }}
          />
          <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight" data-testid="card-business-name">
            {c.nome}
          </h1>
          {c.descricao && (
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">{c.descricao}</p>
          )}
        </div>

        {/* Botões */}
        {buttons.length > 0 && (
          <div className="mt-6 space-y-3 px-6">
            {buttons.map((b) => (
              <LinkButton key={b.testId} {...b} />
            ))}
          </div>
        )}

        {/* Serviços */}
        {servicos.length > 0 && (
          <div className="mt-8 px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Serviços</h2>
            <div className="mt-3 divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {servicos.map((s) => (
                <div key={s.titulo} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-zinc-200">{s.titulo}</span>
                  <span className="text-sm text-zinc-500">{s.detalhe}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Endereço */}
        {c.endereco && (
          <div className="mt-6 px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Endereço</h2>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="flex items-start gap-3 text-sm text-zinc-300">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: corBotoes }} />
                {c.endereco}
              </p>
              {c.mapsUrl && (
                <a
                  href={c.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="card-address-maps-button"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: corBotoes }}
                >
                  <MapPin className="h-4 w-4" /> Localização
                </a>
              )}
            </div>
          </div>
        )}

        {/* Horário */}
        {horario.length > 0 && (
          <div className="mt-6 px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Horário de funcionamento</h2>
            <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              {horario.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" /> {h.dia}
                  </span>
                  <span className={/fechad/i.test(h.horas) ? "text-zinc-500" : "text-zinc-200"}>{h.horas}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Telefone */}
        {c.telefone && (
          <div className="mt-6 px-6">
            <a
              href={`tel:${onlyDigits(c.telefone)}`}
              data-testid="card-phone-link"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
            >
              <Phone className="h-4 w-4" style={{ color: corBotoes }} /> {c.telefone}
            </a>
          </div>
        )}

        {/* Rodapé */}
        <footer className="mt-8 px-6 pb-8 pt-4 text-center">
          {c.website && (
            <a
              href={c.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300"
            >
              <Globe className="h-3.5 w-3.5" /> {c.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <p className="mt-3 text-[11px] text-zinc-600">Cartão digital por Digital Cards IA</p>
        </footer>
      </div>
    </div>
  );
};

export default CardTemplate;
