import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import Dashboard from './pages/Dashboard';
import Farms from './pages/Farms';
import FarmDetail from './pages/FarmDetail';
import Zones from './pages/Zones';
import ZoneDetail from './pages/ZoneDetail';
import CropRecipes from './pages/CropRecipes';
import RecipeDetail from './pages/RecipeDetail';
import Devices from './pages/Devices';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Google Auth Success (no layout) */}
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/farms" element={<Farms />} />
        <Route path="/farms/:id" element={<FarmDetail />} />
        <Route path="/zones" element={<Zones />} />
        <Route path="/zones/:id" element={<ZoneDetail />} />
        <Route path="/recipes" element={<CropRecipes />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

