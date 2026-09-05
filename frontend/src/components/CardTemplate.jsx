import { useState, useRef } from "react";
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
  Volume2,
  VolumeX,
  Link as LinkIcon2,
} from "lucide-react";
import { isDark, readableOn, withAlpha, shade, blendOver } from "@/lib/themeContrast";

const sanitizeUrl = (url) => {
  const u = (url || "").trim();
  if (!u) return "#";
  if (/^(javascript:|data:|vbscript:)/i.test(u)) return "#";
  if (/^(https?:|tel:|mailto:)/i.test(u)) return u;
  return `https://${u}`;
};

const DEFAULT_COVER =
  "https://images.pexels.com/photos/13068380/pexels-photo-13068380.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&w=400&q=80";

const onlyDigits = (v) => (v || "").replace(/\D/g, "");

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
 * Botão de ação único e reutilizável. TODOS os botões usam a mesma cor de
 * tema (corBotoes) no fundo, borda e hover/foco; texto e ícone recebem
 * automaticamente a cor de melhor contraste. Nenhuma regra específica por
 * tipo de botão sobrescreve a cor configurada.
 */
const ActionButton = ({ icon: Icon, label, href, testId, btn, btnFg, btnHover }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-testid={testId}
    className="dc-action group flex items-center gap-4 rounded-2xl px-5 py-4"
    style={{ "--btn": btn, "--btn-fg": btnFg, "--btn-hover": btnHover }}
  >
    <span
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: withAlpha(btnFg, 0.18), color: btnFg }}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
    <span className="font-semibold" style={{ color: btnFg }}>{label}</span>
    <span className="ml-auto transition-transform group-hover:translate-x-0.5" style={{ color: btnFg }}>→</span>
  </a>
);

/**
 * Template visual compartilhado do cartão digital.
 */
const CardTemplate = ({ data }) => {
  const c = data || {};
  const corFundo = c.corFundo || "#121215";
  const corBotoes = c.corBotoes || "#6366F1";

  const [videoFailed, setVideoFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [portrait, setPortrait] = useState(false);
  const videoRef = useRef(null);

  const coverVideo = c.coverVideo || "";
  const coverImage = c.cover || "";
  const avatar = c.avatar || DEFAULT_AVATAR;
  const horario = parseHorario(c.horario);
  const servicos = (c.servicos || []).filter((s) => s && (s.nome || s.preco));

  // ----- Cores derivadas do fundo (contraste automático) -----
  const darkBg = isDark(corFundo);
  const fg = readableOn(corFundo);
  const fgMuted = withAlpha(fg, 0.7);
  const fgFaint = withAlpha(fg, 0.5);
  const surfaceBg = darkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const surfaceBorder = darkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const avatarRing = darkBg ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.10)";

  // ----- Cores do botão de tema (contraste automático + opacidade) -----
  const btnFg = readableOn(corBotoes); // usado no controle de som (fundo sólido)
  const op = Math.max(0.15, Math.min(1, c.corBotoesOpacidade ?? 1));
  const btnTheme = (baseHex) => {
    const base = baseHex || corBotoes;
    const blended = blendOver(base, corFundo, op);
    const fgc = readableOn(blended);
    const hoverBase = fgc === "#FFFFFF" ? shade(base, -0.14) : shade(base, 0.16);
    return { bg: withAlpha(base, op), fg: fgc, hover: withAlpha(hoverBase, op) };
  };
  const std = btnTheme(corBotoes);

  const buttons = [
    c.whatsapp && { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${onlyDigits(c.whatsapp)}`, testId: "card-whatsapp-button" },
    c.mapsUrl && { icon: MapPin, label: "Localização", href: c.mapsUrl, testId: "card-location-button" },
    c.instagram && { icon: Instagram, label: "Instagram", href: c.instagram, testId: "card-instagram-button" },
    c.facebook && { icon: Facebook, label: "Facebook", href: c.facebook, testId: "card-facebook-button" },
    c.tiktok && { icon: Video, label: "TikTok", href: c.tiktok, testId: "card-tiktok-button" },
    c.website && { icon: Globe, label: "Website", href: c.website, testId: "card-website-button" },
    c.googleReviewUrl && { icon: Star, label: "Avaliar no Google", href: c.googleReviewUrl, testId: "card-google-review-button" },
  ].filter(Boolean);

  const customButtons = [...(c.botoesPersonalizados || [])]
    .filter((b) => b && b.label && b.url)
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next) {
      const p = v.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-[#09090B] text-[#FAFAFA] sm:items-start sm:py-8 sm:px-4">
      <div
        className="relative flex w-full max-w-md flex-col overflow-hidden shadow-2xl sm:min-h-[840px] sm:rounded-[32px] sm:border sm:border-[#27272A]"
        style={{ backgroundColor: corFundo, color: fg }}
      >
        {/* Cabeçalho (mídia) */}
        <div className="relative w-full overflow-hidden" style={{ backgroundColor: corFundo }}>
          {coverVideo && !videoFailed ? (
            <>
              {portrait && (
                <video
                  src={coverVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                  data-testid="card-cover-video-bg"
                  className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
                />
              )}
              <video
                ref={videoRef}
                src={coverVideo}
                autoPlay
                muted
                loop
                playsInline
                onError={() => setVideoFailed(true)}
                onLoadedMetadata={(e) => setPortrait(e.currentTarget.videoHeight > e.currentTarget.videoWidth)}
                data-testid="card-cover-video"
                className={`relative z-[1] mx-auto block w-full object-contain ${portrait ? "max-h-[70vh]" : "max-h-[46vh]"}`}
              />
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Ativar som" : "Desativar som"}
                data-testid="card-video-sound-toggle"
                className="absolute bottom-3 right-3 z-[2] flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold shadow-lg backdrop-blur transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ backgroundColor: corBotoes, color: btnFg, outlineColor: btnFg }}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {muted ? "Ativar som" : "Som ligado"}
              </button>
            </>
          ) : (
            <img
              src={coverImage || DEFAULT_COVER}
              alt={`Capa de ${c.nome || "cliente"}`}
              data-testid="card-cover-image"
              className="block aspect-[3/2] w-full object-cover"
            />
          )}
        </div>

        {/* Perfil (abaixo da mídia, sem sobrepor) */}
        <div className="px-6 pt-6 text-center">
          <img
            src={avatar}
            alt={c.nome}
            data-testid="card-profile-avatar"
            className="mx-auto aspect-square h-28 w-28 rounded-full border-4 object-cover shadow-xl"
            style={{ borderColor: avatarRing }}
          />
          <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight" data-testid="card-business-name" style={{ color: fg }}>
            {c.nome}
          </h1>
          {c.descricao && (
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed" style={{ color: fgMuted }}>{c.descricao}</p>
          )}
        </div>

        {/* Botões */}
        {(buttons.length > 0 || customButtons.length > 0) && (
          <div className="mt-6 space-y-3 px-6">
            {buttons.map((b) => (
              <ActionButton key={b.testId} {...b} btn={std.bg} btnFg={std.fg} btnHover={std.hover} />
            ))}
            {customButtons.map((b, i) => {
              const t = btnTheme(b.cor || corBotoes);
              return (
                <ActionButton
                  key={`custom-${i}`}
                  icon={LinkIcon2}
                  label={b.label}
                  href={sanitizeUrl(b.url)}
                  testId={`card-custom-button-${i}`}
                  btn={t.bg}
                  btnFg={t.fg}
                  btnHover={t.hover}
                />
              );
            })}
          </div>
        )}

        {/* Serviços */}
        {servicos.length > 0 && (
          <div className="mt-8 px-6" data-testid="card-services-section">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: fgFaint }}>SERVIÇOS</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border" style={{ backgroundColor: surfaceBg, borderColor: surfaceBorder }}>
              {servicos.map((s, i) => (
                <div key={i} data-testid={`card-service-${i}`} className="flex items-start justify-between gap-4 px-4 py-3" style={i ? { borderTop: `1px solid ${surfaceBorder}` } : undefined}>
                  <span className="min-w-0 flex-1 break-words text-sm font-medium" style={{ color: fg }}>{s.nome}</span>
                  {s.preco && <span className="flex-shrink-0 break-words text-right text-sm" style={{ color: fgMuted }}>{s.preco}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Endereço */}
        {c.endereco && (
          <div className="mt-6 px-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: fgFaint }}>Endereço</h2>
            <div className="mt-3 rounded-2xl border p-4" style={{ backgroundColor: surfaceBg, borderColor: surfaceBorder }}>
              <p className="flex items-start gap-3 text-sm" style={{ color: fg }}>
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: corBotoes }} />
                {c.endereco}
              </p>
              {c.mapsUrl && (
                <a
                  href={c.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="card-address-maps-button"
                  className="dc-action mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
                  style={{ "--btn": std.bg, "--btn-fg": std.fg, "--btn-hover": std.hover, color: std.fg }}
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
            <h2 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: fgFaint }}>Horário de funcionamento</h2>
            <div className="mt-3 space-y-2 rounded-2xl border p-4" style={{ backgroundColor: surfaceBg, borderColor: surfaceBorder }}>
              {horario.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2" style={{ color: fg }}>
                    <Clock className="h-3.5 w-3.5" style={{ color: fgFaint }} /> {h.dia}
                  </span>
                  <span style={{ color: /fechad/i.test(h.horas) ? fgFaint : fgMuted }}>{h.horas}</span>
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
              className="flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium"
              style={{ backgroundColor: surfaceBg, borderColor: surfaceBorder, color: fg }}
            >
              <Phone className="h-4 w-4" style={{ color: corBotoes }} /> {c.telefone}
            </a>
          </div>
        )}

        {/* Rodapé */}
        <footer className="mt-8 px-6 pb-8 pt-4 text-center">
          <p className="text-[11px]" style={{ color: fgFaint }}>Cartão digital por Digital Cards IA</p>
        </footer>
      </div>
    </div>
  );
};

export default CardTemplate;
