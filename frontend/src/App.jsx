import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import ScrollToTop from './components/ScrollToTop';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Landing from './pages/Landing';
import About from './pages/About';
import FAQ from './pages/FAQ';
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
import Inventory from './pages/Inventory';
import Tasks from './pages/Tasks';
import Employees from './pages/Employees';
import Labor from './pages/Labor';
import Costs from './pages/Costs';
import Profitability from './pages/Profitability';
import Notifications from './pages/Notifications';
import QualityDashboard from './pages/QualityDashboard';
import QualityInspection from './pages/QualityInspection';
import QualityStandards from './pages/QualityStandards';
import SOPDashboard from './pages/SOPDashboard';
import SOPEditor from './pages/SOPEditor';
import SOPExecution from './pages/SOPExecution';
import Devices from './pages/Devices';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import EquipmentControl from './pages/EquipmentControl';
import StageApproval from './pages/StageApproval';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />

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
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/labor" element={<Labor />} />
        <Route path="/costs" element={<Costs />} />
        <Route path="/profitability" element={<Profitability />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/quality" element={<QualityDashboard />} />
        <Route path="/quality/inspection" element={<QualityInspection />} />
        <Route path="/quality/standards" element={<QualityStandards />} />
        <Route path="/sop" element={<SOPDashboard />} />
        <Route path="/sop/editor" element={<SOPEditor />} />
        <Route path="/sop/editor/:id" element={<SOPEditor />} />
        <Route path="/sop/execute/:id" element={<SOPExecution />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/equipment" element={<EquipmentControl />} />
        <Route path="/recipe-executions/:id/approve" element={<StageApproval />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
}

export default App;

