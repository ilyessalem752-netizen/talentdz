import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, Eye, CheckCircle, XCircle, MapPin, Calendar, ChevronRight, Filter } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:     { label: 'En attente', class: 'bg-amber-100 text-amber-700', icon: Clock },
  viewed:      { label: 'Vue', class: 'bg-blue-100 text-blue-700', icon: Eye },
  shortlisted: { label: 'Présélectionné', class: 'bg-green-100 text-green-700', icon: CheckCircle },
  interview:   { label: 'Entretien', class: 'bg-purple-100 text-purple-700', icon: Briefcase },
  offered:     { label: 'Offre reçue 🎉', class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  rejected:    { label: 'Non retenu', class: 'bg-red-100 text-red-600', icon: XCircle },
  withdrawn:   { label: 'Retirée', class: 'bg-gray-100 text-gray-500', icon: XCircle },
};

const TYPE_LABELS = { cdi:'CDI', cdd:'CDD', stage:'Stage', alternance:'Alternance', freelance:'Freelance' };

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [withdrawing, setWithdrawing] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/applications/mine?${params}`);
      setApplications(data.data || []);
      setPagination(data.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [page, statusFilter]);

  const handleWithdraw = async (appId) => {
    if (!confirm('Retirer cette candidature ?')) return;
    setWithdrawing(appId);
    try {
      await api.put(`/applications/${appId}/withdraw`);
      toast.success('Candidature retirée');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setWithdrawing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Mes candidatures</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total || 0} candidature(s) au total</p>
        </div>
        <Link to="/jobs" className="btn-primary text-sm">Nouvelles offres</Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[['', 'Toutes'], ...Object.entries(STATUS_CONFIG).map(([v, { label }]) => [v, label])].map(([val, lbl]) => (
          <button key={val} onClick={() => { setStatusFilter(val); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${statusFilter === val ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-28" />)}</div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">Aucune candidature trouvée</p>
          <Link to="/jobs" className="btn-primary mt-4 text-sm">Explorer les offres</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            return (
              <div key={app._id} className="card hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={20} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/jobs/${app.job?._id}`} className="font-display font-bold text-gray-900 hover:text-primary-500 transition-colors line-clamp-1">{app.job?.title}</Link>
                        <p className="text-sm text-gray-500">{app.job?.company?.name}</p>
                      </div>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.class}`}>
                        <StatusIcon size={12} /> {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      {app.job?.type && <span className="flex items-center gap-1"><Briefcase size={11} /> {TYPE_LABELS[app.job.type]}</span>}
                      {app.job?.wilaya && <span className="flex items-center gap-1"><MapPin size={11} /> {app.job.wilaya}</span>}
                      <span className="flex items-center gap-1"><Calendar size={11} /> Postulé {formatDistanceToNow(new Date(app.createdAt), { locale: fr, addSuffix: true })}</span>
                    </div>

                    {/* Interview info */}
                    {app.status === 'interview' && app.interviewDate && (
                      <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-100 text-xs text-purple-700">
                        📅 Entretien le {format(new Date(app.interviewDate), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        {app.interviewLocation && ` — ${app.interviewLocation}`}
                      </div>
                    )}

                    {/* Actions */}
                    {!['rejected', 'offered', 'withdrawn'].includes(app.status) && (
                      <div className="mt-3">
                        <button onClick={() => handleWithdraw(app._id)} disabled={withdrawing === app._id}
                          className="text-xs text-red-500 hover:text-red-600 hover:underline transition-colors">
                          Retirer la candidature
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Préc.</button>
          <span className="text-sm text-gray-500">Page {page}/{pagination.pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Suiv. →</button>
        </div>
      )}
    </div>
  );
}
