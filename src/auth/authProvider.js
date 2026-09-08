import { useState, useEffect } from 'react';
import AuthContext from './authContext';
import { registrarCaducidadDeSesion } from '../api/apiService';

const AuthProvider = ({ children }) => {
  // Se lee el token de forma sincrona en el primer render. Si se hiciera en un
  // useEffect, la primera pasada veria isAuthenticated=false y ProtectedRoute ya
  // habria redirigido: al recargar se perdia la ruta actual.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );
  const [sesionCaducada, setSesionCaducada] = useState(false);

  // Que el token siga en el navegador no significa que el backend lo acepte: puede
  // haber caducado o dejado de identificar a nadie. Cuando la capa de API se topa
  // con ese rechazo, se cierra la sesion aqui y ProtectedRoute lleva solo al login.
  useEffect(() => {
    registrarCaducidadDeSesion(() => {
      setIsAuthenticated(false);
      setSesionCaducada(true);
    });
  }, []);

  const login = () => {
    setSesionCaducada(false);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setSesionCaducada(false);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      sesionCaducada,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
