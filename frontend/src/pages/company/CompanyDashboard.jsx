import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Users, Eye, Plus, ChevronRight, Clock, CheckCircle, TrendingUp, FileText, BadgeCheck, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_COLORS = { active:'badge-green', paused:'badge-amber', closed:'badge-gray', expired:'badge-red', draft:'badge-gray' };
const STATUS_LABELS = { active:'Active', paused:'En pause', closed:'Fermée', expired:'Expirée', draft:'Brouillon' };

export default function CompanyDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, totalApps: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs/company/mine?limit=5'),
    ]).then(([jobsRes]) => {
      const jobList = jobsRes.data.data || [];
      setJobs(jobList);
      setStats({
        total: jobsRes.data.pagination?.total || jobList.length,
        active: jobList.filter(j => j.status === 'active').length,
        totalApps: jobList.reduce((s, j) => s + (j.applicationsCount || 0), 0),
        pending: 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const companyName = profile?.name || user?.email;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-white/5 rounded-full translate-x-20 blur-2xl" />
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold mb-1">{companyName}</h1>
            <p className="text-white/60 text-sm flex items-center gap-1">
              {profile?.isVerified ? <><BadgeCheck size={14} className="text-blue-400" /> Entreprise vérifiée</> : 'Compte entreprise'}
            </p>
          </div>
          <Link to="/company/jobs/new" className="btn-accent text-sm">
            <Plus size={16} /> Publier une offre
          </Link>
        </div>
      </div>

      {/* Not verified banner */}
      {!profile?.isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
          <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Compte en attente de vérification</p>
            <p className="text-xs text-amber-600 mt-0.5">Un admin vérifiera votre entreprise. Les offres publiées restent actives.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Offres publiées', value: stats.total, icon: Briefcase, color: 'text-blue-600 bg-blue-100' },
          { label: 'Offres actives', value: stats.active, icon: TrendingUp, color: 'text-green-600 bg-green-100' },
          { label: 'Candidatures reçues', value: stats.totalApps, icon: Users, color: 'text-purple-600 bg-purple-100' },
          { label: 'Vues profil', value: profile?.profileViews || 0, icon: Eye, color: 'text-amber-600 bg-amber-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={18} /></div>
            <div><p className="text-2xl font-display font-bold text-gray-900">{value}</p><p className="text-xs text-gray-500">{label}</p></div>
          </div>
        ))}
      </div>

      {/* Jobs list */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold text-gray-900">Mes offres d'emploi</h2>
        <Link to="/company/jobs/new" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
          <Plus size={14} /> Nouvelle offre
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-20" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold mb-2">Aucune offre publiée</p>
          <p className="text-sm text-gray-400 mb-5">Publiez votre première offre et recevez des candidatures</p>
          <Link to="/company/jobs/new" className="btn-primary">
            <Plus size={16} /> Publier une offre
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job._id} className="card flex items-center gap-4 hover:border-primary-200 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
                  <span className={STATUS_COLORS[job.status] || 'badge-gray'}>{STATUS_LABELS[job.status]}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users size={11} /> {job.applicationsCount || 0} candidature(s)</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {job.views || 0} vues</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {formatDistanceToNow(new Date(job.createdAt), { locale: fr, addSuffix: true })}</span>
                </div>
              </div>
              <Link to={`/company/applications/${job._id}`} className="flex-shrink-0 btn-secondary text-xs py-2 px-3 gap-1">
                Candidatures <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
