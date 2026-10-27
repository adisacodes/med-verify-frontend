import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium ${
    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
  }`;

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <span className="font-bold text-blue-600">MedVerify</span>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Search</NavLink>
          <NavLink to="/verify" className={linkClass}>Verify</NavLink>
          <NavLink to="/reports" className={linkClass}>Reports</NavLink>
          {user ? (
            <button
              onClick={logout}
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Logout ({user.name})
            </button>
          ) : (
            <NavLink to="/login" className={linkClass}>Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;