// frontend/src/pages/Landing.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Button from '../components/common/Button';
import { BookOpen, PenTool, Users } from 'lucide-react';

/**
 * Landing page with login/register options
 */
const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/home');
    return null;
  }

  const openLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleStartReading = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-3xl font-bold text-black">Haerin</h1>
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={openLogin}>
                Login
              </Button>
              <Button variant="primary" onClick={openRegister}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-6xl font-bold text-gray-900 leading-tight">
            Share Your Stories
            <br />
            <span className="text-gray-600">With the World</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Haerin is a minimalist blogging platform where writers share their ideas,
            stories, and expertise with readers everywhere.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="primary" size="lg" onClick={handleStartReading}>
              Start Reading
            </Button>
            <Button variant="secondary" size="lg" onClick={openRegister}>
              Start Writing
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
              <BookOpen size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Read Stories</h3>
            <p className="text-gray-600">
              Discover insightful articles and engaging stories from writers around the world.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
              <PenTool size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Write & Publish</h3>
            <p className="text-gray-600">
              Share your thoughts and ideas with a beautiful, distraction-free editor.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto">
              <Users size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Build Community</h3>
            <p className="text-gray-600">
              Engage with readers through comments and build a following around your work.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-20 mt-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Join Thousands of Writers and Readers
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start your blogging journey today. It's free and takes less than a minute.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={openRegister}
            className="bg-white text-black hover:bg-gray-100"
          >
            Create Your Account
          </Button>
        </div>
      </div>

      {/* Auth Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
      >
        {authMode === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setAuthMode('register')}
            onClose={() => setShowAuthModal(false)}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setAuthMode('login')}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default Landing;