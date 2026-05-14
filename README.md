# 🚀 TalentDZ — Guide de lancement complet

Stack: **React 18 + Tailwind + Vite** (frontend) · **Node.js + Express** (backend) · **MongoDB** (BDD) · **JWT** (auth)

---

## Prérequis

| Outil | Version | Vérification |
|-------|---------|--------------|
| Node.js | ≥ 18 | `node -v` |
| npm | ≥ 9 | `npm -v` |
| MongoDB | ≥ 6 (local) ou Atlas | `mongod --version` |

---

## Lancement en 3 étapes

### 1. Configurer le backend

```bash
cd backend
cp .env.example .env        # copier les variables d'env
npm install                  # installer les dépendances
```

Éditez `.env` — vérifiez au minimum :
```env
MONGODB_URI=mongodb://localhost:27017/talentdz
JWT_SECRET=changez_ce_secret_en_prod
JWT_REFRESH_SECRET=changez_ce_secret_aussi
CLIENT_URL=http://localhost:5173
```

```bash
# Démarrer MongoDB (si local)
mongod                        # Linux/Mac
# mongod --dbpath C:\data\db  # Windows

# Dans un autre terminal — injecter les données de démo
npm run seed

# Lancer le serveur backend
npm run dev
```
✅ Backend sur **http://localhost:5000**

---

### 2. Configurer le frontend

```bash
cd ../frontend
cp .env.example .env         # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```
✅ Frontend sur **http://localhost:5173**

---

### 3. Ouvrir le navigateur

Allez sur **http://localhost:5173**

**Comptes de démo créés par le seeder :**

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| 👑 Admin | admin@talentdz.dz | Admin1234! |
| 👤 Étudiant | amira.bensalem@email.dz | Student1234! |
| 🏢 Entreprise | rh1@sonatrachdigital.dz | Company1234! |

---

## Option Docker (tout-en-un)

```bash
cd /chemin/vers/talentdz
cp backend/.env.example backend/.env

docker-compose up --build
# puis dans un autre terminal :
docker-compose exec backend npm run seed
```

---

## Structure du projet

```
talentdz/
├── backend/src/
│   ├── models/          User, Student, Company, Job, Application, Notification
│   ├── controllers/     auth, job, application, student, company, notification, admin
│   ├── routes/          7 fichiers de routes avec protection par rôle
│   ├── middleware/       auth.js, errorHandler.js, validate.js
│   └── utils/           jwt.js, logger.js, seeder.js
│
└── frontend/src/
    ├── pages/auth/       Login, Register
    ├── pages/public/     Home, Jobs, JobDetail
    ├── pages/student/    Dashboard, Profile, Applications
    ├── pages/company/    Dashboard, Profile, PostJob, Applications
    └── pages/admin/      Dashboard, Users, Jobs
```

---

## Routes API résumées

```
POST  /api/auth/register/student|company   Inscription
POST  /api/auth/login                      Connexion (→ JWT + cookie)
POST  /api/auth/refresh                    Renouveler le token
GET   /api/auth/me                         Profil courant

GET   /api/jobs                            Liste filtrable
POST  /api/jobs                            Créer (company)
GET/PUT/DELETE /api/jobs/:id               CRUD

POST  /api/applications/:jobId             Postuler (student, multipart)
GET   /api/applications/mine               Mes candidatures (student)
GET   /api/applications/job/:jobId         Candidatures reçues (company)
PUT   /api/applications/:id/status         Mettre à jour le statut (company)
PUT   /api/applications/:id/withdraw       Retirer (student)

GET/PUT /api/students/profile              Profil étudiant
POST    /api/students/cv                   Upload CV PDF

GET/PUT /api/companies/profile             Profil entreprise

GET     /api/notifications                 Notifications
PUT     /api/notifications/read-all        Tout marquer lu

GET     /api/admin/dashboard               Stats globales (admin)
GET     /api/admin/users                   Liste utilisateurs (admin)
PUT     /api/admin/users/:id/status        Activer/Désactiver (admin)
```

---

## Problèmes fréquents

**MongoDB ne démarre pas**
```bash
sudo mkdir -p /data/db && sudo chown $USER /data/db && mongod
```

**Erreur CORS** → vérifiez que `CLIENT_URL` dans `.env` correspond exactement à l'URL du frontend.

**Port 5000 occupé**
```bash
kill -9 $(lsof -t -i:5000)
```

**Uploads ne fonctionnent pas** → créez les dossiers manuellement :
```bash
mkdir -p backend/uploads/cvs backend/uploads/logos backend/uploads/avatars
```

**Réinitialiser la BDD**
```bash
cd backend && npm run seed -- --reset
```
