
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './hooks/useAuth';
import { SalesforceProvider } from './hooks/useSalesforce';

import MainLayout from './components/layout/MainLayout';
import Auth from './pages/Auth';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Accounts from './pages/Accounts';
import Contacts from './pages/Contacts';
import Opportunities from './pages/Opportunities';
import Analytics from './pages/Analytics';
import SalesforceIntegration from './pages/SalesforceIntegration';
import Settings from './pages/Settings';

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-brand-bg" />;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <SalesforceProvider>
      <MainLayout />
    </SalesforceProvider>
  );
}

function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<PublicRoute />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/salesforce-integration" element={<SalesforceIntegration />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
