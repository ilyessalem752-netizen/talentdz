import { useState, useEffect } from 'react';
import { Briefcase, Search, Trash2, Eye, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TYPE_LABELS = { cdi:'CDI', cdd:'CDD', stage:'Stage', alternance:'Alternance', freelance:'Freelance', temps_partiel:'Temps partiel' };
const STATUS_COLORS = { active:'bg-green-100 text-green-700', paused:'bg-amber-100 text-amber-700', closed:'bg-gray-100 text-gray-500', expired:'bg-red-100 text-red-600', draft:'bg-gray-100 text-gray-400' };

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleting, setDeleting] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/jobs?${params}`);
      setJobs(data.data || []);
      setPagination(data.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, [page, statusFilter]);

  const handleDelete = async (jobId, title) => {
    if (!confirm(`Supprimer l'offre "${title}" ? Cette action est irréversible.`)) return;
    setDeleting(jobId);
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      toast.success('Offre supprimée');
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Modération des offres</h1>
          <p className="text-gray-500 text-sm mt-1">{pagination.total || 0} offre(s) au total</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[['', 'Toutes'], ['active', 'Actives'], ['paused', 'En pause'], ['expired', 'Expirées'], ['closed', 'Fermées']].map(([val, lbl]) => (
          <button key={val} onClick={() => { setStatusFilter(val); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${statusFilter === val ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Jobs table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Offre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidatures</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Publiée</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : jobs.map(job => (
                <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.wilaya || '—'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-gray-400" />
                      <span className="truncate max-w-[120px]">{job.company?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {TYPE_LABELS[job.type] || job.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-500'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 text-center">
                    {job.applicationsCount || 0}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {formatDistanceToNow(new Date(job.createdAt), { locale: fr, addSuffix: true })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/jobs/${job._id}`} target="_blank"
                        className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => handleDelete(job._id, job.title)} disabled={deleting === job._id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        {deleting === job._id
                          ? <span className="animate-spin rounded-full h-3 w-3 border-2 border-red-500 border-t-transparent block" />
                          : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && jobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune offre trouvée</p>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Préc.</button>
          <span className="text-sm text-gray-500">Page {page}/{pagination.pages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Suiv. →</button>
        </div>
      )}
    </div>
  );
}
