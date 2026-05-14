import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Building2, MapPin, Globe, Phone, Mail, FileText } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WILAYAS = ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane'];
const SECTORS = ['Informatique & Tech','Finance & Banque','Industrie & Manufacture','Commerce & Marketing','Santé & Médecine','Education & Formation','BTP & Immobilier','Agriculture','Transport & Logistique','Energie & Mines','Tourisme & Hôtellerie','Media & Communication','Droit & Justice','Administration publique','Autre'];
const SIZES = [['1-10','1–10 employés'],['11-50','11–50'],['51-200','51–200'],['201-500','201–500'],['501-1000','501–1000'],['1000+','1000+']];

export default function CompanyProfile() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        description: profile.description || '',
        sector: profile.sector || '',
        size: profile.size || '',
        founded: profile.founded || '',
        wilaya: profile.wilaya || '',
        city: profile.city || '',
        address: profile.address || '',
        website: profile.website || '',
        phone: profile.phone || '',
        contactPerson: profile.contactPerson || { name: '', email: '', phone: '' },
        socialLinks: profile.socialLinks || { linkedin: '', facebook: '', twitter: '' },
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contactPerson.')) {
      const key = name.split('.')[1];
      setForm(prev => ({ ...prev, contactPerson: { ...prev.contactPerson, [key]: value } }));
    } else if (name.startsWith('social.')) {
      const key = name.split('.')[1];
      setForm(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/companies/profile', form);
      await refreshProfile();
      toast.success('Profil entreprise mis à jour ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Informations générales' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Réseaux sociaux' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Profil entreprise</h1>
          <p className="text-gray-500 text-sm mt-1">Présentez votre entreprise aux candidats</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={16} />}
          Sauvegarder
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="card space-y-5 animate-fade-in">
          <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={18} className="text-primary-500" /> Informations générales
          </h2>

          <div>
            <label className="label">Nom de l'entreprise *</label>
            <input name="name" value={form.name || ''} onChange={handleChange} className="input" placeholder="Mon Entreprise SARL" />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange}
              rows={5} maxLength={2000} className="input resize-none"
              placeholder="Décrivez votre entreprise, sa mission, ses valeurs..." />
            <p className="text-xs text-gray-400 text-right">{(form.description || '').length}/2000</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Secteur d'activité</label>
              <select name="sector" value={form.sector || ''} onChange={handleChange} className="input">
                <option value="">Sélectionner...</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Taille de l'entreprise</label>
              <select name="size" value={form.size || ''} onChange={handleChange} className="input">
                <option value="">Sélectionner...</option>
                {SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Année de fondation</label>
              <input type="number" name="founded" value={form.founded || ''} onChange={handleChange}
                className="input" placeholder="2010" min="1900" max={new Date().getFullYear()} />
            </div>
            <div>
              <label className="label">Site web</label>
              <input name="website" value={form.website || ''} onChange={handleChange}
                className="input" placeholder="https://monentreprise.dz" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Wilaya</label>
              <select name="wilaya" value={form.wilaya || ''} onChange={handleChange} className="input">
                <option value="">Sélectionner...</option>
                {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ville</label>
              <input name="city" value={form.city || ''} onChange={handleChange} className="input" placeholder="Alger" />
            </div>
            <div>
              <label className="label">Adresse</label>
              <input name="address" value={form.address || ''} onChange={handleChange} className="input" placeholder="123 Rue Didouche Mourad" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="card space-y-5 animate-fade-in">
          <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
            <Phone size={18} className="text-primary-500" /> Personne de contact
          </h2>
          <p className="text-sm text-gray-500">Ces informations sont privées et visibles uniquement par vous et les admins.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nom complet</label>
              <input name="contactPerson.name" value={form.contactPerson?.name || ''} onChange={handleChange}
                className="input" placeholder="Ahmed Benali" />
            </div>
            <div>
              <label className="label">Email de contact</label>
              <input type="email" name="contactPerson.email" value={form.contactPerson?.email || ''} onChange={handleChange}
                className="input" placeholder="rh@entreprise.dz" />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input name="phone" value={form.phone || ''} onChange={handleChange}
                className="input" placeholder="+213 21 XX XX XX" />
            </div>
            <div>
              <label className="label">Téléphone contact RH</label>
              <input name="contactPerson.phone" value={form.contactPerson?.phone || ''} onChange={handleChange}
                className="input" placeholder="+213 5XX XX XX XX" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="card space-y-5 animate-fade-in">
          <h2 className="font-display font-bold text-gray-900 flex items-center gap-2">
            <Globe size={18} className="text-primary-500" /> Réseaux sociaux & Présence en ligne
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">LinkedIn</label>
              <input name="social.linkedin" value={form.socialLinks?.linkedin || ''} onChange={handleChange}
                className="input" placeholder="https://linkedin.com/company/..." />
            </div>
            <div>
              <label className="label">Facebook</label>
              <input name="social.facebook" value={form.socialLinks?.facebook || ''} onChange={handleChange}
                className="input" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="label">Twitter / X</label>
              <input name="social.twitter" value={form.socialLinks?.twitter || ''} onChange={handleChange}
                className="input" placeholder="https://twitter.com/..." />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
