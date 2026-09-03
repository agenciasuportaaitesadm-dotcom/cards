import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Landing from "@/pages/Landing";
import Admin from "@/pages/Admin";
import DemoCard from "@/pages/DemoCard";
import PublicCard from "@/pages/PublicCard";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/demo/cliente-exemplo" element={<DemoCard />} />
          <Route path="/c/:slug" element={<PublicCard />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
