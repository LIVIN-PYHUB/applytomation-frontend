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
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              to="/home" 
              className="flex items-center gap-3 group transition-transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-white text-2xl font-black">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 leading-tight">APPLYTOMATION</span>
                <span className="text-xs text-gray-500 font-medium">Job Automation Portal</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                      isActive
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    <span className="hidden sm:inline text-sm">{item.label}</span>
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
              <div className="ml-2 pl-2 border-l border-gray-200">
                <NotificationCenter />
              </div>
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

