import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Genedata() {
  const [dnaData, setDnaData] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // protect route
  useEffect(() => {
    if (!user) {
      alert("Please login first to access Genedata");
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dnaData.trim()) {
      alert("Please paste DNA raw data");
      return;
    }
    alert("Submit successful!");
    setDnaData("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0026] text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a0038] p-8 rounded-lg shadow-lg w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Paste Raw DNA Data
        </h2>

        <textarea
          placeholder="Paste your raw DNA data here..."
          value={dnaData}
          onChange={(e) => setDnaData(e.target.value)}
          rows={12}
          className="w-full p-4 mb-6 rounded bg-[#24004d] text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button className="w-full bg-purple-600 py-3 rounded hover:bg-purple-700 transition">
          Submit
        </button>
      </form>
    </div>
  );
}
