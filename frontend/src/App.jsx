import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public pages
import HomePage from './pages/public/HomePage';
import JobsPage from './pages/public/JobsPage';
import JobDetailPage from './pages/public/JobDetailPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentApplications from './pages/student/StudentApplications';

// Company pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyProfile from './pages/company/CompanyProfile';
import PostJobPage from './pages/company/PostJobPage';
import CompanyApplications from './pages/company/CompanyApplications';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';

// Layout
import MainLayout from './components/layout/MainLayout';

// ─── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
    </div>
  );
}

// ─── ProtectedLayout ────────────────────────────────────────────────────────
// This component is used as the `element` of a parent <Route>.
// React Router injects <Outlet> into whatever `element` renders — so
// ProtectedLayout must itself return <MainLayout />, which contains <Outlet />.
// The old pattern  element={<SomeWrapper><MainLayout /></SomeWrapper>}  was
// broken because React Router injected the Outlet into SomeWrapper, not into
// MainLayout — so child routes never appeared.
function ProtectedLayout({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" replace />;

  // Normalise: role might be on user.role or nested differently depending on
  // what the login endpoint returns — be explicit.
  const role = user?.role ?? user?.user?.role;
  if (roles && !roles.includes(role)) {
    // Wrong role — send to their own dashboard instead of a dead end
    if (role === 'admin')   return <Navigate to="/admin/dashboard"   replace />;
    if (role === 'company') return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  // MainLayout renders <Outlet /> inside it — child routes render there.
  return <MainLayout />;
}

// ─── GuestRoute ─────────────────────────────────────────────────────────────
function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (user) {
    const role = user?.role ?? user?.user?.role;
    if (role === 'admin')   return <Navigate to="/admin/dashboard"   replace />;
    if (role === 'company') return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
          }}
        />
        <Routes>
          {/* ── Public (no auth required) ── */}
          <Route element={<MainLayout />}>
            <Route path="/"         element={<HomePage />} />
            <Route path="/jobs"     element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
          </Route>

          {/* ── Auth ── */}
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* ── Student ── */}
          <Route path="/student" element={<ProtectedLayout roles={['student']} />}>
            <Route path="dashboard"    element={<StudentDashboard />} />
            <Route path="profile"      element={<StudentProfile />} />
            <Route path="applications" element={<StudentApplications />} />
          </Route>

          {/* ── Company ── */}
          <Route path="/company" element={<ProtectedLayout roles={['company']} />}>
            <Route path="dashboard"            element={<CompanyDashboard />} />
            <Route path="profile"              element={<CompanyProfile />} />
            <Route path="jobs/new"             element={<PostJobPage />} />
            <Route path="applications/:jobId"  element={<CompanyApplications />} />
          </Route>

          {/* ── Admin ── */}
          <Route path="/admin" element={<ProtectedLayout roles={['admin']} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users"     element={<AdminUsers />} />
            <Route path="jobs"      element={<AdminJobs />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
