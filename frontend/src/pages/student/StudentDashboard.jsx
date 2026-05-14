import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, FileText, Bell, User, TrendingUp, Clock, CheckCircle, XCircle, Eye, ChevronRight, Upload, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG = {
  pending:     { label: 'En attente', color: 'badge-amber', icon: Clock },
  viewed:      { label: 'Vue', color: 'badge-blue', icon: Eye },
  shortlisted: { label: 'Présélectionné', color: 'badge-green', icon: CheckCircle },
  interview:   { label: 'Entretien', color: 'badge-purple', icon: Briefcase },
  offered:     { label: 'Offre reçue 🎉', color: 'badge-green', icon: CheckCircle },
  rejected:    { label: 'Non retenu', color: 'badge-red', icon: XCircle },
  withdrawn:   { label: 'Retirée', color: 'badge-gray', icon: XCircle },
};

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, shortlisted: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/applications/mine?limit=5'),
      api.get('/notifications?limit=8'),
    ]).then(([appRes, notifRes]) => {
      const apps = appRes.data.data || [];
      setApplications(apps);
      setNotifications(notifRes.data.notifications || []);
      setStats({
        total: appRes.data.pagination?.total || apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        shortlisted: apps.filter(a => a.status === 'shortlisted').length,
        interviews: apps.filter(a => a.status === 'interview').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const completeness = profile?.profileCompleteness || 0;
  const firstName = profile?.firstName || user?.email.split('@')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-white/5 rounded-full translate-x-20 -translate-y-8 blur-2xl" />
        <h1 className="text-2xl font-display font-bold mb-1">Bonjour, {firstName} 👋</h1>
        <p className="text-white/70 text-sm">Bienvenue sur votre tableau de bord TalentDZ</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/jobs" className="btn-accent text-sm py-2">Voir les offres</Link>
          <Link to="/student/profile" className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl border border-white/20 transition-all">Mon profil</Link>
        </div>
      </div>

      {/* Profile completeness alert */}
      {completeness < 70 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Profil incomplet — {completeness}%</p>
            <p className="text-xs text-amber-600 mt-0.5">Un profil complet multiplie vos chances d'être recruté.</p>
            <div className="mt-2 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${completeness}%` }} />
            </div>
          </div>
          <Link to="/student/profile" className="flex-shrink-0 text-xs text-amber-700 font-semibold hover:underline">Compléter →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Candidatures', value: stats.total, icon: FileText, color: 'text-blue-600 bg-blue-100' },
          { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-100' },
          { label: 'Présélectionné', value: stats.shortlisted, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
          { label: 'Entretiens', value: stats.interviews, icon: Briefcase, color: 'text-purple-600 bg-purple-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-gray-900">Mes candidatures récentes</h2>
            <Link to="/student/applications" className="text-sm text-primary-500 hover:underline flex items-center gap-1">Tout voir <ChevronRight size={14} /></Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse flex gap-4"><div className="w-10 h-10 bg-gray-200 rounded-xl" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-2/3" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div></div>
            ))}</div>
          ) : applications.length === 0 ? (
            <div className="card text-center py-12">
              <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Aucune candidature</p>
              <p className="text-sm text-gray-400 mb-4">Commencez à postuler aux offres qui vous intéressent</p>
              <Link to="/jobs" className="btn-primary text-sm">Explorer les offres</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => {
                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                return (
                  <div key={app._id} className="card flex items-center gap-4 hover:border-primary-200 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Briefcase size={18} className="text-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{app.job?.title}</p>
                      <p className="text-xs text-gray-500">{app.job?.company?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(app.createdAt), { locale: fr, addSuffix: true })}</p>
                    </div>
                    <span className={cfg.color}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications + CV quick actions */}
        <div className="space-y-4">
          {/* CV upload quick action */}
          {!profile?.cv?.filename && (
            <div className="card border-dashed border-2 border-amber-200 bg-amber-50">
              <div className="flex items-center gap-3 mb-3">
                <Upload size={20} className="text-amber-500" />
                <p className="font-semibold text-amber-800 text-sm">Uploadez votre CV</p>
              </div>
              <p className="text-xs text-amber-600 mb-3">Un CV est requis pour postuler aux offres.</p>
              <Link to="/student/profile" className="btn-accent text-xs py-1.5 px-3">Uploader mon CV</Link>
            </div>
          )}

          {/* Notifications */}
          <div>
            <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Notifications</h2>
            {notifications.length === 0 ? (
              <div className="card text-center py-8">
                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 6).map(notif => (
                  <div key={notif._id} className={`p-3 rounded-xl border text-sm ${notif.isRead ? 'bg-white border-gray-100' : 'bg-primary-50 border-primary-100'}`}>
                    <p className={`font-medium ${notif.isRead ? 'text-gray-700' : 'text-primary-700'}`}>{notif.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{notif.message}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDistanceToNow(new Date(notif.createdAt), { locale: fr, addSuffix: true })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
