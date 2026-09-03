import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Palette,
  Settings,
  Menu,
  X,
  Pencil,
  ExternalLink,
  Upload,
  Building2,
  Image as ImageIcon,
  Link2,
  MapPin,
  FileText,
  Search,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminStats, clientesDemo } from "@/data/mockData";

const NAV = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard, testId: "admin-nav-overview" },
  { id: "clients", label: "Clientes", icon: Users, testId: "admin-nav-clients" },
  { id: "new-client", label: "Novo cliente", icon: UserPlus, testId: "admin-nav-new-client" },
  { id: "appearance", label: "Aparência", icon: Palette, testId: "admin-nav-appearance" },
  { id: "settings", label: "Configurações", icon: Settings, testId: "admin-nav-settings" },
];

const StatusBadge = ({ status }) =>
  status === "Publicado" ? (
    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
      <CheckCircle2 className="mr-1 h-3 w-3" /> Publicado
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
      <FileEdit className="mr-1 h-3 w-3" /> Rascunho
    </Badge>
  );

const KpiCard = ({ label, value, icon: Icon, tint, testId }) => (
  <div data-testid={testId} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tint}`}>
        <Icon className="h-4 w-4" />
      </span>
    </div>
    <p className="font-heading mt-3 text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

/* ---------- Views ---------- */

const OverviewView = ({ onNewClient, onEdit }) => (
  <div>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Visão geral</h1>
        <p className="mt-1 text-sm text-slate-500">Resumo demonstrativo da sua conta.</p>
      </div>
      <Button data-testid="overview-new-client-button" onClick={onNewClient} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
        <UserPlus className="mr-2 h-4 w-4" /> Novo cliente
      </Button>
    </div>

    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
      <KpiCard testId="kpi-total-clientes" label="Total de clientes" value={adminStats.totalClientes} icon={Users} tint="bg-indigo-50 text-indigo-600" />
      <KpiCard testId="kpi-publicados" label="Cartões publicados" value={adminStats.publicados} icon={CheckCircle2} tint="bg-emerald-50 text-emerald-600" />
      <KpiCard testId="kpi-rascunhos" label="Rascunhos" value={adminStats.rascunhos} icon={FileEdit} tint="bg-amber-50 text-amber-600" />
    </div>

    <ClientsTable onEdit={onEdit} title="Clientes recentes" />
  </div>
);

const ClientsTable = ({ onEdit, title }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
    </div>
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Nome</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientesDemo.map((cli) => (
          <TableRow key={cli.id} data-testid={`client-row-${cli.slug}`}>
            <TableCell className="font-medium text-slate-900">{cli.nome}</TableCell>
            <TableCell className="font-mono text-xs text-slate-500">/{cli.slug}</TableCell>
            <TableCell><StatusBadge status={cli.status} /></TableCell>
            <TableCell className="text-right">
              <Button data-testid={`client-edit-${cli.slug}`} onClick={() => onEdit(cli)} variant="outline" size="sm" className="rounded-full">
                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const ClientsView = ({ onNewClient, onEdit }) => (
  <div>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Clientes</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie os cartões digitais dos seus clientes.</p>
      </div>
      <Button data-testid="clients-new-client-button" onClick={onNewClient} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
        <UserPlus className="mr-2 h-4 w-4" /> Novo cliente
      </Button>
    </div>
    <ClientsTable onEdit={onEdit} title="Todos os clientes" />
  </div>
);

const Field = ({ label, id, children, hint }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const FormSection = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
    <div className="mb-6 flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h3 className="font-heading text-lg font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const UploadBox = ({ label, testId }) => (
  <button
    type="button"
    data-testid={testId}
    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
  >
    <Upload className="h-5 w-5" />
    <span className="text-sm font-medium">{label}</span>
    <span className="text-xs text-slate-400">Clique para selecionar (demonstração)</span>
  </button>
);

const NewClientView = ({ editing }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Dados salvos localmente (demonstração). Persistência em banco será conectada em breve.");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
          {editing ? `Editar: ${editing.nome}` : "Novo cliente"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Preencha as informações do cartão digital. Os campos funcionam com dados locais nesta etapa.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" data-testid="new-client-form">
        {/* Identidade do negócio */}
        <FormSection icon={Building2} title="Identidade do negócio" description="Informações principais que aparecem no cartão.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nome do negócio" id="nome"><Input data-testid="field-nome" id="nome" defaultValue={editing?.nome} placeholder="Ex: Studio Exemplo" /></Field>
            <Field label="Slug da página" id="slug" hint="digitalcards.ia/seu-negocio"><Input data-testid="field-slug" id="slug" defaultValue={editing?.slug} placeholder="studio-exemplo" /></Field>
            <div className="sm:col-span-2">
              <Field label="Descrição curta" id="descricao"><Textarea data-testid="field-descricao" id="descricao" rows={3} placeholder="Uma frase curta sobre o negócio" /></Field>
            </div>
          </div>
        </FormSection>

        {/* Mídia */}
        <FormSection icon={ImageIcon} title="Mídia" description="Imagens e vídeo que compõem a identidade visual.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <UploadBox label="Logo" testId="upload-logo" />
            <UploadBox label="Foto de perfil" testId="upload-profile" />
            <UploadBox label="Imagem/vídeo de cabeçalho" testId="upload-cover" />
          </div>
        </FormSection>

        {/* Aparência */}
        <FormSection icon={Palette} title="Aparência" description="Cores do cartão digital.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Cor de fundo" id="corFundo">
              <div className="flex items-center gap-3">
                <input data-testid="field-cor-fundo" type="color" id="corFundo" defaultValue="#09090B" className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
                <Input defaultValue="#09090B" className="font-mono" />
              </div>
            </Field>
            <Field label="Cor dos botões" id="corBotoes">
              <div className="flex items-center gap-3">
                <input data-testid="field-cor-botoes" type="color" id="corBotoes" defaultValue="#6366F1" className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
                <Input defaultValue="#6366F1" className="font-mono" />
              </div>
            </Field>
          </div>
        </FormSection>

        {/* Botões e links */}
        <FormSection icon={Link2} title="Botões e links" description="Redes sociais e canais de contato.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="WhatsApp" id="whatsapp"><Input data-testid="field-whatsapp" id="whatsapp" placeholder="55 11 99999-9999" /></Field>
            <Field label="Instagram" id="instagram"><Input data-testid="field-instagram" id="instagram" placeholder="https://instagram.com/..." /></Field>
            <Field label="Facebook" id="facebook"><Input data-testid="field-facebook" id="facebook" placeholder="https://facebook.com/..." /></Field>
            <Field label="TikTok" id="tiktok"><Input data-testid="field-tiktok" id="tiktok" placeholder="https://tiktok.com/@..." /></Field>
            <Field label="Website" id="website"><Input data-testid="field-website" id="website" placeholder="https://..." /></Field>
            <Field label="URL de avaliação do Google" id="googleReview"><Input data-testid="field-google-review" id="googleReview" placeholder="https://g.page/r/..." /></Field>
          </div>
        </FormSection>

        {/* Informações locais */}
        <FormSection icon={MapPin} title="Informações locais" description="Contato, endereço e funcionamento.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Telefone" id="telefone"><Input data-testid="field-telefone" id="telefone" placeholder="(11) 4000-0000" /></Field>
            <Field label="Endereço" id="endereco"><Input data-testid="field-endereco" id="endereco" placeholder="Rua, número, bairro, cidade" /></Field>
            <Field label="URL do Google Maps" id="maps"><Input data-testid="field-maps" id="maps" placeholder="https://maps.google.com/..." /></Field>
            <Field label="Horário de funcionamento" id="horario"><Input data-testid="field-horario" id="horario" placeholder="Seg a Sex, 09h–19h" /></Field>
          </div>
        </FormSection>

        {/* Conteúdo adicional */}
        <FormSection icon={FileText} title="Conteúdo adicional" description="Serviços e informações extras exibidas no cartão.">
          <Field label="Serviços / informações adicionais" id="conteudo">
            <Textarea data-testid="field-conteudo" id="conteudo" rows={4} placeholder="Ex: Corte & Escova — a partir de R$ 80" />
          </Field>
        </FormSection>

        {/* SEO local */}
        <FormSection icon={Search} title="SEO local" description="Ajuda o cartão a ser encontrado em buscas.">
          <div className="grid grid-cols-1 gap-5">
            <Field label="Título SEO" id="seoTitle"><Input data-testid="field-seo-title" id="seoTitle" placeholder="Studio Exemplo — Beleza e Estética em SP" /></Field>
            <Field label="Descrição SEO" id="seoDesc"><Textarea data-testid="field-seo-desc" id="seoDesc" rows={2} placeholder="Descrição para mecanismos de busca" /></Field>
            <Field label="Palavras-chave locais" id="seoKeywords" hint="Separe por vírgulas"><Input data-testid="field-seo-keywords" id="seoKeywords" placeholder="salão, estética, São Paulo" /></Field>
          </div>
        </FormSection>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="rounded-full">Cancelar</Button>
          <Button data-testid="admin-save-client-button" type="submit" className="rounded-full bg-indigo-600 px-8 hover:bg-indigo-700">
            {editing ? "Salvar alterações" : "Salvar cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const PlaceholderView = ({ icon: Icon, title, description, testId }) => (
  <div data-testid={testId}>
    <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
    <p className="mt-1 text-sm text-slate-500">{description}</p>
    <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 font-heading font-semibold text-slate-700">Em breve</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Esta área está preparada visualmente e será ativada em uma próxima etapa.
      </p>
    </div>
  </div>
);

/* ---------- Admin shell ---------- */

const Admin = () => {
  const [active, setActive] = useState("overview");
  const [editing, setEditing] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const go = (id) => {
    setActive(id);
    if (id !== "new-client") setEditing(null);
    setSidebarOpen(false);
  };

  const handleEdit = (cli) => {
    setEditing(cli);
    setActive("new-client");
  };

  const handleNewClient = () => {
    setEditing(null);
    setActive("new-client");
  };

  const SidebarContent = () => (
    <>
      <div>
        <Link to="/" className="font-heading text-lg font-extrabold tracking-tight text-white">
          Digital Cards<span className="text-indigo-400">.IA</span>
        </Link>
        <p className="mt-1 text-xs text-slate-400">Painel administrativo</p>
        <nav className="mt-8 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              data-testid={item.testId}
              onClick={() => go(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>
      </div>
      <Link
        to="/demo/cliente-exemplo"
        target="_blank"
        className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
      >
        <ExternalLink className="h-4 w-4" /> Ver cartão de exemplo
      </Link>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
        <Link to="/" className="font-heading font-extrabold text-white">Digital Cards<span className="text-indigo-400">.IA</span></Link>
        <button data-testid="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 p-6 md:flex">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <aside className="flex flex-col justify-between gap-8 border-b border-slate-800 bg-slate-900 p-6 md:hidden">
          <SidebarContent />
        </aside>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
        {active === "overview" && <OverviewView onNewClient={handleNewClient} onEdit={handleEdit} />}
        {active === "clients" && <ClientsView onNewClient={handleNewClient} onEdit={handleEdit} />}
        {active === "new-client" && <NewClientView editing={editing} />}
        {active === "appearance" && <PlaceholderView testId="appearance-view" icon={Palette} title="Aparência" description="Temas e estilos globais dos cartões." />}
        {active === "settings" && <PlaceholderView testId="settings-view" icon={Settings} title="Configurações" description="Preferências da conta e integrações." />}
      </main>
    </div>
  );
};

export default Admin;
