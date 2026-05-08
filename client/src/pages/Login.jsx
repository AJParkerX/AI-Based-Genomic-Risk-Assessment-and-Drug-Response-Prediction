import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      login(data.user);
      navigate("/");
    } else {
      alert(data.msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0026] text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-[#1a0038] p-8 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-2xl font-bold mb-6">Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-[#24004d]"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-[#24004d]"
          required
        />

        <button className="w-full bg-purple-600 py-3 rounded hover:bg-purple-700 transition">
          Login
        </button>

        <p className="mt-4 text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}
