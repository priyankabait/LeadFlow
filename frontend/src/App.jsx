
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MainLayout from './components/layout/MainLayout';

import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Accounts from './pages/Accounts';
import Contacts from './pages/Contacts';
import Opportunities from './pages/Opportunities';
import Analytics from './pages/Analytics';
import SalesforceIntegration from './pages/SalesforceIntegration';
import Settings from './pages/Settings';

import { SalesforceProvider } from './hooks/useSalesforce';

export default function App() {
  return (
    <SalesforceProvider>
      <Toaster
        position="top-right"
        toastOptions={{ duration: 4000 }}
      />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/salesforce-integration"
            element={<SalesforceIntegration />}
          />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </SalesforceProvider>
  );
}
