import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  Brain
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || '';
    }
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = {
      student: [
        { path: '/student/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/student/internships', label: 'Internships', icon: BookOpen },
        { path: '/student/applications', label: 'Applications', icon: FileText },
        { path: '/student/ai-tools', label: 'AI Tools', icon: Brain },
        { path: '/student/profile', label: 'Profile', icon: User },
      ],
      mentor: [
        { path: '/mentor/dashboard', label: 'Dashboard', icon: BarChart3 }
      ],
      admin: [
        { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/admin/internships', label: 'Internships', icon: BookOpen },
        { path: '/admin/applications', label: 'Applications', icon: FileText },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      ],
      recruiter: [
        { path: '/recruiter/dashboard', label: 'Dashboard', icon: BarChart3 },
        { path: '/recruiter/students', label: 'Students', icon: Users },
        { path: '/recruiter/internships', label: 'Postings', icon: BookOpen },
      ]
    };
    
    return baseItems[user?.role] || [];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-secondary-900">
                Campus Portal
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <div className="font-medium text-secondary-900">{user?.name}</div>
                  <div className="text-secondary-500 capitalize">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-secondary-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="touch-target md:hidden p-3 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 active:bg-secondary-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden bg-white border-t border-secondary-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 active:bg-secondary-200 active:text-primary-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="border-t border-secondary-200 pt-3 mt-3">
              <div className="flex items-center space-x-3 px-3 py-2">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium text-secondary-900">{user?.name}</div>
                  <div className="text-sm text-secondary-500 capitalize">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 active:bg-red-100 rounded-md"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;