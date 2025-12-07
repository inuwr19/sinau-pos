// src/App.tsx
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';

function App(): JSX.Element {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Jika user null -> tampilkan login. Jika ada user -> dashboard.
  return user ? <Dashboard /> : <Login />;
}

export default App;
