// src/App.tsx
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Lazy-load halaman/komponen besar agar bundle awal kecil
const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const BranchForm = lazy(() => import('./pages/admin/BranchForm'));
const BranchList = lazy(() => import('./pages/admin/BranchList'));
const CategoryForm = lazy(() => import('./pages/admin/CategoryForm'));
const CategoryList = lazy(() => import('./pages/admin/CategoryList'));
const MenuItemForm = lazy(() => import('./pages/admin/MenuItemForm'));
const MenuItemsList = lazy(() => import('./pages/admin/MenuItemsList'));
const UserForm = lazy(() => import('./pages/admin/UserForm'));
const UserList = lazy(() => import('./pages/admin/UserList'));
const MemberList = lazy(() => import('./pages/admin/MemberList'));
const MemberForm = lazy(() => import('./pages/admin/MemberForm'));

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

// Fallback sederhana ketika lazy-loaded chunks sedang diambil
function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-600">Memuat halaman...</div>
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected area (kasir / POS) */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        {/* Admin area */}
        <Route
          path="/admin/*"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />

          {/* Branches */}
          <Route path="branches" element={<BranchList />} />
          <Route path="branches/new" element={<BranchForm />} />
          <Route path="branches/:id/edit" element={<BranchForm />} />

          {/* Categories */}
          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id/edit" element={<CategoryForm />} />

          {/* Menu items */}
          <Route path="menu-items" element={<MenuItemsList />} />
          <Route path="menu-items/new" element={<MenuItemForm />} />
          <Route path="menu-items/:id/edit" element={<MenuItemForm />} />

          {/* Users */}
          <Route path="users" element={<UserList />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/:id/edit" element={<UserForm />} />

          {/* Members */}
          <Route path="members" element={<MemberList />} />
          <Route path="members/new" element={<MemberForm />} />
          <Route path="members/:id/edit" element={<MemberForm />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
