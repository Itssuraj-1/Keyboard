// frontend/src/pages/Home.jsx
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import BlogList from '../components/blog/BlogList';

/**
 * Home page - displays blog feed
 */
const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Latest Blogs</h1>
            <p className="text-gray-600">Discover stories from writers around the world</p>
          </div>
          <BlogList />
        </div>
      </DashboardLayout>
    );
  }

  // Guest view without layout
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Latest Blogs</h1>
          <p className="text-gray-600">Discover stories from writers around the world</p>
        </div>
        <BlogList />
      </div>
    </div>
  );
};

export default Home;