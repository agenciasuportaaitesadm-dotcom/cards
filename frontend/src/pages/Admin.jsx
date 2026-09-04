import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Palette,
  Settings,
  Menu,
  X,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Upload,
  Building2,
  Image as ImageIcon,
  Link2,
  MapPin,
  FileText,
  Search,
  CheckCircle2,
  FileEdit,
  Loader2,
  LogOut,
  Lock,
  Mail,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TOKEN_KEY = "dc_admin_token";

const setAuthHeader = (token) => {
  if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete axios.defaults.headers.common.Authorization;
};

const formatError = (detail, fallback) => {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || "").filter(Boolean).join(" ") || fallback;
  return fallback;
};

const NAV = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard, testId: "admin-nav-overview" },
  { id: "clients", label: "Clientes", icon: Users, testId: "admin-nav-clients" },
  { id: "new-client", label: "Novo cliente", icon: UserPlus, testId: "admin-nav-new-client" },
  { id: "appearance", label: "Aparência", icon: Palette, testId: "admin-nav-appearance" },
  { id: "settings", label: "Configurações", icon: Settings, testId: "admin-nav-settings" },
];

const EMPTY_FORM = {
  nome: "", slug: "", descricao: "", telefone: "", whatsapp: "", endereco: "",
  mapsUrl: "", horario: "", instagram: "", facebook: "", tiktok: "", website: "",
  googleReviewUrl: "", seoTitle: "", seoDesc: "", seoKeywords: "",
  logoUrl: "", profileUrl: "", headerUrl: "", headerType: "",
  corFundo: "#09090B", corBotoes: "#6366F1", status: "Rascunho",
};

/* ---------------- Login ---------------- */
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      setAuthHeader(data.access_token);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      onLogin(data.user);
    } catch (err) {
      setError(formatError(err?.response?.data?.detail, "Não foi possível entrar. Tente novamente."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFC] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="font-heading text-xl font-extrabold tracking-tight text-slate-900">
            Digital Cards<span className="text-indigo-600">.IA</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Painel administrativo</p>
        </div>
        <form
          onSubmit={submit}
          data-testid="admin-login-form"
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-indigo-500/5 sm:p-10"
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Acesso restrito</h1>
          <p className="mt-1 text-sm text-slate-500">Entre com suas credenciais de administrador.</p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input data-testid="login-email-input" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="pl-9" autoComplete="username" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input data-testid="login-password-input" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" autoComplete="current-password" />
              </div>
            </div>
          </div>

          {error && (
            <p data-testid="login-error" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <Button data-testid="login-submit-button" type="submit" disabled={loading} className="mt-6 h-12 w-full rounded-full bg-indigo-600 text-base hover:bg-indigo-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

/* ---------------- Shared UI ---------------- */
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

const copyLink = (slug) => {
  const url = `${window.location.origin}/c/${slug}`;
  navigator.clipboard?.writeText(url);
  toast.success("Link copiado para a área de transferência.");
};

const ClientsTable = ({ clientes, loading, onEdit, onDelete, title, emptyMessage = "Nenhum cliente cadastrado ainda." }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
    </div>
    {loading ? (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    ) : clientes.length === 0 ? (
      <div className="py-16 text-center text-sm text-slate-400" data-testid="clients-empty">
        {emptyMessage}
      </div>
    ) : (
      <div className="overflow-x-auto">
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
            {clientes.map((cli) => (
              <TableRow key={cli.id} data-testid={`client-row-${cli.slug}`}>
                <TableCell className="font-medium text-slate-900">{cli.nome}</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">/{cli.slug}</TableCell>
                <TableCell><StatusBadge status={cli.status} /></TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {cli.status === "Publicado" && (
                      <>
                        <a href={`/c/${cli.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button data-testid={`client-open-${cli.slug}`} variant="ghost" size="sm" className="h-8 rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Abrir mini site
                          </Button>
                        </a>
                        <Button data-testid={`client-copy-${cli.slug}`} onClick={() => copyLink(cli.slug)} variant="ghost" size="sm" className="h-8 rounded-full text-slate-600 hover:bg-slate-100">
                          <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar link
                        </Button>
                      </>
                    )}
                    <Button data-testid={`client-edit-${cli.slug}`} onClick={() => onEdit(cli)} variant="outline" size="sm" className="h-8 rounded-full">
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button data-testid={`client-delete-${cli.slug}`} onClick={() => onDelete(cli)} variant="ghost" size="sm" className="h-8 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
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

const NewClientView = ({ editing, onSaved, onCancel }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) setForm({ ...EMPTY_FORM, ...editing });
    else setForm(EMPTY_FORM);
  }, [editing]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Informe o nome do negócio.");
    if (!SLUG_REGEX.test(form.slug)) {
      return toast.error("Slug inválido. Use apenas letras minúsculas, números e hífens.");
    }
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/clientes/${editing.id}`, form);
        toast.success("Cliente atualizado com sucesso.");
      } else {
        await axios.post(`${API}/clientes`, form);
        toast.success("Cliente criado com sucesso.");
      }
      onSaved();
    } catch (err) {
      toast.error(formatError(err?.response?.data?.detail, "Não foi possível salvar o cliente."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
          {editing ? `Editar: ${editing.nome}` : "Novo cliente"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Preencha as informações do cartão digital. Os dados são salvos no banco de dados.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" data-testid="new-client-form">
        <FormSection icon={Building2} title="Identidade do negócio" description="Informações principais que aparecem no cartão.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nome do negócio" id="nome"><Input data-testid="field-nome" id="nome" value={form.nome} onChange={set("nome")} placeholder="Ex: Studio Exemplo" /></Field>
            <Field label="Slug da página" id="slug" hint="Somente minúsculas, números e hífens. Ex: studio-exemplo"><Input data-testid="field-slug" id="slug" value={form.slug} onChange={set("slug")} placeholder="studio-exemplo" /></Field>
            <div className="sm:col-span-2">
              <Field label="Descrição curta" id="descricao"><Textarea data-testid="field-descricao" id="descricao" value={form.descricao} onChange={set("descricao")} rows={3} placeholder="Uma frase curta sobre o negócio" /></Field>
            </div>
            <Field label="Status" id="status">
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger data-testid="field-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rascunho">Rascunho</SelectItem>
                  <SelectItem value="Publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection icon={ImageIcon} title="Mídia" description="Envie a logo, a foto de perfil e a mídia de cabeçalho do cliente.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <MediaUpload label="Logo" field="logo" testId="upload-logo" value={form.logoUrl} onChange={(url) => setForm((f) => ({ ...f, logoUrl: url }))} />
            <MediaUpload label="Foto de perfil" field="profile" testId="upload-profile" value={form.profileUrl} onChange={(url) => setForm((f) => ({ ...f, profileUrl: url }))} />
            <MediaUpload label="Imagem/vídeo de cabeçalho" field="header" testId="upload-cover" allowVideo value={form.headerUrl} valueType={form.headerType} onChange={(url, type) => setForm((f) => ({ ...f, headerUrl: url, headerType: url ? (type || "image") : "" }))} />
          </div>
        </FormSection>

        <FormSection icon={Palette} title="Aparência" description="Cores do cartão digital.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Cor de fundo" id="corFundo">
              <div className="flex items-center gap-3">
                <input data-testid="field-cor-fundo" type="color" id="corFundo" value={form.corFundo} onChange={set("corFundo")} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
                <Input value={form.corFundo} onChange={set("corFundo")} className="font-mono" />
              </div>
            </Field>
            <Field label="Cor dos botões" id="corBotoes">
              <div className="flex items-center gap-3">
                <input data-testid="field-cor-botoes" type="color" id="corBotoes" value={form.corBotoes} onChange={set("corBotoes")} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
                <Input value={form.corBotoes} onChange={set("corBotoes")} className="font-mono" />
              </div>
            </Field>
          </div>
        </FormSection>

        <FormSection icon={Link2} title="Botões e links" description="Redes sociais e canais de contato.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="WhatsApp" id="whatsapp" hint="Somente números com DDI/DDD"><Input data-testid="field-whatsapp" id="whatsapp" value={form.whatsapp} onChange={set("whatsapp")} placeholder="5511999999999" /></Field>
            <Field label="Instagram" id="instagram"><Input data-testid="field-instagram" id="instagram" value={form.instagram} onChange={set("instagram")} placeholder="https://instagram.com/..." /></Field>
            <Field label="Facebook" id="facebook"><Input data-testid="field-facebook" id="facebook" value={form.facebook} onChange={set("facebook")} placeholder="https://facebook.com/..." /></Field>
            <Field label="TikTok" id="tiktok"><Input data-testid="field-tiktok" id="tiktok" value={form.tiktok} onChange={set("tiktok")} placeholder="https://tiktok.com/@..." /></Field>
            <Field label="Website" id="website"><Input data-testid="field-website" id="website" value={form.website} onChange={set("website")} placeholder="https://..." /></Field>
            <Field label="URL de avaliação do Google" id="googleReview"><Input data-testid="field-google-review" id="googleReview" value={form.googleReviewUrl} onChange={set("googleReviewUrl")} placeholder="https://g.page/r/..." /></Field>
          </div>
        </FormSection>

        <FormSection icon={MapPin} title="Informações locais" description="Contato, endereço e funcionamento.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Telefone" id="telefone"><Input data-testid="field-telefone" id="telefone" value={form.telefone} onChange={set("telefone")} placeholder="(11) 4000-0000" /></Field>
            <Field label="Endereço" id="endereco"><Input data-testid="field-endereco" id="endereco" value={form.endereco} onChange={set("endereco")} placeholder="Rua, número, bairro, cidade" /></Field>
            <Field label="URL do Google Maps" id="maps"><Input data-testid="field-maps" id="maps" value={form.mapsUrl} onChange={set("mapsUrl")} placeholder="https://maps.google.com/..." /></Field>
            <Field label="Horário de funcionamento" id="horario" hint="Uma linha por dia. Ex: Segunda a Sexta: 09:00 — 19:00"><Textarea data-testid="field-horario" id="horario" value={form.horario} onChange={set("horario")} rows={3} placeholder={"Segunda a Sexta: 09:00 — 19:00\nSábado: 09:00 — 16:00"} /></Field>
          </div>
        </FormSection>

        <FormSection icon={FileText} title="Conteúdo adicional" description="Informações extras (opcional).">
          <Field label="Observações internas" id="conteudo" hint="Campo de apoio — não exibido no cartão nesta etapa.">
            <Textarea data-testid="field-conteudo" id="conteudo" rows={3} placeholder="Anotações internas sobre o cliente" />
          </Field>
        </FormSection>

        <FormSection icon={Search} title="SEO local" description="Ajuda o cartão a ser encontrado em buscas.">
          <div className="grid grid-cols-1 gap-5">
            <Field label="Título SEO" id="seoTitle"><Input data-testid="field-seo-title" id="seoTitle" value={form.seoTitle} onChange={set("seoTitle")} placeholder="Studio Exemplo — Beleza e Estética em SP" /></Field>
            <Field label="Descrição SEO" id="seoDesc"><Textarea data-testid="field-seo-desc" id="seoDesc" value={form.seoDesc} onChange={set("seoDesc")} rows={2} placeholder="Descrição para mecanismos de busca" /></Field>
            <Field label="Palavras-chave locais" id="seoKeywords" hint="Separe por vírgulas"><Input data-testid="field-seo-keywords" id="seoKeywords" value={form.seoKeywords} onChange={set("seoKeywords")} placeholder="salão, estética, São Paulo" /></Field>
          </div>
        </FormSection>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="rounded-full" onClick={onCancel}>Cancelar</Button>
          <Button data-testid="admin-save-client-button" type="submit" disabled={saving} className="rounded-full bg-indigo-600 px-8 hover:bg-indigo-700">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? "Salvar alterações" : "Salvar cliente"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const SecurityView = ({ onLogout }) => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!current) return toast.error("Informe a senha atual.");
    if (next.length < 8) return toast.error("A nova senha deve ter pelo menos 8 caracteres.");
    if (next !== confirm) return toast.error("As novas senhas não coincidem.");
    setSaving(true);
    try {
      await axios.post(`${API}/auth/change-password`, {
        current_password: current,
        new_password: next,
        confirm_password: confirm,
      });
      toast.success("Senha alterada com sucesso. Entre novamente com a nova senha.");
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => onLogout(), 1500);
    } catch (err) {
      toast.error(formatError(err?.response?.data?.detail, "Não foi possível alterar a senha."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="settings-view">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
      <p className="mt-1 text-sm text-slate-500">Preferências da conta e segurança.</p>

      <div className="mt-8 max-w-xl">
        <FormSection icon={Lock} title="Segurança da conta" description="Altere a senha de acesso ao painel.">
          <form onSubmit={submit} className="space-y-5" data-testid="change-password-form">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input data-testid="field-current-password" id="currentPassword" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input data-testid="field-new-password" id="newPassword" type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="Mínimo de 8 caracteres" autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input data-testid="field-confirm-password" id="confirmPassword" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repita a nova senha" autoComplete="new-password" />
            </div>
            <div className="flex justify-end">
              <Button data-testid="change-password-button" type="submit" disabled={saving} className="rounded-full bg-indigo-600 px-8 hover:bg-indigo-700">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Alterar senha
              </Button>
            </div>
          </form>
        </FormSection>
      </div>
    </div>
  );
};

const IMG_EXT = ["jpg", "jpeg", "png", "webp"];
const VID_EXT = ["mp4", "webm"];

const MediaUpload = ({ label, field, value, valueType, onChange, allowVideo, testId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState("");
  const inputRef = useRef(null);
  const isVideo = allowVideo && valueType === "video";
  const pick = () => inputRef.current?.click();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const video = allowVideo && VID_EXT.includes(ext);
    if (!video && !IMG_EXT.includes(ext)) {
      return toast.error(allowVideo ? "Use imagem (JPG, PNG, WEBP) ou vídeo (MP4, WEBM)." : "Use imagem JPG, PNG ou WEBP.");
    }
    const maxMB = video ? 25 : 5;
    if (file.size > maxMB * 1024 * 1024) return toast.error(`Arquivo muito grande. Limite de ${maxMB} MB.`);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("field", field);
      fd.append("file", file);
      const { data } = await axios.post(`${API}/media/upload`, fd);
      setUploadedName(data.filename || file.name);
      onChange(`${API}/files/${data.path}`, data.type);
      toast.success("Arquivo enviado com sucesso.");
    } catch (err) {
      toast.error(formatError(err?.response?.data?.detail, "Falha ao enviar o arquivo."));
    } finally {
      setUploading(false);
    }
  };

  const accept = allowVideo ? ".jpg,.jpeg,.png,.webp,.mp4,.webm" : ".jpg,.jpeg,.png,.webp";
  const fileName = uploadedName || (value ? decodeURIComponent(value.split("/").pop() || "") : "");

  const remove = () => {
    setUploadedName("");
    onChange("", "");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-slate-700">{label}</p>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" data-testid={`${testId}-input`} />
      {value ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
            {isVideo ? (
              <video src={value} controls muted playsInline className="h-40 w-full object-contain" data-testid={`${testId}-preview-video`} />
            ) : (
              <img src={value} alt={label} className="h-40 w-full object-cover" data-testid={`${testId}-preview-image`} />
            )}
          </div>
          <p className="truncate text-xs text-slate-400" data-testid={`${testId}-filename`}>{fileName}</p>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={pick} disabled={uploading} data-testid={`${testId}-replace`}>
              {uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />} Substituir
            </Button>
            <Button type="button" size="sm" variant="ghost" className="rounded-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={remove} disabled={uploading} data-testid={`${testId}-remove`}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={uploading}
          data-testid={`${testId}-choose`}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-slate-400 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-sm font-medium">{uploading ? "Enviando..." : "Escolher arquivo"}</span>
          <span className="text-xs text-slate-400">{allowVideo ? "Imagem até 5MB ou vídeo até 25MB" : "JPG, PNG ou WEBP até 5MB"}</span>
        </button>
      )}
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
      <p className="mt-1 max-w-sm text-sm text-slate-500">Esta área está preparada visualmente e será ativada em uma próxima etapa.</p>
    </div>
  </div>
);

/* ---------------- Dashboard ---------------- */
const Dashboard = ({ user, onLogout }) => {
  const [active, setActive] = useState("overview");
  const [editing, setEditing] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/clientes`);
      setClientes(res.data);
    } catch (err) {
      if (err?.response?.status === 401) return onLogout();
      toast.error("Não foi possível carregar os clientes.");
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const stats = {
    total: clientes.length,
    publicados: clientes.filter((c) => c.status === "Publicado").length,
    rascunhos: clientes.filter((c) => c.status !== "Publicado").length,
  };

  const filteredClientes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clientes.filter((c) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "Publicado" ? c.status === "Publicado" : c.status !== "Publicado");
      const matchesSearch =
        !q ||
        (c.nome || "").toLowerCase().includes(q) ||
        (c.slug || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [clientes, search, statusFilter]);

  const filtersActive = search.trim() !== "" || statusFilter !== "all";
  const clearFilters = () => { setSearch(""); setStatusFilter("all"); };

  const go = (id) => {
    setActive(id);
    if (id !== "new-client") setEditing(null);
    setSidebarOpen(false);
  };

  const handleEdit = (cli) => { setEditing(cli); setActive("new-client"); };
  const handleNewClient = () => { setEditing(null); setActive("new-client"); };
  const handleSaved = async () => { await fetchClientes(); setEditing(null); setActive("clients"); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`${API}/clientes/${toDelete.id}`);
      toast.success("Cliente removido com sucesso.");
      setToDelete(null);
      fetchClientes();
    } catch {
      toast.error("Não foi possível remover o cliente.");
    }
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
                active === item.id ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="space-y-3">
        <Link to="/demo/cliente-exemplo" target="_blank" className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800">
          <ExternalLink className="h-4 w-4" /> Ver cartão de exemplo
        </Link>
        <div className="border-t border-slate-800 pt-3">
          <p className="truncate px-1 text-xs text-slate-500" title={user?.email}>{user?.email}</p>
          <button data-testid="admin-logout-button" onClick={onLogout} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
            <LogOut className="h-4 w-4" /> Encerrar sessão
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
        <Link to="/" className="font-heading font-extrabold text-white">Digital Cards<span className="text-indigo-400">.IA</span></Link>
        <button data-testid="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside className="hidden w-64 flex-shrink-0 flex-col justify-between border-r border-slate-800 bg-slate-900 p-6 md:flex">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <aside className="flex flex-col justify-between gap-8 border-b border-slate-800 bg-slate-900 p-6 md:hidden">
          <SidebarContent />
        </aside>
      )}

      <main className="flex-1 overflow-y-auto p-5 sm:p-8 lg:p-10">
        {active === "overview" && (
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Visão geral</h1>
                <p className="mt-1 text-sm text-slate-500">Resumo da sua conta.</p>
              </div>
              <Button data-testid="overview-new-client-button" onClick={handleNewClient} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                <UserPlus className="mr-2 h-4 w-4" /> Novo cliente
              </Button>
            </div>
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <KpiCard testId="kpi-total-clientes" label="Total de clientes" value={stats.total} icon={Users} tint="bg-indigo-50 text-indigo-600" />
              <KpiCard testId="kpi-publicados" label="Cartões publicados" value={stats.publicados} icon={CheckCircle2} tint="bg-emerald-50 text-emerald-600" />
              <KpiCard testId="kpi-rascunhos" label="Rascunhos" value={stats.rascunhos} icon={FileEdit} tint="bg-amber-50 text-amber-600" />
            </div>
            <ClientsTable clientes={clientes} loading={loading} onEdit={handleEdit} onDelete={setToDelete} title="Clientes recentes" />
          </div>
        )}

        {active === "clients" && (
          <div>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Clientes</h1>
                <p className="mt-1 text-sm text-slate-500">Gerencie os cartões digitais dos seus clientes.</p>
              </div>
              <Button data-testid="clients-new-client-button" onClick={handleNewClient} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                <UserPlus className="mr-2 h-4 w-4" /> Novo cliente
              </Button>
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  data-testid="clients-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou slug..."
                  className="pl-9"
                />
                {search && (
                  <button
                    type="button"
                    data-testid="clients-search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Limpar busca"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="clients-status-filter" className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="Publicado">Publicado</SelectItem>
                    <SelectItem value="Rascunho">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
                {filtersActive && (
                  <Button
                    data-testid="clients-clear-filters"
                    onClick={clearFilters}
                    variant="outline"
                    className="rounded-full"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" /> Limpar
                  </Button>
                )}
              </div>
            </div>

            {filtersActive && !loading && (
              <p className="mb-4 text-sm text-slate-500" data-testid="clients-filter-count">
                Mostrando {filteredClientes.length} de {clientes.length} clientes
              </p>
            )}

            <ClientsTable
              clientes={filteredClientes}
              loading={loading}
              onEdit={handleEdit}
              onDelete={setToDelete}
              title="Todos os clientes"
              emptyMessage={filtersActive ? "Nenhum cliente corresponde à busca ou ao filtro selecionado." : "Nenhum cliente cadastrado ainda."}
            />
          </div>
        )}

        {active === "new-client" && (
          <NewClientView editing={editing} onSaved={handleSaved} onCancel={() => go("clients")} />
        )}
        {active === "appearance" && <PlaceholderView testId="appearance-view" icon={Palette} title="Aparência" description="Temas e estilos globais dos cartões." />}
        {active === "settings" && <SecurityView onLogout={onLogout} />}
      </main>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent data-testid="delete-confirm-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{toDelete?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel-button">Cancelar</AlertDialogCancel>
            <AlertDialogAction data-testid="delete-confirm-button" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ---------------- Auth gate ---------------- */
const Admin = () => {
  const [status, setStatus] = useState("checking"); // checking | authed | anon
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setStatus("anon");
      return;
    }
    setAuthHeader(token);
    axios
      .get(`${API}/auth/me`)
      .then((res) => {
        setUser(res.data);
        setStatus("authed");
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthHeader(null);
        setStatus("anon");
      });
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    setStatus("authed");
  };

  const handleLogout = useCallback(async () => {
    try { await axios.post(`${API}/auth/logout`); } catch { /* stateless */ }
    localStorage.removeItem(TOKEN_KEY);
    setAuthHeader(null);
    setUser(null);
    setStatus("anon");
  }, []);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFC] text-slate-400" data-testid="admin-checking">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (status === "anon") return <AdminLogin onLogin={handleLogin} />;

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default Admin;
