import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, FileText, TrendingUp, CheckCircle, Clock, Building2, ShieldCheck, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_LABELS = { cdi:'CDI', cdd:'CDD', stage:'Stage', alternance:'Alternance', freelance:'Freelance', temps_partiel:'Temps partiel' };
const STATUS_LABELS = { pending:'En attente', viewed:'Vue', shortlisted:'Présélectionné', interview:'Entretien', offered:'Offre', rejected:'Refusé', withdrawn:'Retirée' };
const STATUS_COLORS = { pending:'#f59e0b', viewed:'#3b82f6', shortlisted:'#10b981', interview:'#8b5cf6', offered:'#059669', rejected:'#ef4444', withdrawn:'#9ca3af' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
      </div>
    </div>
  );

  const { stats, charts, recent } = data || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Administration TalentDZ</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users" className="btn-secondary text-sm">Gérer les utilisateurs</Link>
          <Link to="/admin/jobs" className="btn-primary text-sm">Gérer les offres</Link>
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Étudiants', value: stats?.totalStudents, icon: Users, color: 'text-blue-600 bg-blue-100', delta: `+${stats?.newUsersThisWeek || 0} cette semaine` },
          { label: 'Entreprises', value: stats?.totalCompanies, icon: Building2, color: 'text-purple-600 bg-purple-100' },
          { label: 'Offres actives', value: stats?.activeJobs, icon: Briefcase, color: 'text-green-600 bg-green-100', secondary: `/ ${stats?.totalJobs} total` },
          { label: 'Candidatures', value: stats?.totalApplications, icon: FileText, color: 'text-amber-600 bg-amber-100', secondary: `${stats?.pendingApplications} en attente` },
        ].map(({ label, value, icon: Icon, color, delta, secondary }) => (
          <div key={label} className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={18} /></div>
              <span className="text-sm text-gray-500">{label}</span>
            </div>
            <p className="text-3xl font-display font-bold text-gray-900">{value ?? '—'}</p>
            {(delta || secondary) && <p className="text-xs text-gray-400 mt-1">{delta || secondary}</p>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Applications by status */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-4">Candidatures par statut</h2>
          <div className="space-y-3">
            {charts?.appsByStatus?.map(({ _id, count }) => {
              const total = stats?.totalApplications || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{STATUS_LABELS[_id] || _id}</span>
                    <span className="font-semibold text-gray-800">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[_id] || '#94a3b8' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Jobs by type */}
        <div className="card">
          <h2 className="font-display font-bold text-gray-900 mb-4">Offres par type de contrat</h2>
          <div className="space-y-3">
            {charts?.jobsByType?.map(({ _id, count }) => {
              const total = stats?.totalJobs || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{TYPE_LABELS[_id] || _id}</span>
                    <span className="font-semibold text-gray-800">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">Nouveaux utilisateurs</h2>
            <Link to="/admin/users" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              Tout voir <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recent?.users?.map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${u.role === 'student' ? 'bg-blue-500' : u.role === 'company' ? 'bg-purple-500' : 'bg-red-500'}`}>
                  {u.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400">{u.role} · {formatDistanceToNow(new Date(u.createdAt), { locale: fr, addSuffix: true })}</p>
                </div>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${u.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-900">Offres récentes</h2>
            <Link to="/admin/jobs" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              Tout voir <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recent?.jobs?.map(j => (
              <div key={j._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={14} className="text-primary-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{j.title}</p>
                  <p className="text-xs text-gray-400">{j.company?.name} · {TYPE_LABELS[j.type]}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${j.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
