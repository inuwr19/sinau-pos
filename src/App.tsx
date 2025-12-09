// src/App.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import BranchForm from './pages/admin/BranchForm';
import BranchList from './pages/admin/BranchList';
import CategoryForm from './pages/admin/CategoryForm';
import CategoryList from './pages/admin/CategoryList';
import MenuItemForm from './pages/admin/MenuItemForm';
import MenuItemsList from './pages/admin/MenuItemsList';
import UserForm from './pages/admin/UserForm';
import UserList from './pages/admin/UserList';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App(): JSX.Element {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected area */}
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
        {/* nested admin routes (rendered into <Outlet /> of AdminLayout) */}
        <Route index element={<AdminDashboard />} />

        {/* Branches */}
        <Route path="branches" element={<BranchList />} />
        <Route path="branches/new" element={<BranchForm />} />
        <Route path="branches/:id/edit" element={<BranchForm />} />

        {/* Categories – INI YANG KURANG */}
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

        {/* Nanti bisa tambah members, users di sini */}
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
