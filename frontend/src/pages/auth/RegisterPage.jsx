import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Mail, Lock, Eye, EyeOff, User, Building2, GraduationCap, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { registerStudent, registerCompany } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', name: '', wilaya: '', sector: '' });
  const [errors, setErrors] = useState({});

  const WILAYAS = ['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El M\'Ghair','El Meniaa'];
  const SECTORS = ['Informatique & Tech','Finance & Banque','Industrie & Manufacture','Commerce & Marketing','Santé & Médecine','Education & Formation','BTP & Immobilier','Agriculture','Transport & Logistique','Energie & Mines','Tourisme & Hôtellerie','Media & Communication','Droit & Justice','Administration publique','Autre'];

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) err.email = 'Email valide requis';
    if (!form.password || form.password.length < 8) err.password = 'Minimum 8 caractères';
    if (role === 'student') {
      if (!form.firstName?.trim()) err.firstName = 'Prénom requis';
      if (!form.lastName?.trim()) err.lastName = 'Nom requis';
    } else {
      if (!form.name?.trim()) err.name = 'Nom d\'entreprise requis';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (role === 'student') {
        await registerStudent({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName });
        navigate('/student/dashboard');
      } else {
        await registerCompany({ email: form.email, password: form.password, name: form.name, wilaya: form.wilaya, sector: form.sector });
        navigate('/company/dashboard');
      }
      toast.success('Compte créé avec succès ! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center p-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-primary-500">TalentDZ</span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Créer un compte</h1>
            <p className="text-sm text-gray-500">Rejoignez la communauté TalentDZ</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-3 mb-6 p-1 bg-gray-100 rounded-2xl">
            {[
              { value: 'student', label: 'Étudiant', icon: GraduationCap },
              { value: 'company', label: 'Entreprise', icon: Building2 },
            ].map(({ value, label, icon: Icon }) => (
              <button key={value} type="button" onClick={() => setRole(value)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${role === value ? 'bg-white shadow text-primary-500' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'student' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Prénom</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                    className={`input ${errors.firstName ? 'border-red-400' : ''}`} placeholder="Mohamed" />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                    className={`input ${errors.lastName ? 'border-red-400' : ''}`} placeholder="Benali" />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="label">Nom de l'entreprise</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" name="name" value={form.name} onChange={handleChange}
                      className={`input pl-10 ${errors.name ? 'border-red-400' : ''}`} placeholder="Mon Entreprise SARL" />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Wilaya</label>
                    <select name="wilaya" value={form.wilaya} onChange={handleChange} className="input">
                      <option value="">Wilaya...</option>
                      {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Secteur</label>
                    <select name="sector" value={form.sector} onChange={handleChange} className="input">
                      <option value="">Secteur...</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="label">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'border-red-400' : ''}`} placeholder="votre@email.com" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`} placeholder="Min. 8 caractères" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {form.password.length >= 8 && (
                <p className="text-green-500 text-xs mt-1 flex items-center gap-1"><Check size={12} /> Mot de passe valide</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Création...</span>
              ) : (
                <span className="flex items-center gap-2">Créer mon compte <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
