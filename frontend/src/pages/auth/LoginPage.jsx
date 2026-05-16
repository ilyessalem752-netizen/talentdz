import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.email) err.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Email invalide';
    if (!form.password) err.password = 'Mot de passe requis';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
  const user = await login(form.email, form.password);

  toast.success('Connexion réussie !');

 navigate('/admin/dashboard');

} catch (err) {
  toast.error(err.response?.data?.message || 'Erreur de connexion');

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <Briefcase size={20} className="text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-primary-500">TalentDZ</span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Bon retour !</h1>
            <p className="text-sm text-gray-500">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="votre@email.com" autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Connexion...</span>
              ) : (
                <span className="flex items-center gap-2">Se connecter <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 text-center">
              <strong>Demo admin:</strong> admin@talentdz.dz / Admin1234!
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-500 font-semibold hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
