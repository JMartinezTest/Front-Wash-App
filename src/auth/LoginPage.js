import React, { useState, useContext } from "react";
import { API_BASE_URL } from "../api/config";
import { useNavigate, Link } from "react-router-dom";
import { FaCarSide, FaUser, FaLock } from "react-icons/fa";
import AuthContext from "./authContext";
import "./loginPage.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, sesionCaducada } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = await response.text();
        localStorage.setItem("token", token);
        login();
        navigate("/inicio");
      } else {
        const errorText = await response.text();
        setError(errorText || "Usuario o contraseña incorrectos.");
      }
    } catch (error) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="acceso">
      {/* Panel de marca: presenta el producto mientras el foco esta en el formulario */}
      <aside className="acceso__marca">
        <div className="acceso__marca-contenido">
          <span className="acceso__logo"><FaCarSide /></span>
          <h1 className="acceso__titulo">WashApp<strong>PRO</strong></h1>
          <p className="acceso__lema">
            Gestión integral para el Lavadero San Felipe: lavados, clientes,
            comisiones y predicción de demanda en un solo lugar.
          </p>
          <ul className="acceso__lista">
            <li>Registro de lavados y control de servicios</li>
            <li>Cálculo automático de comisiones</li>
            <li>Asistente con acceso a tus datos reales</li>
          </ul>
        </div>
      </aside>

      <main className="acceso__panel">
        <div className="acceso__formulario">
          <div className="acceso__encabezado">
            <h2>Iniciar sesión</h2>
            <p>Accede con tu cuenta para gestionar el lavadero.</p>
          </div>

          {sesionCaducada && !error && (
            <div className="alert alert--error">
              Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.
            </div>
          )}

          {error && <div className="alert alert--error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Usuario</label>
              <div className="campo-icono">
                <FaUser className="campo-icono__glifo" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Tu usuario"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <div className="campo-icono">
                <FaLock className="campo-icono__glifo" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  required
                />
              </div>
            </div>

            <button className="btn btn--primary btn--block acceso__boton" type="submit" disabled={isLoading}>
              {isLoading ? <span className="spinner spinner--claro" /> : "Iniciar sesión"}
            </button>
          </form>

          <p className="acceso__pie">
            ¿Problemas para entrar? <Link to="/support">Contacta con soporte</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
