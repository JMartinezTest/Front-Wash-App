import { useState } from 'react';
import AuthContext from './authContext';

const AuthProvider = ({ children }) => {
  // Se lee el token de forma sincrona en el primer render. Si se hiciera en un
  // useEffect, la primera pasada veria isAuthenticated=false y ProtectedRoute ya
  // habria redirigido: al recargar se perdia la ruta actual.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;