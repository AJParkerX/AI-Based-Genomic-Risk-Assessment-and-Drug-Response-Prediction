import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Genedata from "./pages/Genedata";
import Risk from "./pages/Risk";   // ✅ new
import Drug from "./pages/Drug";   // ✅ new
import About from "./pages/About";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/genedata" element={<Genedata />} />
          <Route path="/risk" element={<Risk />} />     {/* ✅ */}
          <Route path="/drug" element={<Drug />} />     {/* ✅ */}
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
