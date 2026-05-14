import { Link } from 'react-router-dom';
import { Search, Briefcase, GraduationCap, Building2, ArrowRight, Star, MapPin, Clock, TrendingUp, Shield, Zap, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from '../../components/chatbot';
const STATS = [
  { label: 'Offres actives', value: '2 400+', icon: Briefcase, color: 'text-blue-600 bg-blue-100' },
  { label: 'Étudiants inscrits', value: '18 000+', icon: GraduationCap, color: 'text-green-600 bg-green-100' },
  { label: 'Entreprises partenaires', value: '650+', icon: Building2, color: 'text-purple-600 bg-purple-100' },
  { label: 'Recrutements réussis', value: '4 200+', icon: Star, color: 'text-amber-600 bg-amber-100' },
];

const JOB_TYPES = [
  { label: 'Stage', value: 'stage', emoji: '🎓' },
  { label: 'CDI', value: 'cdi', emoji: '💼' },
  { label: 'CDD', value: 'cdd', emoji: '📋' },
  { label: 'Alternance', value: 'alternance', emoji: '🔄' },
  { label: 'Télétravail', value: 'remote', emoji: '🏠' },
  { label: 'Freelance', value: 'freelance', emoji: '🚀' },
];

const FEATURED_SECTORS = ['Informatique & Tech', 'Finance & Banque', 'Industrie', 'Commerce', 'Santé', 'BTP', 'Agriculture', 'Transport'];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 py-20 md:py-28">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-5" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-white/80 text-sm font-medium mb-6 border border-white/20">
            <TrendingUp size={14} className="text-accent-400" />
            <span>#1 Plateforme de recrutement étudiant en Algérie</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Trouvez votre <span className="text-accent-400">emploi de rêve</span><br className="hidden md:block" /> en Algérie
          </h1>

          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Connectez-vous avec les meilleures entreprises algériennes. Postulez en quelques clics, décrochez votre premier emploi.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden p-1.5 gap-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Titre du poste, compétences, entreprise..."
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400 text-sm py-2"
                />
              </div>
              <button type="submit" className="btn-primary py-2.5 px-6 text-sm rounded-xl">
                Rechercher <ArrowRight size={16} />
              </button>
            </div>
          </form>

          {/* Quick type filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {JOB_TYPES.map(type => (
              <button key={type.value} onClick={() => navigate(`/jobs?type=${type.value}`)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/20 transition-all hover:scale-105">
                <span>{type.emoji}</span> {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card flex items-center gap-4 shadow-md">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by sector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Explorer par secteur</h2>
        <div className="flex flex-wrap gap-3">
          {FEATURED_SECTORS.map(sector => (
            <button key={sector} onClick={() => navigate(`/jobs?sector=${encodeURIComponent(sector)}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-primary-300 hover:text-primary-500 hover:shadow-sm transition-all">
              <Briefcase size={14} /> {sector}
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">Comment ça marche ?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">En 3 étapes simples, décrochez votre emploi ou recrutez les meilleurs talents</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Créez votre profil', desc: 'Inscrivez-vous gratuitement et complétez votre profil étudiant avec votre CV, compétences et formations.', icon: User, color: 'bg-blue-500' },
            { step: '02', title: 'Explorez les offres', desc: 'Parcourez des milliers d\'offres d\'emploi et de stage dans toutes les wilayas d\'Algérie.', icon: Search, color: 'bg-purple-500' },
            { step: '03', title: 'Postulez facilement', desc: 'Envoyez votre candidature en un clic et suivez l\'avancement de vos dossiers en temps réel.', icon: ArrowRight, color: 'bg-green-500' },
          ].map(({ step, title, desc, icon: Icon, color }) => (
            <div key={step} className="card relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 text-6xl font-display font-bold text-gray-50">{step}</div>
              <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-display font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
          <h2 className="relative text-3xl font-display font-bold text-white mb-3">Prêt à commencer ?</h2>
          <p className="relative text-white/70 mb-8 max-w-md mx-auto">Rejoignez des milliers d'étudiants qui ont déjà trouvé leur emploi grâce à TalentDZ</p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-accent justify-center py-3 px-8 text-sm font-bold">
              Créer un compte étudiant
            </Link>
            <Link to="/jobs" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl border border-white/30 transition-all flex items-center justify-center gap-2 text-sm">
              Voir les offres
            </Link>
          </div>
        </div>
      </section>
      <ChatBot />
    </div>
  );
}
