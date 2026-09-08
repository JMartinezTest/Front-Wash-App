import { createContext } from 'react';

const AuthContext = createContext({
  isAuthenticated: false,
  // Distingue el cierre de sesion voluntario del que impone el backend, para
  // poder explicarle al usuario por que ha vuelto a la pantalla de acceso.
  sesionCaducada: false,
  login: () => {},
  logout: () => {},
});

export default AuthContext;