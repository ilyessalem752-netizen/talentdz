/**
 * TalentDZ — Seeder de données de démo
 * Usage: npm run seed
 * Usage (reset): npm run seed -- --reset
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const connectDB = require('../config/database');

const SECTORS = ['Informatique & Tech', 'Finance & Banque', 'Industrie & Manufacture', 'Commerce & Marketing', 'Santé & Médecine', 'BTP & Immobilier', 'Transport & Logistique'];
const WILAYAS = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif', 'Tizi Ouzou'];

async function seed() {
  await connectDB();
  console.log('📦 Connexion à MongoDB établie');

  if (process.argv.includes('--reset')) {
    console.log('🗑  Réinitialisation de la base de données...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ Base vidée');
  }

  // ── ADMIN ───────────────────────────────────────────
  const existingAdmin = await User.findOne({ email: 'admin@talentdz.dz' });
  if (!existingAdmin) {
    await User.create({
      email: 'admin@talentdz.dz',
      password: 'Admin1234!',
      role: 'admin',
      isActive: true,
      isVerified: true,
    });
    console.log('👑 Admin créé: admin@talentdz.dz / Admin1234!');
  }

  // ── ENTREPRISES ──────────────────────────────────────
  const companies = [
    { name: 'Sonatrach Digital', sector: 'Informatique & Tech', wilaya: 'Alger', size: '1000+', description: 'Division numérique du leader énergétique algérien.' },
    { name: 'Djezzy Telecom', sector: 'Informatique & Tech', wilaya: 'Alger', size: '1000+', description: 'Opérateur télécom innovant en Algérie.' },
    { name: 'CPA Banque', sector: 'Finance & Banque', wilaya: 'Alger', size: '1000+', description: 'Crédit Populaire d\'Algérie, banque de référence.' },
    { name: 'SNVI Rouiba', sector: 'Industrie & Manufacture', wilaya: 'Boumerdès', size: '1000+', description: 'Fabricant de véhicules industriels.' },
    { name: 'Cevital Groupe', sector: 'Commerce & Marketing', wilaya: 'Béjaïa', size: '1000+', description: 'Premier groupe agroalimentaire privé d\'Algérie.' },
    { name: 'TechStart Alger', sector: 'Informatique & Tech', wilaya: 'Alger', size: '11-50', description: 'Startup spécialisée en IA et solutions cloud.' },
  ];

  const createdCompanies = [];
  for (let i = 0; i < companies.length; i++) {
    const c = companies[i];
    const email = `rh${i + 1}@${c.name.toLowerCase().replace(/\s+/g, '')}.dz`;
    const existing = await User.findOne({ email });
    if (!existing) {
      const user = await User.create({ email, password: 'Company1234!', role: 'company', isActive: true });
      const company = await Company.create({ user: user._id, ...c, isVerified: i < 4, phone: `+213 21 ${String(i + 1).padStart(2, '0')} 00 00` });
      createdCompanies.push(company);
      console.log(`🏢 Entreprise créée: ${c.name} (${email})`);
    } else {
      const company = await Company.findOne({ user: existing._id });
      if (company) createdCompanies.push(company);
    }
  }

  // ── OFFRES D'EMPLOI ──────────────────────────────────
  const jobTemplates = [
    { title: 'Développeur Full Stack React/Node.js', type: 'cdi', level: 'junior', sector: 'Informatique & Tech', skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Git'], description: 'Nous recherchons un développeur Full Stack passionné pour rejoindre notre équipe tech. Vous travaillerez sur nos applications web modernes en React et Node.js.' },
    { title: 'Ingénieur Data Science / Machine Learning', type: 'cdi', level: 'intermediaire', sector: 'Informatique & Tech', skills: ['Python', 'TensorFlow', 'Pandas', 'SQL', 'Git'], description: 'Rejoignez notre équipe Data pour développer des modèles prédictifs et des solutions d\'IA. Vous analyserez de grandes volumes de données.' },
    { title: 'Stage Développeur Mobile Flutter', type: 'stage', level: 'etudiant', sector: 'Informatique & Tech', skills: ['Flutter', 'Dart', 'Firebase', 'Git'], description: 'Stage de 6 mois pour un(e) étudiant(e) passionné(e) par le développement mobile. Vous participez au développement de notre application mobile.' },
    { title: 'Analyste Financier Junior', type: 'cdi', level: 'junior', sector: 'Finance & Banque', skills: ['Excel', 'Analyse financière', 'Comptabilité', 'PowerBI'], description: 'Rejoignez notre département Finance pour analyser les performances financières et préparer les reportings.' },
    { title: 'Ingénieur Commercial B2B', type: 'cdi', level: 'intermediaire', sector: 'Commerce & Marketing', skills: ['Négociation', 'CRM', 'Prospection', 'Communication'], description: 'Développez notre portefeuille clients dans le secteur industriel. Vous gérez les cycles de vente complets.' },
    { title: 'Technicien Réseau & Sécurité', type: 'cdi', level: 'junior', sector: 'Informatique & Tech', skills: ['Cisco', 'Linux', 'Cybersécurité', 'TCP/IP'], description: 'Gérez et sécurisez notre infrastructure réseau. Vous intervenez sur les incidents et participez aux projets de migration.' },
    { title: 'Chef de Projet Digital', type: 'cdi', level: 'senior', sector: 'Informatique & Tech', skills: ['Agile', 'Scrum', 'Jira', 'Management', 'Product Management'], description: 'Pilotez les projets de transformation digitale de l\'entreprise. Vous coordonnez les équipes techniques et métier.' },
    { title: 'Alternance Marketing Digital', type: 'alternance', level: 'etudiant', sector: 'Commerce & Marketing', skills: ['SEO', 'Social Media', 'Google Ads', 'Canva', 'Analytics'], description: 'Alternance pour développer notre présence digitale. Vous gérez les réseaux sociaux, les campagnes publicitaires et le contenu.' },
{
  title: 'Stage Développeur Python',
  type: 'stage',
  level: 'etudiant',
  sector: 'Informatique & Tech',
  skills: ['Python', 'Django'] , description: 'Stage Python avec Django'
},

{
  title: 'Développeur JavaScript',
  type: 'cdi',
  level: 'junior',
  sector: 'Informatique & Tech',
  skills: ['JavaScript', 'Vue.js'], description: 'Développement applications JavaScript'
}


  ];

  let jobCount = 0;
  for (let i = 0; i < jobTemplates.length; i++) {
    const tpl = jobTemplates[i];
    const company = createdCompanies[i % createdCompanies.length];
    if (!company) continue;
    const companyUser = await User.findById(company.user);
    const existing = await Job.findOne({ title: tpl.title, company: company._id });
    if (!existing && companyUser) {
      await Job.create({
        ...tpl,
        company: company._id,
        postedBy: companyUser._id,
        wilaya: company.wilaya || WILAYAS[i % WILAYAS.length],
        status: 'active',
        remote: i % 3 === 0 ? 'hybrid' : 'onsite',
        positions: Math.floor(Math.random() * 3) + 1,
        salary: { min: 50000 + i * 10000, max: 80000 + i * 15000, display: true },
        requirements: `• Diplôme Bac+${tpl.level === 'etudiant' ? '3 en cours' : '4/5'}\n• Maîtrise de ${tpl.skills.slice(0, 2).join(' et ')}\n• Bonne capacité d'adaptation`,
      });
      jobCount++;
    }
  }
  if (jobCount > 0) console.log(`💼 ${jobCount} offres d'emploi créées`);

  // ── ÉTUDIANTS ────────────────────────────────────────
  const studentsData = [
    { firstName: 'Amira', lastName: 'Bensalem', university: 'USTHB', fieldOfStudy: 'Informatique', degree: 'master', skills: ['Python', 'React', 'Machine Learning', 'SQL'], wilaya: 'Alger' },
    { firstName: 'Yacine', lastName: 'Ferhat', university: 'Université d\'Oran', fieldOfStudy: 'Finance', degree: 'licence', skills: ['Excel', 'Comptabilité', 'Analyse financière'], wilaya: 'Oran' },
    { firstName: 'Lina', lastName: 'Mansouri', university: 'Université de Constantine', fieldOfStudy: 'Commerce', degree: 'master', skills: ['Marketing', 'Négociation', 'Communication', 'CRM'], wilaya: 'Constantine' },
  ];

  for (let i = 0; i < studentsData.length; i++) {
    const s = studentsData[i];
    const email = `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@email.dz`;
    const existing = await User.findOne({ email });
    if (!existing) {
      const user = await User.create({ email, password: 'Student1234!', role: 'student', isActive: true });
      const student = await Student.create({
        user: user._id, ...s,
        bio: `Étudiant(e) en ${s.fieldOfStudy} passionné(e) par le domaine.`,
        availability: 'immediate',
        graduationYear: 2025,
      });
      student.calculateCompleteness();
      await student.save();
      console.log(`👤 Étudiant créé: ${email} / Student1234!`);
    }
  }

  console.log('\n✅ Seeding terminé avec succès !');
  console.log('\n📋 Comptes de démonstration :');
  console.log('   Admin:    admin@talentdz.dz      / Admin1234!');
  console.log('   Étudiant: amira.bensalem@email.dz / Student1234!');
  console.log('   Entreprise: rh1@sonatrachdigital.dz / Company1234!\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erreur seeder:', err);
  process.exit(1);
});
