// frontend/src/components/layout/Sidebar.jsx
import { Home, PenSquare, BarChart3, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Sidebar navigation component
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Home", icon: Home, path: "/home" },
    { name: "Write", icon: PenSquare, path: "/create" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
      <nav className="p-4">
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
    </aside>
  );
};

export default Sidebar;
