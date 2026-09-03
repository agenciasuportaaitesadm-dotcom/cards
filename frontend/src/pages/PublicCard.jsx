import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import CardTemplate from "@/components/CardTemplate";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PublicCard = () => {
  const { slug } = useParams();
  const [cliente, setCliente] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    axios
      .get(`${API}/public/clientes/${slug}`)
      .then((res) => {
        if (!active) return;
        setCliente(res.data);
        setStatus("ok");
        if (res.data?.seoTitle) document.title = res.data.seoTitle;
      })
      .catch(() => {
        if (!active) return;
        setStatus("notfound");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B] text-zinc-400" data-testid="public-card-loading">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[#09090B] px-6 text-center text-zinc-300" data-testid="public-card-notfound">
        <h1 className="font-heading text-2xl font-bold text-white">Página não encontrada</h1>
        <p className="text-sm text-zinc-500">O cartão digital que você procura não existe ou foi removido.</p>
      </div>
    );
  }

  return <CardTemplate data={cliente} />;
};

export default PublicCard;
