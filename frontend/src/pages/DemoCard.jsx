import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import CardTemplate from "@/components/CardTemplate";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DemoCard = () => {
  const [demo, setDemo] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/public/demo`)
      .then((r) => setDemo(r.data))
      .catch(() => setDemo({}));
  }, []);

  if (!demo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B] text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const data = {
    ...demo,
    cover: demo.headerType === "video" ? "" : (demo.headerUrl || ""),
    coverVideo: demo.headerType === "video" ? (demo.headerUrl || "") : "",
    avatar: demo.profileUrl || "",
  };

  return <CardTemplate data={data} />;
};

export default DemoCard;
