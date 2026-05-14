import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, Briefcase, Filter, X, ChevronDown, Building2, BadgeCheck, SlidersHorizontal } from 'lucide-react';
import api from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TYPE_LABELS = { cdi:'CDI', cdd:'CDD', stage:'Stage', alternance:'Alternance', freelance:'Freelance', temps_partiel:'Temps partiel' };
const LEVEL_LABELS = { junior:'Junior', intermediaire:'Intermédiaire', senior:'Senior', manager:'Manager', directeur:'Directeur', etudiant:'Étudiant' };
const REMOTE_LABELS = { onsite:'Présentiel', remote:'Télétravail', hybrid:'Hybride' };
const TYPE_COLORS = { cdi:'badge-green', cdd:'badge-blue', stage:'badge-purple', alternance:'badge-amber', freelance:'badge-gray', temps_partiel:'badge-gray' };

function JobCard({ job }) {
  const logo = job.company?.logo ? `/uploads/logos/${job.company.logo}` : null;
  return (
    <Link to={`/jobs/${job._id}`} className="card hover:shadow-md hover:border-primary-200 transition-all group block">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
          {logo ? <img src={logo} alt={job.company?.name} className="w-full h-full object-cover" /> : <Building2 size={22} className="text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-1">{job.title}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                {job.company?.name}
                {job.company?.isVerified && <BadgeCheck size={14} className="text-blue-500" />}
              </p>
            </div>
            <span className={TYPE_COLORS[job.type] || 'badge-gray'}>{TYPE_LABELS[job.type]}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-gray-500">
            {job.wilaya && <span className="flex items-center gap-1"><MapPin size={12} /> {job.wilaya}{job.city ? `, ${job.city}` : ''}</span>}
            <span className="flex items-center gap-1"><Briefcase size={12} /> {LEVEL_LABELS[job.level]}</span>
            {job.remote !== 'onsite' && <span className="badge-blue">{REMOTE_LABELS[job.remote]}</span>}
            <span className="flex items-center gap-1 ml-auto"><Clock size={12} /> {formatDistanceToNow(new Date(job.createdAt), { locale: fr, addSuffix: true })}</span>
          </div>
          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {job.skills.slice(0, 4).map(s => (
                <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{s}</span>
              ))}
              {job.skills.length > 4 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">+{job.skills.length - 4}</span>}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    level: '',
    wilaya: '',
    remote: '',
    sector: searchParams.get('sector') || '',
    sortBy: 'createdAt',
  });
  const [page, setPage] = useState(1);

  const WILAYAS = ['Alger','Oran','Constantine','Annaba','Blida','Batna','Sétif','Tlemcen','Béjaïa','Tizi Ouzou','Sidi Bel Abbès','Biskra','Médéa','Skikda','Boumerdès','Tipaza'];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const { data } = await api.get(`/jobs?${params.toString()}`);
      setJobs(data.data || []);
      setPagination(data.pagination || {});
    } catch (_) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', type: '', level: '', wilaya: '', remote: '', sector: '', sortBy: 'createdAt' });
    setPage(1);
  };

  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sortBy').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Offres d'emploi</h1>
        <p className="text-gray-500">{pagination.total ? `${pagination.total} offres disponibles` : 'Parcourez les offres'}</p>
      </div>

      {/* Search + Filter bar */}
      <div className="card mb-6 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              placeholder="Titre, compétence, secteur..."
              className="input pl-10"
            />
          </div>
          <div className="relative hidden md:block">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={filters.wilaya} onChange={e => updateFilter('wilaya', e.target.value)}
              className="input pl-9 w-44 appearance-none">
              <option value="">Toute wilaya</option>
              {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary py-2.5 px-4 gap-1.5 ${showFilters ? 'border-primary-400 text-primary-600' : ''}`}>
            <SlidersHorizontal size={16} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
            <select value={filters.type} onChange={e => updateFilter('type', e.target.value)} className="input text-sm">
              <option value="">Type de contrat</option>
              {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={filters.level} onChange={e => updateFilter('level', e.target.value)} className="input text-sm">
              <option value="">Niveau d'expérience</option>
              {Object.entries(LEVEL_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={filters.remote} onChange={e => updateFilter('remote', e.target.value)} className="input text-sm">
              <option value="">Mode de travail</option>
              {Object.entries(REMOTE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={filters.sortBy} onChange={e => updateFilter('sortBy', e.target.value)} className="input text-sm">
              <option value="createdAt">Plus récentes</option>
              <option value="views">Plus consultées</option>
            </select>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="col-span-2 md:col-span-4 flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                <X size={14} /> Effacer les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune offre trouvée</h3>
          <p className="text-gray-400 text-sm">Modifiez vos critères de recherche</p>
          <button onClick={clearFilters} className="btn-primary mt-4 text-sm">Voir toutes les offres</button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map(job => <JobCard key={job._id} job={job} />)}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Précédent</button>
              <span className="text-sm text-gray-500 px-4">Page {pagination.page} / {pagination.pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Suivant →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
