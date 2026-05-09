import { createHashRouter } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import BrowsePage from './pages/BrowsePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ImportPage from './pages/ImportPage';
import ManagementPage from './pages/ManagementPage';

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <BrowsePage /> },
      { path: 'search', element: <SearchResultsPage /> },
      { path: 'import', element: <ImportPage /> },
      { path: 'manage', element: <ManagementPage /> },
    ],
  },
]);
