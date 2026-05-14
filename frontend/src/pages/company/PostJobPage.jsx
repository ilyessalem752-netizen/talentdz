import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Save, Briefcase } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WILAYAS = ['Alger','Oran','Constantine','Annaba','Blida','Batna','Sétif','Tlemcen','Béjaïa','Tizi Ouzou','Sidi Bel Abbès','Biskra','Médéa','Skikda','Boumerdès','Tipaza','Autre'];
const SECTORS = ['Informatique & Tech','Finance & Banque','Industrie & Manufacture','Commerce & Marketing','Santé & Médecine','Education & Formation','BTP & Immobilier','Agriculture','Transport & Logistique','Energie & Mines','Tourisme & Hôtellerie','Media & Communication','Droit & Justice','Administration publique','Autre'];

export default function PostJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', responsibilities: '',
    type: 'cdi', level: 'junior', sector: '', wilaya: '', city: '',
    remote: 'onsite', skills: [], education: '', experience: 'sans',
    positions: 1, deadline: '',
    salary: { min: '', max: '', negotiable: false, display: true },
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type: t, checked } = e.target;
    if (name.startsWith('salary.')) {
      const key = name.split('.')[1];
      setForm(prev => ({ ...prev, salary: { ...prev.salary, [key]: t === 'checkbox' ? checked : value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: t === 'checkbox' ? checked : value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const validate = () => {
    const err = {};
    if (!form.title.trim()) err.title = 'Titre requis';
    if (!form.description || form.description.length < 50) err.description = 'Description trop courte (min 50 caractères)';
    if (!form.type) err.type = 'Type de contrat requis';
    if (!form.level) err.level = 'Niveau requis';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.deadline) delete payload.deadline;
      if (!payload.salary.min && !payload.salary.max) delete payload.salary;
      await api.post('/jobs', payload);
      toast.success('Offre publiée avec succès ! 🎉');
      navigate('/company/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Publier une offre</h1>
          <p className="text-gray-500 text-sm mt-1">Décrivez le poste pour attirer les meilleurs candidats</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-gray-900 flex items-center gap-2"><Briefcase size={18} className="text-primary-500" /> Informations de base</h2>
          <div>
            <label className="label">Titre du poste *</label>
            <input name="title" value={form.title} onChange={handleChange} className={`input ${errors.title ? 'border-red-400' : ''}`} placeholder="Développeur Full Stack, Ingénieur Logiciel..." />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Type de contrat *</label>
              <select name="type" value={form.type} onChange={handleChange} className="input">
                <option value="cdi">CDI</option><option value="cdd">CDD</option><option value="stage">Stage</option>
                <option value="alternance">Alternance</option><option value="freelance">Freelance</option><option value="temps_partiel">Temps partiel</option>
              </select>
            </div>
            <div>
              <label className="label">Niveau *</label>
              <select name="level" value={form.level} onChange={handleChange} className="input">
                <option value="etudiant">Étudiant</option><option value="junior">Junior</option><option value="intermediaire">Intermédiaire</option>
                <option value="senior">Senior</option><option value="manager">Manager</option><option value="directeur">Directeur</option>
              </select>
            </div>
            <div>
              <label className="label">Mode de travail</label>
              <select name="remote" value={form.remote} onChange={handleChange} className="input">
                <option value="onsite">Présentiel</option><option value="remote">Télétravail</option><option value="hybrid">Hybride</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Secteur</label>
              <select name="sector" value={form.sector} onChange={handleChange} className="input">
                <option value="">Sélectionner...</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Wilaya</label>
              <select name="wilaya" value={form.wilaya} onChange={handleChange} className="input">
                <option value="">Toute l'Algérie</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Nombre de postes</label>
              <input type="number" name="positions" value={form.positions} onChange={handleChange} className="input" min="1" max="99" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-gray-900">Description du poste</h2>
          <div>
            <label className="label">Description générale * <span className="text-gray-400 font-normal">(min 50 caractères)</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={6} className={`input resize-none ${errors.description ? 'border-red-400' : ''}`} placeholder="Décrivez le poste, la mission, le contexte de l'entreprise..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            <p className="text-xs text-gray-400 text-right">{form.description.length} caractères</p>
          </div>
          <div>
            <label className="label">Responsabilités <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={4} className="input resize-none" placeholder="• Développer les fonctionnalités&#10;• Participer aux code reviews..." />
          </div>
          <div>
            <label className="label">Prérequis <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={4} className="input resize-none" placeholder="• Licence en Informatique minimum&#10;• 2 ans d'expérience en React..." />
          </div>
        </div>

        {/* Skills & requirements */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-gray-900">Compétences & Prérequis</h2>
          <div>
            <label className="label">Compétences requises</label>
            <div className="flex gap-2 mb-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input flex-1" placeholder="React, Python, Excel..." />
              <button type="button" onClick={addSkill} className="btn-primary py-2.5 px-4"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.skills.map(s => (
                <span key={s} className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm border border-primary-100">
                  {s}<button type="button" onClick={() => setForm(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }))}><X size={12} /></button>
                </span>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Formation minimale</label>
              <select name="education" value={form.education} onChange={handleChange} className="input">
                <option value="">Indifférent</option>
                <option value="bac">Baccalauréat</option><option value="bts">BTS</option><option value="licence">Licence</option>
                <option value="master">Master</option><option value="ingenieur">Ingénieur</option><option value="doctorat">Doctorat</option>
              </select>
            </div>
            <div>
              <label className="label">Expérience requise</label>
              <select name="experience" value={form.experience} onChange={handleChange} className="input">
                <option value="sans">Sans expérience</option><option value="1-2">1–2 ans</option>
                <option value="2-5">2–5 ans</option><option value="5-10">5–10 ans</option><option value="10+">10+ ans</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary & deadline */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-gray-900">Salaire & Délai</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Salaire min (DZD)</label>
              <input type="number" name="salary.min" value={form.salary.min} onChange={handleChange} className="input" placeholder="50000" />
            </div>
            <div>
              <label className="label">Salaire max (DZD)</label>
              <input type="number" name="salary.max" value={form.salary.max} onChange={handleChange} className="input" placeholder="100000" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="neg" name="salary.negotiable" checked={form.salary.negotiable} onChange={handleChange} className="w-4 h-4 accent-primary-500" />
            <label htmlFor="neg" className="text-sm text-gray-600">Salaire négociable</label>
            <input type="checkbox" id="disp" name="salary.display" checked={form.salary.display} onChange={handleChange} className="w-4 h-4 accent-primary-500 ml-4" />
            <label htmlFor="disp" className="text-sm text-gray-600">Afficher le salaire</label>
          </div>
          <div>
            <label className="label">Date limite de candidature</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input" min={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/company/dashboard')} className="btn-secondary flex-1 justify-center py-3">Annuler</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={16} />}
            Publier l'offre
          </button>
        </div>
      </form>
    </div>
  );
}
