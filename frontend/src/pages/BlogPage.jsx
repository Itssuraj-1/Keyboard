// frontend/src/pages/BlogPage.jsx
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import BlogDetail from '../components/blog/BlogDetail';

/**
 * Individual blog page
 */
const BlogPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <BlogDetail />
      </DashboardLayout>
    );
  }

  // Guest view without dashboard layout
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-black">Haerin</h1>
          </div>
        </div>
      </nav>
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <BlogDetail />
      </div>
    </div>
  );
};

export default BlogPage;