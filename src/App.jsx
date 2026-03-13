import { Routes, Route } from 'react-router-dom';
import { AccreditationProvider } from './hooks/useAccreditation';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginScreen from './components/LoginScreen';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import Licenses from './pages/Licenses';
import EOCInspections from './pages/EOCInspections';
import LigatureRisk from './pages/LigatureRisk';
import DailyStaffing from './pages/DailyStaffing';
import Personnel from './pages/Personnel';
import Credentialing from './pages/Credentialing';
import Training from './pages/Training';
import Policies from './pages/Policies';
import Incidents from './pages/Incidents';
import Standards from './pages/Standards';
import AuditLog from './pages/AuditLog';
import RegulatoryChanges from './pages/RegulatoryChanges';
import DataBackup from './pages/DataBackup';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  // DEV ONLY: ?test=1 bypasses auth for testing — REMOVE BEFORE PRODUCTION
  const isTestMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('test') === '1';

  // Show loading spinner during MSAL initialization
  if (!isTestMode && loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading Compliance Hub...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isTestMode && !isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <AccreditationProvider>
    <Routes>
      <Route element={<Layout />}>
        {/* Dashboard — all roles */}
        <Route path="/" element={<Dashboard />} />

        {/* Protected routes — role-checked via ProtectedRoute guard */}
        <Route path="/facilities" element={<ProtectedRoute path="/facilities"><Facilities /></ProtectedRoute>} />
        <Route path="/licenses" element={<ProtectedRoute path="/licenses"><Licenses /></ProtectedRoute>} />
        <Route path="/eoc" element={<ProtectedRoute path="/eoc"><EOCInspections /></ProtectedRoute>} />
        <Route path="/ligature-risk" element={<ProtectedRoute path="/ligature-risk"><LigatureRisk /></ProtectedRoute>} />
        <Route path="/staffing" element={<ProtectedRoute path="/staffing"><DailyStaffing /></ProtectedRoute>} />
        <Route path="/personnel" element={<ProtectedRoute path="/personnel"><Personnel /></ProtectedRoute>} />
        <Route path="/credentialing" element={<ProtectedRoute path="/credentialing"><Credentialing /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute path="/training"><Training /></ProtectedRoute>} />
        <Route path="/policies" element={<ProtectedRoute path="/policies"><Policies /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute path="/incidents"><Incidents /></ProtectedRoute>} />
        <Route path="/standards" element={<ProtectedRoute path="/standards"><Standards /></ProtectedRoute>} />
        <Route path="/regulatory-changes" element={<ProtectedRoute path="/regulatory-changes"><RegulatoryChanges /></ProtectedRoute>} />
        <Route path="/audit-log" element={<ProtectedRoute path="/audit-log"><AuditLog /></ProtectedRoute>} />
        <Route path="/data-backup" element={<ProtectedRoute path="/data-backup"><DataBackup /></ProtectedRoute>} />
      </Route>
    </Routes>
    </AccreditationProvider>
  );
}
