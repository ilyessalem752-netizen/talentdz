import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Upload, Save, FileText, CheckCircle, Trash2, Plus, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WILAYAS = ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane'];
const DEGREES = [['licence','Licence'],['master','Master'],['doctorat','Doctorat'],['ingenieur','Ingénieur'],['bts','BTS'],['technicien','Technicien'],['autre','Autre']];

export default function StudentProfile() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        wilaya: profile.wilaya || '',
        city: profile.city || '',
        bio: profile.bio || '',
        university: profile.university || '',
        faculty: profile.faculty || '',
        fieldOfStudy: profile.fieldOfStudy || '',
        degree: profile.degree || '',
        graduationYear: profile.graduationYear || '',
        skills: profile.skills || [],
        availability: profile.availability || '',
        linkedIn: profile.linkedIn || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const addSkill = () => {
    if (skillInput.trim() && !form.skills?.includes(skillInput.trim())) {
      setForm(prev => ({ ...prev, skills: [...(prev.skills || []), skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/students/profile', form);
      await refreshProfile();
      toast.success('Profil mis à jour ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCVUpload = async () => {
    if (!cvFile) return;
    setUploadingCV(true);
    try {
      const fd = new FormData();
      fd.append('cv', cvFile);
      await api.post('/students/cv', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      await refreshProfile();
      setCvFile(null);
      toast.success('CV uploadé avec succès ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur upload CV');
    } finally {
      setUploadingCV(false);
    }
  };

  const completeness = profile?.profileCompleteness || 0;
  const tabs = [
    { id: 'personal', label: 'Infos personnelles' },
    { id: 'academic', label: 'Formation' },
    { id: 'skills', label: 'Compétences' },
    { id: 'cv', label: 'CV & Documents' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-500 text-sm mt-1">Complétez votre profil pour augmenter vos chances</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={16} />}
          Sauvegarder
        </button>
      </div>

      {/* Completeness bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Complétude du profil</span>
          <span className={`text-sm font-bold ${completeness >= 80 ? 'text-green-600' : completeness >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{completeness}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-amber-500' : 'bg-red-400'}`} style={{ width: `${completeness}%` }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'personal' && (
        <div className="card space-y-4 animate-fade-in">
          <h2 className="font-display font-bold text-gray-900">Informations personnelles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Prénom *</label><input name="firstName" value={form.firstName || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Nom *</label><input name="lastName" value={form.lastName || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Téléphone</label><input name="phone" value={form.phone || ''} onChange={handleChange} className="input" placeholder="+213 5XX XX XX XX" /></div>
            <div><label className="label">Wilaya</label>
              <select name="wilaya" value={form.wilaya || ''} onChange={handleChange} className="input">
                <option value="">Sélectionner...</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div><label className="label">Ville</label><input name="city" value={form.city || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Disponibilité</label>
              <select name="availability" value={form.availability || ''} onChange={handleChange} className="input">
                <option value="">Sélectionner...</option>
                <option value="immediate">Immédiate</option>
                <option value="1_mois">Dans 1 mois</option>
                <option value="3_mois">Dans 3 mois</option>
                <option value="non_disponible">Non disponible</option>
              </select>
            </div>
          </div>
          <div><label className="label">Biographie</label>
            <textarea name="bio" value={form.bio || ''} onChange={handleChange} rows={4} maxLength={1000} className="input resize-none" placeholder="Parlez de vous en quelques lignes..." />
            <p className="text-xs text-gray-400 text-right">{form.bio?.length || 0}/1000</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="label">LinkedIn</label><input name="linkedIn" value={form.linkedIn || ''} onChange={handleChange} className="input" placeholder="https://linkedin.com/in/..." /></div>
            <div><label className="label">GitHub</label><input name="github" value={form.github || ''} onChange={handleChange} className="input" placeholder="https://github.com/..." /></div>
            <div><label className="label">Portfolio</label><input name="portfolio" value={form.portfolio || ''} onChange={handleChange} className="input" placeholder="https://..." /></div>
          </div>
        </div>
      )}

      {activeTab === 'academic' && (
        <div className="card space-y-4 animate-fade-in">
          <h2 className="font-display font-bold text-gray-900">Formation académique</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Université</label><input name="university" value={form.university || ''} onChange={handleChange} className="input" placeholder="Université d'Alger..." /></div>
            <div><label className="label">Faculté / Institut</label><input name="faculty" value={form.faculty || ''} onChange={handleChange} className="input" /></div>
            <div><label className="label">Filière</label><input name="fieldOfStudy" value={form.fieldOfStudy || ''} onChange={handleChange} className="input" placeholder="Informatique, Finance..." /></div>
            <div><label className="label">Diplôme</label>
              <select name="degree" value={form.degree || ''} onChange={handleChange} className="input">
                <option value="">Sélectionner...</option>
                {DEGREES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label className="label">Année d'obtention</label><input type="number" name="graduationYear" value={form.graduationYear || ''} onChange={handleChange} className="input" placeholder="2025" min="2000" max="2035" /></div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div className="card space-y-4 animate-fade-in">
          <h2 className="font-display font-bold text-gray-900">Compétences</h2>
          <div>
            <label className="label">Ajouter une compétence</label>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="input flex-1" placeholder="Python, React, Marketing..." />
              <button onClick={addSkill} type="button" className="btn-primary py-2.5 px-4">
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.skills?.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-medium border border-primary-100">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors"><X size={13} /></button>
              </span>
            ))}
            {form.skills?.length === 0 && <p className="text-sm text-gray-400">Aucune compétence ajoutée</p>}
          </div>
        </div>
      )}

      {activeTab === 'cv' && (
        <div className="card animate-fade-in">
          <h2 className="font-display font-bold text-gray-900 mb-4">CV & Documents</h2>

          {/* Current CV */}
          {profile?.cv?.filename && (
            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-green-800 text-sm">CV actuel</p>
                <p className="text-xs text-green-600 truncate">{profile.cv.originalName}</p>
                <p className="text-xs text-gray-400">{profile.cv.size ? `${(profile.cv.size / 1024).toFixed(0)} KB` : ''}</p>
              </div>
              <a href={`/uploads/cvs/${profile.cv.filename}`} target="_blank" rel="noreferrer"
                className="text-xs text-primary-500 font-semibold hover:underline">Voir</a>
            </div>
          )}

          {/* Upload new CV */}
          <div>
            <label className="label">Uploader un nouveau CV (PDF, max 5MB)</label>
            <label className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${cvFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50'}`}>
              {cvFile ? (
                <>
                  <CheckCircle size={32} className="text-green-500" />
                  <p className="font-medium text-green-700">{cvFile.name}</p>
                  <p className="text-xs text-gray-500">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-gray-400" />
                  <p className="font-medium text-gray-600">Glissez ou cliquez pour sélectionner votre CV</p>
                  <p className="text-xs text-gray-400">Format PDF uniquement</p>
                </>
              )}
              <input type="file" accept=".pdf" className="hidden" onChange={e => setCvFile(e.target.files[0])} />
            </label>
            {cvFile && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => setCvFile(null)} className="btn-secondary flex-1 justify-center text-sm">
                  <X size={15} /> Annuler
                </button>
                <button onClick={handleCVUpload} disabled={uploadingCV} className="btn-primary flex-1 justify-center text-sm">
                  {uploadingCV ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Upload size={15} />}
                  Uploader
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
