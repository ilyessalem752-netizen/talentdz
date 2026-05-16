import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Menu, X, Briefcase, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import api from '../../services/api';

export default function MainLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/notifications?limit=1').then(r => setUnread(r.data.unreadCount || 0)).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = profile
    ? (user?.role === 'student'
        ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
        : profile.name ?? user?.email)
    : user?.email ?? '';

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard'
    : user?.role === 'company' ? '/company/dashboard'
    : '/student/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Briefcase size={16} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-primary-500">TalentDZ</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/jobs" className="text-gray-600 hover:text-primary-500 transition-colors">Offres d'emploi</Link>
              {!user && <Link to="/register" className="text-gray-600 hover:text-primary-500 transition-colors">Entreprises</Link>}
              {user && (
                <Link to={dashboardPath} className="text-gray-600 hover:text-primary-500 transition-colors flex items-center gap-1">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <Link to="/login" className="hidden md:block text-sm font-medium text-gray-600 hover:text-primary-500 transition-colors">Connexion</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Inscription</Link>
                </>
              ) : (
                <>
                  {/* Notifications bell */}
                  <button onClick={() => navigate(dashboardPath)} className="relative p-2 text-gray-500 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell size={20} />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>
                    )}
                  </button>

                  {/* User menu */}
                  <div className="relative">
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all text-sm font-medium text-gray-700">
                      <div className="w-7 h-7 rounded-lg bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                        {displayName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="hidden md:block max-w-[120px] truncate">{displayName}</span>
                      <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-400 uppercase tracking-wider">{user.role === 'student' ? 'Étudiant' : user.role === 'company' ? 'Entreprise' : 'Admin'}</p>
                          <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                        </div>
                        <Link to={dashboardPath} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <LayoutDashboard size={15} /> Dashboard
                        </Link>
                        {user.role === 'student' && (
                          <Link to="/student/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <User size={15} /> Mon profil
                          </Link>
                        )}
                        {user.role === 'company' && (
                          <Link to="/company/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <User size={15} /> Profil entreprise
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={15} /> Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mobile burger */}
              <button className="md:hidden p-2 text-gray-500 hover:text-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fade-in">
              <Link to="/jobs" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Offres d'emploi</Link>
              {user ? (
                <>
                  <Link to={dashboardPath} className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileOpen(false)}>Connexion</Link>
                  <Link to="/register" className="block px-3 py-2 text-sm text-primary-500 font-semibold hover:bg-primary-50 rounded-lg" onClick={() => setMobileOpen(false)}>Inscription</Link>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <Briefcase size={14} className="text-white" />
              </div>
              <span className="font-display text-lg font-bold">TalentDZ</span>
            </div>
            <p className="text-sm text-white/50">© {new Date().getFullYear()} TalentDZ — La plateforme de recrutement étudiant en Algérie</p>
            <div className="flex gap-4 text-sm text-white/60">
              <Link to="/jobs" className="hover:text-white transition-colors">Offres</Link>
              <Link to="/register" className="hover:text-white transition-colors">Inscription</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
