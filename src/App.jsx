import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/theme.css";
import "./App.css";
import AuthProvider from "./auth/authProvider";
import PublicRoutes from "./routes/publicRoutes";
import PrivateRoutes from "./routes/privateRoutes";
import Sidebar from "./components/Sidebar";
import NotFound from "./routes/NotFound";
import Chat from "./routes/chat/Chat";
import { useContext } from "react";
import AuthContext from "./auth/authContext";

const AppContent = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className={`app-shell ${isAuthenticated ? "app-shell--autenticado" : "app-shell--publico"}`}>
      {isAuthenticated && <Sidebar />}

      <main className="app-contenido">
        <Routes>
          {PublicRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {PrivateRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          <Route path="/" element={<Navigate to="/inicio" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {isAuthenticated && <Chat />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
