import { createHashRouter } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import LoginPage from './pages/LoginPage';

export const router = createHashRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <div>PPTArts - 主界面（施工中）</div>
      </AuthGuard>
    ),
  },
]);
