import LoginPage from '../auth/LoginPage';
import RegisterPage from '../auth/RegisterPage';

const PublicRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
];

export default PublicRoutes;