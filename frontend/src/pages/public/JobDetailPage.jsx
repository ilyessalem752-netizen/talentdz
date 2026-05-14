import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Building2, BadgeCheck, ChevronLeft, FileText, Upload, Send, Users, Eye, Calendar, DollarSign, Wifi, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TYPE_LABELS = { cdi:'CDI', cdd:'CDD', stage:'Stage', alternance:'Alternance', freelance:'Freelance', temps_partiel:'Temps partiel' };
const LEVEL_LABELS = { junior:'Junior', intermediaire:'Intermédiaire', senior:'Senior', manager:'Manager', directeur:'Directeur', etudiant:'Étudiant' };

function ApplyModal({ job, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const hasCV = profile?.cv?.filename;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      if (cvFile) formData.append('cv', cvFile);
      await api.post(`/applications/${job._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Candidature envoyée avec succès ! 🎉');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-display font-bold text-gray-900">Postuler à l'offre</h2>
          <p className="text-sm text-gray-500 mt-1">{job.title} — {job.company?.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* CV section */}
          <div>
            <label className="label">CV (PDF)</label>
            {hasCV && !cvFile ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-700">CV actuel utilisé</p>
                  <p className="text-xs text-green-600 truncate">{profile.cv.originalName}</p>
                </div>
                <label className="text-xs text-primary-500 cursor-pointer hover:underline">
                  Changer
                  <input type="file" accept=".pdf" className="hidden" onChange={e => setCvFile(e.target.files[0])} />
                </label>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${cvFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50'}`}>
                {cvFile ? (
                  <>
                    <CheckCircle size={24} className="text-green-500" />
                    <p className="text-sm font-medium text-green-700">{cvFile.name}</p>
                    <p className="text-xs text-gray-400">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400" />
                    <p className="text-sm text-gray-500">Déposez votre CV PDF ici</p>
                    <p className="text-xs text-gray-400">Max 5 MB</p>
                  </>
                )}
                <input type="file" accept=".pdf" className="hidden" onChange={e => setCvFile(e.target.files[0])} />
              </label>
            )}
            {!hasCV && !cvFile && (
              <p className="text-amber-600 text-xs mt-1.5 flex items-center gap-1">
                <span>⚠️</span> Vous n'avez pas de CV. <Link to="/student/profile" className="underline">Uploadez-en un</Link> ou sélectionnez un fichier.
              </p>
            )}
          </div>

          {/* Cover letter */}
          <div>
            <label className="label">Lettre de motivation <span className="text-gray-400 font-normal">(optionnelle)</span></label>
            <textarea
              value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
              rows={5} maxLength={3000}
              placeholder="Décrivez brièvement pourquoi vous êtes intéressé(e) par ce poste..."
              className="input resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{coverLetter.length}/3000</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" disabled={loading || (!hasCV && !cvFile)} className="btn-primary flex-1 justify-center">
              {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <><Send size={16} /> Envoyer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => {
      setJob(r.data.job);
      setHasApplied(r.data.job.hasApplied || false);
    }).catch(() => navigate('/jobs')).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="card animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    </div>
  );

  if (!job) return null;

  const salary = job.salary?.display && (job.salary?.min || job.salary?.max)
    ? `${job.salary.min ? job.salary.min.toLocaleString() : '?'} — ${job.salary.max ? job.salary.max.toLocaleString() : '?'} DZD`
    : null;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors">
          <ChevronLeft size={16} /> Retour aux offres
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                  {job.company?.logo ? <img src={`/uploads/logos/${job.company.logo}`} alt="" className="w-full h-full object-cover" /> : <Building2 size={28} className="text-gray-400" />}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">{job.title}</h1>
                  <p className="text-gray-600 flex items-center gap-1.5 mb-3">
                    {job.company?.name}
                    {job.company?.isVerified && <BadgeCheck size={16} className="text-blue-500" />}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-blue">{TYPE_LABELS[job.type]}</span>
                    <span className="badge-gray">{LEVEL_LABELS[job.level]}</span>
                    {job.remote !== 'onsite' && <span className="badge-green">{job.remote === 'remote' ? 'Télétravail' : 'Hybride'}</span>}
                  </div>
                </div>
              </div>

              {/* Quick info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                {job.wilaya && <div className="text-center"><MapPin size={18} className="mx-auto text-primary-500 mb-1" /><p className="text-xs font-medium text-gray-700">{job.wilaya}</p><p className="text-xs text-gray-400">Localisation</p></div>}
                {salary && <div className="text-center"><DollarSign size={18} className="mx-auto text-primary-500 mb-1" /><p className="text-xs font-medium text-gray-700">{salary}</p><p className="text-xs text-gray-400">Salaire</p></div>}
                {job.deadline && <div className="text-center"><Calendar size={18} className="mx-auto text-primary-500 mb-1" /><p className="text-xs font-medium text-gray-700">{format(new Date(job.deadline), 'dd MMM yyyy', { locale: fr })}</p><p className="text-xs text-gray-400">Date limite</p></div>}
                <div className="text-center"><Users size={18} className="mx-auto text-primary-500 mb-1" /><p className="text-xs font-medium text-gray-700">{job.applicationsCount || 0}</p><p className="text-xs text-gray-400">Candidatures</p></div>
              </div>
            </div>

            {/* Description */}
            {job.description && (
              <div className="card">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Description du poste</h2>
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="card">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Prérequis</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.requirements}</div>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="card">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-4">Responsabilités</h2>
                <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{job.responsibilities}</div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <div className="card sticky top-24">
              {hasApplied ? (
                <div className="text-center py-4">
                  <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
                  <p className="font-semibold text-gray-800">Candidature envoyée !</p>
                  <p className="text-sm text-gray-500 mt-1">Vous avez déjà postulé à cette offre</p>
                  <Link to="/student/applications" className="btn-secondary w-full justify-center mt-4 text-sm">Voir mes candidatures</Link>
                </div>
              ) : user?.role === 'student' ? (
                <>
                  <button onClick={() => setShowModal(true)} className="btn-primary w-full justify-center py-3">
                    <Send size={16} /> Postuler maintenant
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-3">Candidature rapide avec votre profil TalentDZ</p>
                </>
              ) : !user ? (
                <>
                  <p className="text-sm text-gray-600 text-center mb-4">Connectez-vous pour postuler</p>
                  <Link to="/login" className="btn-primary w-full justify-center py-3">Se connecter</Link>
                  <Link to="/register" className="btn-secondary w-full justify-center mt-2 text-sm">Créer un compte</Link>
                </>
              ) : null}
            </div>

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Compétences requises</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => <span key={s} className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">{s}</span>)}
                </div>
              </div>
            )}

            {/* Job meta */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
              <dl className="space-y-2 text-sm">
                {job.education && <div className="flex justify-between"><dt className="text-gray-500">Formation</dt><dd className="font-medium capitalize">{job.education}</dd></div>}
                {job.experience && <div className="flex justify-between"><dt className="text-gray-500">Expérience</dt><dd className="font-medium">{job.experience === 'sans' ? 'Sans expérience' : `${job.experience} ans`}</dd></div>}
                {job.positions && <div className="flex justify-between"><dt className="text-gray-500">Postes</dt><dd className="font-medium">{job.positions}</dd></div>}
                <div className="flex justify-between"><dt className="text-gray-500">Publiée</dt><dd className="font-medium">{formatDistanceToNow(new Date(job.createdAt), { locale: fr, addSuffix: true })}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Vues</dt><dd className="font-medium">{job.views || 0}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ApplyModal job={job} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); setHasApplied(true); }} />
      )}
    </>
  );
}
