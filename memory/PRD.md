# Digital Cards IA — PRD

## Problema / Visão
SaaS (PT-BR) para criação e gerenciamento de cartões digitais profissionais. Cada negócio tem uma página pública (mini site) sóbria e mobile-first para compartilhar contato, redes sociais, localização e avaliações via um único link.

## Personas
- **Administrador da agência** (proprietário): cria e gerencia os cartões dos clientes no painel `/admin`.
- **Visitante do mini site**: abre `/c/:slug` pelo WhatsApp/Instagram e interage com os botões.
- **Lead da landing page**: interessado em contratar o serviço.

## Arquitetura
- Frontend React (CRA) + Tailwind + shadcn/ui. Rotas: `/` (landing), `/admin` (painel protegido), `/demo/cliente-exemplo` (demo), `/c/:slug` (mini site público).
- Backend FastAPI (`/api`) + MongoDB (motor). Auth JWT (bcrypt, HS256). Object storage Emergent para mídia.
- Paleta azul-violeta (indigo), tema claro na landing/admin, tema escuro no mini site.

## Requisitos estáticos
- Landing de conversão; painel com Visão geral, Clientes, Novo cliente, Aparência, Configurações.
- Mini site independente (não redireciona para a landing).
- Somente admin autenticado gerencia dados/mídia; páginas/arquivos públicos sem login.

## Implementado (histórico)
- 2026-06: MVP visual — landing, painel demo, mini site `/demo/cliente-exemplo` (dados mockados).
- 2026-06: Link "Acesso administrativo" no rodapé.
- 2026-06: Persistência de clientes (MongoDB CRUD) + página pública `/c/:slug` renderizada dos dados salvos; seed "Studio Exemplo" (slug único, validação). Botões "Abrir mini site"/"Copiar link".
- 2026-06: Autenticação (login/me/logout) protegendo `/admin` e endpoints de clientes; admin único seedado (agenciasuportaaitesadm@gmail.com). Tela de login PT-BR, sessão persistente, "Encerrar sessão".
- 2026-06: "Segurança da conta" (Configurações) — troca de senha com validação (senha atual, mín. 8, confirmação), logout após sucesso; seed não sobrescreve senha alterada.
- 2026-06: **Upload real de mídia** (logo, foto de perfil, cabeçalho imagem/vídeo) via object storage. Referência (URL) salva no doc do cliente; binário fora do Mongo. Validação tipo/tamanho (imagem 5MB, vídeo 25MB) no front e back. `GET /api/files/{path}` público; `POST /api/media/upload` autenticado. CardTemplate renderiza vídeo (mute/loop/controls + fallback imagem/default), logo e foto de perfil condicionalmente.
- 2026-06: **Busca e filtros na lista de clientes** (aba Clientes): busca por nome ou slug, filtro por status (Todos/Publicado/Rascunho), botão "Limpar", contador "Mostrando X de Y clientes", estado vazio específico para filtro sem resultados. Filtragem client-side (sem nova estrutura de banco). KPIs da Visão geral preservam os totais reais. Testado (32 pytest + 12/12 cenários UI, desktop e mobile).
- 2026-06: **QR Code do mini site** (aba Clientes): ação "QR Code" por cliente publicado abre modal (nome, QR gerado no frontend via lib `qrcode`, URL pública `origin/c/slug`, botões Baixar PNG / Copiar link / Fechar; download `qrcode-{slug}.png`). Rascunho: botão desabilitado com explicação. Sem endpoint novo, sem alteração de modelo/DB; QR codifica apenas a URL pública. Testado (32 pytest + 22/22 checks UI, desktop e mobile).
- 2026-06: **Correção do mini site público + formulário de mídia**: (1) botão único reutilizável `.dc-action` — todos os botões usam a cor do tema no fundo/borda/hover/foco; (2) contraste automático (WCAG) de texto/ícone para botões e textos do card; (3) vídeo de cabeçalho `object-contain` vertical/horizontal sem cortar/deformar; (4) botão de som (mudo/som) funcional, autoplay muted; (5) logomarca removida do form/template/pública (perfil e cabeçalho preservados); (6) foto de perfil circular abaixo da mídia sem sobrepor; (7) crop/zoom/reposição (react-easy-crop) antes de enviar perfil (1:1) e capa (3:2), enviando imagem já enquadrada ao endpoint existente; (8) nome preservado + SEO pt-BR no mini site (lang/title/description). Testado (32 pytest + 74/74 asserções UI, 3 temas, desktop e mobile).

## Backlog (prioridade)
- P2: DELETE /api/leads/{id} para limpeza; validação backend de lead (nome+telefone).
- P2: Aba "Aparência" funcional (tema padrão para novos cartões).
- P2: Soft-delete de arquivos órfãos; StreamingResponse para vídeos grandes.
- P2: Exibir nome original do arquivo (parcialmente feito) e refatorar Admin.jsx/server.py em módulos.

## Credenciais de teste
Ver `/app/memory/test_credentials.md`.
