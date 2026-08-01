import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ArticleDetail from "./pages/ArticleDetail";
import About from "./pages/About";
import Saved from "./pages/Saved";
import BottomNav from "./components/BottomNav";

export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #e5e5e5",
            background: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <span style={{ fontWeight: 500, fontSize: "17px" }}>Briefly</span>
        </header>

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/saved" element={<Saved />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
