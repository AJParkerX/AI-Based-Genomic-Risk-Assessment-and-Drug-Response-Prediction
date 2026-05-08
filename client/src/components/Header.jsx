import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-[#0e0026] text-white">
       <div className="flex items-center gap-3">
            <img src={logo} alt="H23" className="h-6 w-6" />
            <span className="font-semibold tracking-wide">Helix23</span>
          </div>
      <div className="flex space-x-4">
        <Link to="/">Home</Link>
       {/* protect analyze */}
        <Link to="/about">About</Link>

        {!user ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 bg-purple-700 rounded hover:bg-purple-800"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-purple-500 rounded hover:bg-purple-600"
            >
              Signup
            </Link>
          </>
        ) : (
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
