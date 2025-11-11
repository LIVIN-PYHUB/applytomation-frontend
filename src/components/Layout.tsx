import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Building2, Settings, Clock, User, Shield, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    // Check if user is admin by fetching user profile
    const checkAdmin = async () => {
      try {
        const userId = parseInt(localStorage.getItem('userId') || '1');
        const token = localStorage.getItem('token');
        if (token && userId) {
          // Import userApi dynamically to avoid circular dependency
          const { userApi } = await import('../services/api');
          const response = await userApi.getProfile(userId);
          const isAdminUser = response.data.is_admin || false;
          setIsAdmin(isAdminUser);
          localStorage.setItem('isAdmin', isAdminUser.toString());
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
      }
    };
    checkAdmin();
  }, []);

  // Track route changes
  useEffect(() => {
    if (location.pathname !== prevPath) {
      setPrevPath(location.pathname);
    }
  }, [location.pathname, prevPath]);

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/companies', label: 'Companies', icon: Building2 },
    { path: '/configure', label: 'Configure', icon: Settings },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/resumes', label: 'Resumes', icon: FileText },
    ...(isAdmin ? [{ path: '/admin/masters', label: 'Admin', icon: Shield }] : []),
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">APPLYTOMATION</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
              <NotificationCenter />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

