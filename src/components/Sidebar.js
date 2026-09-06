import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaCarSide, FaClipboardList, FaMoneyBillWave, FaChartLine,
  FaUsers, FaCar, FaUserTie, FaConciergeBell, FaSignOutAlt,
  FaTachometerAlt, FaBars, FaTimes, FaHistory,
} from "react-icons/fa";
import AuthContext from "../auth/authContext";
import "./Sidebar.css";

// El menu se agrupa por lo que hace el negocio, no por entidades sueltas:
// primero el dia a dia, luego los catalogos que se tocan de vez en cuando.
const SECCIONES = [
  {
    titulo: null,
    enlaces: [{ to: "/inicio", icono: <FaTachometerAlt />, texto: "Inicio" }],
  },
  {
    titulo: "Operación",
    enlaces: [
      { to: "/washes/new", icono: <FaCarSide />, texto: "Nuevo lavado" },
      { to: "/washes", icono: <FaClipboardList />, texto: "Historial", exacto: true },
      { to: "/payments", icono: <FaMoneyBillWave />, texto: "Pagos" },
    ],
  },
  {
    titulo: "Catálogo",
    enlaces: [
      { to: "/clients", icono: <FaUsers />, texto: "Clientes" },
      { to: "/cars", icono: <FaCar />, texto: "Vehículos" },
      { to: "/employees", icono: <FaUserTie />, texto: "Empleados" },
      { to: "/services", icono: <FaConciergeBell />, texto: "Servicios" },
    ],
  },
  {
    titulo: "Análisis",
    enlaces: [
      { to: "/predictions", icono: <FaChartLine />, texto: "Predicción" },
      { to: "/prediction-history", icono: <FaHistory />, texto: "Historial de predicciones" },
    ],
  },
];

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  const cerrarSesion = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Barra superior solo para movil: da acceso al menu lateral */}
      <div className="topbar-movil">
        <button
          className="topbar-movil__toggle"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
        >
          <FaBars />
        </button>
        <span className="topbar-movil__marca">WashApp<strong>PRO</strong></span>
      </div>

      {abierto && <div className="sidebar-velo" onClick={() => setAbierto(false)} />}

      <aside className={`sidebar ${abierto ? "sidebar--abierto" : ""}`}>
        <div className="sidebar__marca">
          <span className="sidebar__logo"><FaCarSide /></span>
          <span className="sidebar__nombre">WashApp<strong>PRO</strong></span>
          <button
            className="sidebar__cerrar"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar__nav">
          {SECCIONES.map((seccion, i) => (
            <div key={i} className="sidebar__grupo">
              {seccion.titulo && <p className="sidebar__grupo-titulo">{seccion.titulo}</p>}
              {seccion.enlaces.map((enlace) => (
                <NavLink
                  key={enlace.to}
                  to={enlace.to}
                  end={enlace.exacto}
                  className={({ isActive }) =>
                    `sidebar__enlace ${isActive ? "sidebar__enlace--activo" : ""}`
                  }
                  onClick={() => setAbierto(false)}
                >
                  <span className="sidebar__icono">{enlace.icono}</span>
                  {enlace.texto}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__pie">
          <div className="sidebar__usuario">
            <span className="sidebar__avatar">A</span>
            <div className="sidebar__usuario-datos">
              <p className="sidebar__usuario-nombre">admin</p>
              <p className="sidebar__usuario-rol">Administrador</p>
            </div>
          </div>
          <button className="sidebar__salir" onClick={cerrarSesion}>
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
