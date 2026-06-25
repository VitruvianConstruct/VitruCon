import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App grain">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#12141a",
            color: "#e6dfd1",
            border: "1px solid rgba(197,169,119,0.3)",
            borderRadius: 0,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          },
        }}
      />
    </div>
  );
}

export default App;
