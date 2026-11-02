import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import HomePage from './pages/HomePage';
import IssuesPage from './pages/IssuesPage';
import MarketplacePage from './pages/MarketplacePage';
import BlogsPage from './pages/BlogsPage';
import FeaturePage from './pages/FeaturePage';
import AuthPage from './pages/AuthPage';

export default function App() {
  return <Routes>
    <Route element={<AppShell />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<FeaturePage />} />
      <Route path="/community" element={<FeaturePage />} />
      <Route path="/issues" element={<IssuesPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/business/:id" element={<MarketplacePage />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/article/:id" element={<BlogsPage />} />
      <Route path="/opportunities" element={<FeaturePage />} />
      <Route path="/accommodation" element={<FeaturePage />} />
      <Route path="/events" element={<FeaturePage />} />
      <Route path="/lost-found" element={<FeaturePage />} />
      <Route path="/academics" element={<FeaturePage />} />
      <Route path="/messages" element={<FeaturePage />} />
      <Route path="/saved" element={<FeaturePage />} />
      <Route path="/profile" element={<FeaturePage />} />
      <Route path="/settings" element={<FeaturePage />} />
      <Route path="/admin" element={<FeaturePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/signup" element={<AuthPage />} />
    <Route path="/forgot-password" element={<AuthPage />} />
    <Route path="/profile-setup" element={<AuthPage />} />
  </Routes>;
}
