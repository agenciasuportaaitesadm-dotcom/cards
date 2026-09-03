import CardTemplate from "@/components/CardTemplate";
import { studioExemplo } from "@/data/mockData";

const DemoCard = () => {
  const data = {
    nome: studioExemplo.nome,
    descricao: studioExemplo.descricao,
    avatar: studioExemplo.avatar,
    cover: studioExemplo.cover,
    corFundo: "#121215",
    corBotoes: "#6366F1",
    whatsapp: studioExemplo.whatsapp,
    telefone: studioExemplo.telefone,
    mapsUrl: studioExemplo.mapsUrl,
    endereco: studioExemplo.endereco,
    instagram: studioExemplo.instagram,
    facebook: studioExemplo.facebook,
    tiktok: studioExemplo.tiktok,
    website: studioExemplo.website,
    googleReviewUrl: studioExemplo.googleReviewUrl,
    horario: studioExemplo.horario,
    servicos: studioExemplo.servicos,
  };
  return <CardTemplate data={data} />;
};

export default DemoCard;
