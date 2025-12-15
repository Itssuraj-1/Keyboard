// frontend/src/components/layout/Sidebar.jsx
import { useState, useRef, useEffect } from "react";
import {
  Home,
  PenSquare,
  FileText,
  BarChart3,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Sidebar navigation component with fixed positioning
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const menuRef = useRef(null);

  const menuItems = [
    { name: "Home", icon: Home, path: "/home" },
    { name: "Write", icon: PenSquare, path: "/create" },
    { name: "My Blogs", icon: FileText, path: "/my-blogs" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 flex flex-col">
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile Section at Bottom */}
      <div className="p-4 border-t border-gray-200 relative" ref={menuRef}>
        <button
          onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            location.pathname === "/profile"
              ? "bg-black text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
              <User size={18} className="text-gray-500" />
            </div>
          )}
          <div className="flex-1 text-left">
            <p className="font-medium text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </button>

        {/* Logout Dropdown Menu */}
        {showLogoutMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => {
                navigate("/profile");
                setShowLogoutMenu(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User size={18} />
              <span className="font-medium text-sm">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
