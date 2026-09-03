import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  MapPin,
  Instagram,
  Facebook,
  Video,
  Star,
  Phone,
  Share2,
  LinkIcon,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { studioExemplo } from "@/data/mockData";

const WHATSAPP_CONTATO = "5511990000000";

const beneficios = [
  {
    icon: Smartphone,
    titulo: "Praticidade",
    texto: "Compartilhe seu cartão por um único link no WhatsApp, Instagram ou QR Code.",
  },
  {
    icon: ShieldCheck,
    titulo: "Aparência profissional",
    texto: "Um mini site sóbrio e elegante que transmite credibilidade ao seu negócio.",
  },
  {
    icon: LinkIcon,
    titulo: "Links organizados",
    texto: "Reúna telefone, redes sociais, localização e avaliações em um só lugar.",
  },
  {
    icon: Share2,
    titulo: "Fácil compartilhamento",
    texto: "Feito para ser aberto no celular, otimizado para redes sociais.",
  },
];

const cardBotoes = [
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Localização", icon: MapPin },
  { label: "Instagram", icon: Instagram },
  { label: "Avaliar no Google", icon: Star },
];

const PhoneMockup = () => (
  <div className="relative mx-auto w-[300px] rounded-[42px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-indigo-900/20">
    <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
    <div className="relative overflow-hidden rounded-[32px] bg-[#09090B]">
      <div className="relative h-28 w-full">
        <img
          src={studioExemplo.cover}
          alt="Capa"
          className="h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] to-transparent" />
      </div>
      <div className="-mt-9 flex flex-col items-center px-5 pb-6">
        <img
          src={studioExemplo.avatar}
          alt="Perfil"
          className="h-16 w-16 rounded-2xl border-2 border-[#09090B] object-cover shadow-lg"
        />
        <h4 className="font-heading mt-3 text-base font-bold text-white">
          {studioExemplo.nome}
        </h4>
        <p className="mt-1 text-center text-[11px] leading-snug text-zinc-400">
          Estúdio de beleza e estética avançada.
        </p>
        <div className="mt-4 w-full space-y-2">
          {cardBotoes.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#18181B] px-3 py-2.5"
            >
              <b.icon className="h-4 w-4 text-indigo-400" strokeWidth={2} />
              <span className="text-[13px] font-medium text-zinc-100">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", empresa: "", whatsapp: "", mensagem: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp) {
      toast.error("Preencha ao menos nome e WhatsApp.");
      return;
    }
    toast.success("Recebemos seu interesse! Em breve entraremos em contato.");
    setForm({ nome: "", empresa: "", whatsapp: "", mensagem: "" });
  };

  const abrirWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_CONTATO}?text=${encodeURIComponent(
        "Olá! Tenho interesse em criar meu cartão digital com a Digital Cards IA."
      )}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" data-testid="landing-logo" className="font-heading text-lg font-extrabold tracking-tight">
            Digital Cards<span className="text-indigo-600">.IA</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#servico" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">Como funciona</a>
            <a href="#beneficios" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">Benefícios</a>
            <a href="#contato" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">Contato</a>
            <Button data-testid="landing-header-cta" onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full bg-indigo-600 px-5 hover:bg-indigo-700">
              Quero meu cartão
            </Button>
          </nav>
          <button data-testid="landing-menu-toggle" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#servico" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-600">Como funciona</a>
              <a href="#beneficios" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-600">Benefícios</a>
              <a href="#contato" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-600">Contato</a>
              <Button onClick={() => { setMenuOpen(false); document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-full bg-indigo-600 hover:bg-indigo-700">Quero meu cartão</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-12 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 lg:col-span-7"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" /> Cartões digitais profissionais
            </span>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Seu cartão digital profissional, pronto para compartilhar.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Reúna contato, redes sociais, localização e avaliações em uma única página
              elegante. Compartilhe pelo WhatsApp e Instagram com um só link.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                data-testid="hero-cta-primary"
                onClick={() => document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" })}
                className="h-12 rounded-full bg-indigo-600 px-7 text-base hover:bg-indigo-700"
              >
                Quero meu cartão <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link to="/demo/cliente-exemplo" target="_blank">
                <Button data-testid="hero-cta-demo" variant="outline" className="h-12 w-full rounded-full border-slate-300 px-7 text-base sm:w-auto">
                  Ver exemplo ao vivo
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex justify-center lg:col-span-5 lg:justify-end"
            data-testid="hero-phone-mockup"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </section>

      {/* Explicação do serviço */}
      <section id="servico" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">O que é</p>
          <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Um mini site profissional para o seu negócio
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            A Digital Cards IA cria uma página digital sóbria e moderna com todas as informações
            do seu negócio. Nada de aplicativos para instalar: o cliente abre o link e encontra
            tudo o que precisa para entrar em contato, encontrar e avaliar você.
          </p>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Benefícios</p>
          <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Feito para ser compartilhado e gerar contato
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((b, i) => (
            <motion.div
              key={b.titulo}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              data-testid={`beneficio-card-${i}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <b.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="font-heading mt-4 text-lg font-semibold">{b.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.texto}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Página própria */}
      <section className="border-y border-slate-200 bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Cada negócio, sua página</p>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Uma página exclusiva com o endereço do seu negócio
            </h2>
            <p className="text-base leading-relaxed text-slate-300">
              Cada cliente recebe sua própria página independente — com identidade, cores e links
              próprios. Um link limpo e fácil de divulgar, pensado para o compartilhamento em
              redes sociais.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-slate-200">
              <LinkIcon className="h-4 w-4 text-indigo-400" />
              digitalcards.ia/<span className="text-white">seu-negocio</span>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <img src={studioExemplo.avatar} alt="Exemplo" className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <p className="font-heading font-semibold">Studio Exemplo</p>
                <p className="font-mono text-xs text-slate-400">/demo/cliente-exemplo</p>
                <Link to="/demo/cliente-exemplo" target="_blank" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300">
                  Abrir exemplo <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário de interesse */}
      <section id="contato" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Fale conosco</p>
            <h2 className="font-heading mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Solicite o seu cartão digital
            </h2>
            <p className="mt-3 text-base text-slate-600">Deixe seus dados e retornaremos com todos os detalhes.</p>
          </div>
          <form
            data-testid="interest-form"
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-indigo-500/5 sm:p-10"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input data-testid="form-input-nome" id="nome" name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input data-testid="form-input-empresa" id="empresa" name="empresa" value={form.empresa} onChange={handleChange} placeholder="Nome do negócio" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input data-testid="form-input-whatsapp" id="whatsapp" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea data-testid="form-input-mensagem" id="mensagem" name="mensagem" value={form.mensagem} onChange={handleChange} placeholder="Conte um pouco sobre o seu negócio" rows={4} />
              </div>
            </div>
            <Button data-testid="interest-form-submit-button" type="submit" className="mt-6 h-12 w-full rounded-full bg-indigo-600 text-base hover:bg-indigo-700">
              Enviar mensagem de interesse
            </Button>
            <button
              type="button"
              data-testid="whatsapp-contact-button"
              onClick={abrirWhatsApp}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 py-3 text-sm font-semibold text-[#128C3E] transition-colors hover:bg-[#25D366]/20"
            >
              <MessageCircle className="h-4 w-4" /> Falar direto no WhatsApp
            </button>
          </form>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-heading text-sm font-bold">Digital Cards<span className="text-indigo-600">.IA</span></p>
          <p className="text-xs text-slate-400">© 2026 Digital Cards IA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
