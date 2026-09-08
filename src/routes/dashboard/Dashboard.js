import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCarSide, FaUsers, FaCar, FaUserTie, FaMoneyBillWave, FaPlus,
} from "react-icons/fa";
import { apiService } from "../../api/apiService";
import { dinero, esHoy } from "../../utils/formato";
import { useDatosActualizados } from "../../hooks/datosDelNegocio";
import "./Dashboard.css";

const Dashboard = () => {
  const [conteos, setConteos] = useState(null);
  const [lavados, setLavados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      const [c, l, cl, em] = await Promise.all([
        apiService.getCounts(),
        apiService.getWashedRecords(),
        apiService.getClients(),
        apiService.getEmployees(),
      ]);
      setConteos(c);
      setLavados(Array.isArray(l) ? l : []);
      setClientes(Array.isArray(cl) ? cl : []);
      setEmpleados(Array.isArray(em) ? em : []);
      setError("");
    } catch (e) {
      setError(e.message || "No se pudieron cargar los datos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // El asistente puede cambiar estos datos desde su panel flotante.
  useDatosActualizados(cargar);

  const lavadosDeHoy = lavados.filter((l) => esHoy(l.date));
  const ingresosDeHoy = lavadosDeHoy.reduce((a, l) => a + (l.total || 0), 0);
  const ingresosTotales = lavados.reduce((a, l) => a + (l.total || 0), 0);

  const nombreCliente = (id) => {
    const c = clientes.find((x) => x.id === id);
    return c ? `${c.name} ${c.lastName}` : "—";
  };

  const nombreEmpleado = (id) => {
    const e = empleados.find((x) => x.id === id);
    return e ? `${e.name} ${e.lastName}` : "—";
  };

  const recientes = [...lavados]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (cargando) {
    return (
      <>
        <Cabecera />
        <div className="tarjetas-resumen">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton tarjeta-fantasma" />)}
        </div>
      </>
    );
  }

  return (
    <>
      <Cabecera />

      {error && <div className="alert alert--error">{error}</div>}

      <div className="tarjetas-resumen">
        <Tarjeta
          icono={<FaCarSide />} tono="azul"
          etiqueta="Lavados de hoy" valor={lavadosDeHoy.length}
          pie={`${lavados.length} en total`}
        />
        <Tarjeta
          icono={<FaMoneyBillWave />} tono="verde"
          etiqueta="Ingresos de hoy" valor={dinero(ingresosDeHoy)}
          pie={`${dinero(ingresosTotales)} acumulado`}
        />
        <Tarjeta
          icono={<FaUsers />} tono="violeta"
          etiqueta="Clientes" valor={conteos?.clientsCount ?? 0}
          pie={`${conteos?.carsCount ?? 0} vehículos registrados`}
        />
        <Tarjeta
          icono={<FaUserTie />} tono="ambar"
          etiqueta="Empleados" valor={conteos?.employeesCount ?? 0}
          pie="Comisión del 35%"
        />
      </div>

      <div className="card panel-recientes">
        <div className="card__header panel-recientes__cabecera">
          <h2>Últimos lavados</h2>
          <Link to="/washes" className="btn btn--secondary btn--sm">Ver historial</Link>
        </div>

        {recientes.length === 0 ? (
          <div className="state">
            <span className="state__icon"><FaCarSide /></span>
            <p className="state__title">Todavía no hay lavados</p>
            <p className="state__text">
              Cuando registres el primer lavado aparecerá aquí un resumen de la actividad.
            </p>
            <Link to="/washes/new" className="btn btn--primary"><FaPlus /> Registrar lavado</Link>
          </div>
        ) : (
          <ul className="lista-recientes">
            {recientes.map((l) => (
              <li key={l.id} className="lista-recientes__fila">
                <span className="lista-recientes__avatar"><FaCar /></span>
                <div className="lista-recientes__datos">
                  <p className="lista-recientes__cliente">{nombreCliente(l.client)}</p>
                  <p className="lista-recientes__meta">
                    {nombreEmpleado(l.employee)} · {new Date(l.date).toLocaleDateString("es-BO", {
                      day: "numeric", month: "short",
                    })}
                  </p>
                </div>
                <span className="lista-recientes__total">{dinero(l.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

const Cabecera = () => (
  <div className="page-header">
    <div className="page-header__titles">
      <h1>Panel de control</h1>
      <p className="page-header__subtitle">Resumen de la actividad del lavadero</p>
    </div>
    <div className="page-header__actions">
      <Link to="/washes/new" className="btn btn--primary"><FaPlus /> Nuevo lavado</Link>
    </div>
  </div>
);

const Tarjeta = ({ icono, tono, etiqueta, valor, pie }) => (
  <div className="tarjeta-metrica">
    <span className={`tarjeta-metrica__icono tarjeta-metrica__icono--${tono}`}>{icono}</span>
    <div className="tarjeta-metrica__cuerpo">
      <p className="tarjeta-metrica__etiqueta">{etiqueta}</p>
      <p className="tarjeta-metrica__valor">{valor}</p>
      <p className="tarjeta-metrica__pie">{pie}</p>
    </div>
  </div>
);

export default Dashboard;
