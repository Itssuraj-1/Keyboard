// frontend/src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * Responsive navigation bar with hamburger menu for mobile
 */
const Navbar = ({ onSearch, onMenuToggle }) => {
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
          {/* Left: Hamburger Menu (Mobile) + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - Only show when authenticated */}
            {isAuthenticated && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            )}

            {/* Logo */}
            <div
              className="flex items-center cursor-pointer shrink-0"
              onClick={() => navigate("/home")}
            >
              <h1 className="text-2xl font-bold text-black">Haerin</h1>
            </div>
          </div>

          {/* Center: Search Bar */}
          {showSearch && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 max-w-2xl mx-4 hidden sm:block"
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

          {/* Right Side - Empty for now, can add user actions */}
          <div className="shrink-0 w-10"></div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="pb-3 sm:hidden">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isSearchFocused ? "text-black" : "text-gray-400"
                }`}
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search blogs..."
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
      </div>
    </nav>
  );
};

export default Navbar;