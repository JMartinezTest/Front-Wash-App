import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import AuthProvider from "./auth/authProvider";
import PublicRoutes from "./routes/publicRoutes";
import PrivateRoutes from "./routes/privateRoutes";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import NotFound from "./routes/NotFound";
import { useContext } from "react";
import AuthContext from "./auth/authContext";
import LoginPage from "./auth/LoginPage";

const AppContent = () => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="routerContainer">
      {isAuthenticated && <NavBar />}
      <div className="otherContainer">
        <Routes>
          {PublicRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {PrivateRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          <Route path="/" element={<Navigate to="/washes" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {isAuthenticated && <Footer />}
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

