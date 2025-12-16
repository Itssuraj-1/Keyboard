// frontend/src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Navigation bar component with centered search
 */
const Navbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  // Keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clear search when navigating away from home
  useEffect(() => {
    if (location.pathname !== "/home") {
      setSearchTerm("");
    }
  }, [location.pathname]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Call parent's onSearch if provided (for Home page)
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    // If not on home page, navigate to home with search
    if (location.pathname !== "/home") {
      navigate("/home");
    }

    // Call parent's onSearch
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
    searchInputRef.current?.focus();
  };

  // Only show search bar on authenticated pages or home
  const showSearch = isAuthenticated || location.pathname === "/home";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer shrink-0"
            onClick={() => navigate("/home")}
          >
            <h1 className="text-2xl font-bold text-black">Haerin</h1>
          </div>

          {/* Search Bar - Center */}
          {showSearch && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-2xl mx-4"
            >
              <div className="relative transition-all duration-200">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isSearchFocused ? "text-black" : "text-gray-400"
                  }`}
                  size={18}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Search blogs... (⌘K)"
                  className="w-full pl-11 pr-10 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Right Side - Could add user actions here later */}
          <div className="shrink-0">
            {/* Placeholder for future actions like notifications, etc. */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
