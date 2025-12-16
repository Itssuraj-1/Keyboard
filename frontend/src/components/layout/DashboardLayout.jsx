// frontend/src/components/layout/DashboardLayout.jsx
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

/**
 * Main dashboard layout with navbar and sidebar
 */
const DashboardLayout = ({ children, onSearch }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={onSearch} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
