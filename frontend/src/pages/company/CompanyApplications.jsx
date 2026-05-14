import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, User, FileText, Clock, Eye, CheckCircle, XCircle, Briefcase, Star, Calendar, MessageSquare, Download } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:     { label: 'En attente', class: 'bg-amber-100 text-amber-700', icon: Clock },
  viewed:      { label: 'Vue', class: 'bg-blue-100 text-blue-700', icon: Eye },
  shortlisted: { label: 'Présélectionné', class: 'bg-green-100 text-green-700', icon: CheckCircle },
  interview:   { label: 'Entretien', class: 'bg-purple-100 text-purple-700', icon: Calendar },
  offered:     { label: 'Offre faite', class: 'bg-emerald-100 text-emerald-700', icon: Star },
  rejected:    { label: 'Refusé', class: 'bg-red-100 text-red-600', icon: XCircle },
  withdrawn:   { label: 'Retirée', class: 'bg-gray-100 text-gray-500', icon: XCircle },
};

const NEXT_STATUSES = {
  pending:     ['viewed', 'shortlisted', 'rejected'],
  viewed:      ['shortlisted', 'interview', 'rejected'],
  shortlisted: ['interview', 'offered', 'rejected'],
  interview:   ['offered', 'rejected'],
};

function StatusModal({ application, onClose, onUpdate }) {
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const nextOptions = NEXT_STATUSES[application.status] || [];

  const handleSubmit = async () => {
    if (!status) return;
    setLoading(true);
    try {
      await api.put(`/applications/${application._id}/status`, { status, note, interviewDate, interviewLocation });
      toast.success('Statut mis à jour ✓');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-display font-bold text-gray-900">Changer le statut</h3>
          <p className="text-sm text-gray-500 mt-1">{application.student?.firstName} {application.student?.lastName}</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="label">Nouveau statut *</label>
            <div className="grid grid-cols-2 gap-2">
              {nextOptions.map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${status === s ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {status === 'interview' && (
            <>
              <div>
                <label className="label">Date d'entretien</label>
                <input type="datetime-local" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Lieu / Lien visio</label>
                <input value={interviewLocation} onChange={e => setInterviewLocation(e.target.value)} className="input" placeholder="Bureau principal / Zoom..." />
              </div>
            </>
          )}

          <div>
            <label className="label">Note interne <span className="text-gray-400 font-normal">(optionnelle)</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="input resize-none" placeholder="Observations sur le candidat..." />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 justify-center text-sm">Annuler</button>
            <button onClick={handleSubmit} disabled={!status || loading} className="btn-primary flex-1 justify-center text-sm">
              {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : 'Confirmer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyApplications() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      const [appRes, jobRes] = await Promise.all([
        api.get(`/applications/job/${jobId}?${params}`),
        api.get(`/jobs/${jobId}`),
      ]);
      setApplications(appRes.data.data || []);
      setPagination(appRes.data.pagination || {});
      setJob(jobRes.data.job);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Link to="/company/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-5 transition-colors">
        <ChevronLeft size={16} /> Retour au dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">{job?.title || 'Candidatures'}</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total || 0} candidature(s) reçue(s)</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[['', 'Toutes'], ['pending', 'En attente'], ['shortlisted', 'Présélectionnés'], ['interview', 'Entretien'], ['offered', 'Offres'], ['rejected', 'Refusés']].map(([val, lbl]) => (
          <button key={val} onClick={() => { setStatusFilter(val); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${statusFilter === val ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-24" />)}</div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-16">
          <User size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">Aucune candidature</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === app._id;
            const canChange = NEXT_STATUSES[app.status]?.length > 0;

            return (
              <div key={app._id} className="card hover:border-primary-200 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-sm">
                    {app.student?.firstName?.[0]}{app.student?.lastName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{app.student?.firstName} {app.student?.lastName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[app.student?.degree, app.student?.fieldOfStudy, app.student?.university].filter(Boolean).join(' — ')}
                        </p>
                        {app.student?.wilaya && (
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            📍 {app.student.wilaya}
                          </p>
                        )}
                      </div>
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.class}`}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                    </div>

                    {/* Skills */}
                    {app.student?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {app.student.skills.slice(0, 5).map(s => (
                          <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{s}</span>
                        ))}
                      </div>
                    )}

                    {/* Expanded: cover letter + actions */}
                    {isExpanded && app.coverLetter && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-200 animate-fade-in">
                        <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><MessageSquare size={11} /> Lettre de motivation</p>
                        {app.coverLetter}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(app.createdAt), { locale: fr, addSuffix: true })}</p>
                      <div className="flex items-center gap-2">
                        {app.coverLetter && (
                          <button onClick={() => setExpandedId(isExpanded ? null : app._id)}
                            className="text-xs text-gray-500 hover:text-primary-500 transition-colors">
                            {isExpanded ? 'Réduire' : 'Voir lettre'}
                          </button>
                        )}
                        {app.cv?.filename && (
                          <a href={`/uploads/cvs/${app.cv.filename}`} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors">
                            <Download size={12} /> CV
                          </a>
                        )}
                        {canChange && (
                          <button onClick={() => setSelected(app)} className="btn-primary text-xs py-1.5 px-3">
                            Mettre à jour
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Préc.</button>
          <span className="text-sm text-gray-500">Page {page}/{pagination.pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Suiv. →</button>
        </div>
      )}

      {selected && (
        <StatusModal application={selected} onClose={() => setSelected(null)} onUpdate={fetchData} />
      )}
    </div>
  );
}
