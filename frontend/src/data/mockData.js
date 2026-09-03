// Dados de demonstração — preparados para futura persistência em banco de dados.
// Nenhum dado real de cliente é utilizado.

export const studioExemplo = {
  slug: "cliente-exemplo",
  nome: "Studio Exemplo",
  descricao:
    "Estúdio de beleza e estética avançada. Atendimento personalizado com hora marcada no coração da cidade.",
  telefone: "(11) 4000-0000",
  whatsapp: "5511990000000",
  endereco: "Av. Paulista, 1000 — Bela Vista, São Paulo/SP",
  mapsUrl: "https://maps.google.com/?q=Av.+Paulista+1000+Sao+Paulo",
  googleReviewUrl: "https://g.page/r/exemplo/review",
  instagram: "https://instagram.com/studioexemplo",
  facebook: "https://facebook.com/studioexemplo",
  tiktok: "https://tiktok.com/@studioexemplo",
  website: "https://studioexemplo.com.br",
  cover:
    "https://images.pexels.com/photos/13068380/pexels-photo-13068380.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  avatar:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
  horario: [
    { dia: "Segunda a Sexta", horas: "09:00 — 19:00" },
    { dia: "Sábado", horas: "09:00 — 16:00" },
    { dia: "Domingo", horas: "Fechado" },
  ],
  servicos: [
    { titulo: "Corte & Escova", detalhe: "A partir de R$ 80" },
    { titulo: "Coloração", detalhe: "A partir de R$ 150" },
    { titulo: "Design de Sobrancelhas", detalhe: "A partir de R$ 45" },
    { titulo: "Estética Facial", detalhe: "Sob consulta" },
  ],
};

export const adminStats = {
  totalClientes: 12,
  publicados: 8,
  rascunhos: 4,
};

export const clientesDemo = [
  { id: 1, nome: "Studio Exemplo", slug: "cliente-exemplo", status: "Publicado" },
  { id: 2, nome: "Padaria Central", slug: "padaria-central", status: "Publicado" },
  { id: 3, nome: "Clínica Vida+", slug: "clinica-vida-mais", status: "Rascunho" },
  { id: 4, nome: "Auto Peças Norte", slug: "auto-pecas-norte", status: "Publicado" },
  { id: 5, nome: "Café da Esquina", slug: "cafe-da-esquina", status: "Rascunho" },
  { id: 6, nome: "Advocacia Lima", slug: "advocacia-lima", status: "Publicado" },
];
