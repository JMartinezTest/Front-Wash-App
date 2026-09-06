import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaCheck, FaCarSide } from "react-icons/fa";
import { apiService } from "../../api/apiService";
import SelectorBuscable from "../../components/SelectorBuscable";
import { AltaCliente, AltaVehiculo, AltaEmpleado } from "../../components/AltaRapida";
import { dinero } from "../../utils/formato";
import "./WashForm.css";

const WashForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    clientId: "",
    carId: "",
    serviceIds: [],
    employeeId: "",
    observations: "",
    total: 0,
  });

  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [cars, setCars] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  // Que ventana de alta rapida esta abierta y con que texto se abrio.
  const [alta, setAlta] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, carsData, servicesData, employeesData] = await Promise.all([
          apiService.getClients(),
          apiService.getCars(),
          apiService.getServices(),
          apiService.getEmployees(),
        ]);
        setClients(clientsData || []);
        setCars(carsData || []);
        setAvailableServices(servicesData || []);
        setEmployees(employeesData || []);

        if (id) {
          const washData = await apiService.getWashedRecord(id);
          // El backend nombra los campos client/car/employee/serviceOffered;
          // el formulario trabaja con los sufijos Id.
          const idsServicios = washData.serviceOffered || [];
          setFormData({
            date: washData.date
              ? new Date(washData.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            clientId: washData.client || "",
            carId: washData.car || "",
            employeeId: washData.employee || "",
            serviceIds: idsServicios,
            observations: washData.observations || "",
            total: washData.total || 0,
          });
          setSelectedServices((servicesData || []).filter((s) => idsServicios.includes(s.id)));
        }
      } catch (err) {
        setError(err.message || "No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // El total siempre se deriva de los servicios elegidos, nunca se escribe a mano.
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      total: selectedServices.reduce((suma, s) => suma + (s.price || 0), 0),
      serviceIds: selectedServices.map((s) => s.id),
    }));
  }, [selectedServices]);

  const clienteElegido = clients.find((c) => c.id === formData.clientId);

  // Cada vehiculo pertenece a un cliente: solo se ofrecen los suyos.
  const vehiculosDelCliente = formData.clientId
    ? cars.filter((c) => c.clientId === formData.clientId)
    : [];

  const elegirCliente = (idCliente) => {
    setFormData((prev) => ({
      ...prev,
      clientId: idCliente,
      // El vehiculo elegido puede no ser de este cliente, asi que se descarta.
      carId: cars.some((c) => c.id === prev.carId && c.clientId === idCliente) ? prev.carId : "",
    }));
  };

  const cerrarAlta = () => setAlta(null);

  const trasCrearCliente = (cliente) => {
    setClients((prev) => [...prev, cliente]);
    setFormData((prev) => ({ ...prev, clientId: cliente.id, carId: "" }));
    cerrarAlta();
  };

  const trasCrearVehiculo = (vehiculo) => {
    setCars((prev) => [...prev, vehiculo]);
    setFormData((prev) => ({ ...prev, carId: vehiculo.id }));
    cerrarAlta();
  };

  const trasCrearEmpleado = (empleado) => {
    setEmployees((prev) => [...prev, empleado]);
    setFormData((prev) => ({ ...prev, employeeId: empleado.id }));
    cerrarAlta();
  };

  const alternarServicio = (servicio) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === servicio.id)
        ? prev.filter((s) => s.id !== servicio.id)
        : [...prev, servicio]
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (formData.serviceIds.length === 0) {
      setError("Selecciona al menos un servicio.");
      return;
    }

    setGuardando(true);
    try {
      if (id) {
        await apiService.updateWashedRecord(id, formData);
        setSuccessMessage("Lavado actualizado correctamente.");
      } else {
        await apiService.registerWashed(formData);
        setSuccessMessage("Lavado registrado correctamente.");
      }
      setTimeout(() => navigate("/washes"), 1200);
    } catch (err) {
      setError(err.message || "No se pudo guardar el lavado.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-header">
          <div className="page-header__titles"><h1>{id ? "Editar lavado" : "Nuevo lavado"}</h1></div>
        </div>
        <div className="card"><div className="state"><span className="spinner" /><p className="state__text">Cargando datos…</p></div></div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>{id ? "Editar lavado" : "Nuevo lavado"}</h1>
          <p className="page-header__subtitle">
            Registra el servicio realizado, quién lo atendió y a qué vehículo.
          </p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {successMessage && <div className="alert alert--success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="wash-form">
        <div className="wash-form__principal">
          <section className="card">
            <div className="card__header"><h2>Datos del lavado</h2></div>
            <div className="card__body">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="date">Fecha</label>
                  <input id="date" type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>

                <div className="field">
                  <label htmlFor="clientId">Cliente</label>
                  <SelectorBuscable
                    id="clientId"
                    opciones={clients.map((c) => ({
                      valor: c.id,
                      etiqueta: `${c.name} ${c.lastName}`,
                      detalle: c.nit ? `NIT ${c.nit}` : undefined,
                    }))}
                    valor={formData.clientId}
                    onChange={elegirCliente}
                    placeholder="Selecciona un cliente"
                    buscarPlaceholder="Buscar por nombre o NIT…"
                    onCrear={(texto) => setAlta({ tipo: "cliente", texto })}
                    textoCrear="Crear cliente"
                    vacio="Todavía no hay clientes"
                  />
                </div>

                <div className="field">
                  <label htmlFor="carId">Vehículo</label>
                  <SelectorBuscable
                    id="carId"
                    opciones={vehiculosDelCliente.map((c) => ({
                      valor: c.id,
                      etiqueta: c.licencePlate,
                      detalle: `${c.make}${c.color ? ` ${c.color}` : ""}`,
                    }))}
                    valor={formData.carId}
                    onChange={(v) => setFormData((prev) => ({ ...prev, carId: v }))}
                    placeholder="Selecciona un vehículo"
                    buscarPlaceholder="Buscar por placa o marca…"
                    onCrear={(texto) => setAlta({ tipo: "vehiculo", texto })}
                    textoCrear="Crear vehículo"
                    vacio="Este cliente no tiene vehículos"
                    deshabilitado={!clienteElegido}
                    deshabilitadoPista="Elige primero un cliente"
                  />
                </div>

                <div className="field">
                  <label htmlFor="employeeId">Empleado</label>
                  <SelectorBuscable
                    id="employeeId"
                    opciones={employees.map((e) => ({
                      valor: e.id,
                      etiqueta: `${e.name} ${e.lastName}`,
                      detalle: e.position || undefined,
                    }))}
                    valor={formData.employeeId}
                    onChange={(v) => setFormData((prev) => ({ ...prev, employeeId: v }))}
                    placeholder="Selecciona un empleado"
                    buscarPlaceholder="Buscar empleado…"
                    onCrear={(texto) => setAlta({ tipo: "empleado", texto })}
                    textoCrear="Crear empleado"
                    vacio="Todavía no hay empleados"
                  />
                </div>

                <div className="field field--full">
                  <label htmlFor="observations">Observaciones</label>
                  <textarea
                    id="observations" name="observations" rows={2}
                    value={formData.observations} onChange={handleChange}
                    placeholder="Opcional: detalles del estado del vehículo, indicaciones del cliente…"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card__header">
              <h2>Servicios</h2>
              <p className="page-header__subtitle">Toca los servicios aplicados. El total se calcula solo.</p>
            </div>
            <div className="card__body">
              {availableServices.length === 0 ? (
                <div className="state">
                  <p className="state__title">No hay servicios definidos</p>
                  <p className="state__text">Crea al menos un servicio para poder registrar lavados.</p>
                </div>
              ) : (
                <div className="servicios-rejilla">
                  {availableServices.map((s) => {
                    const elegido = selectedServices.some((x) => x.id === s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        className={`servicio-tarjeta ${elegido ? "servicio-tarjeta--elegida" : ""}`}
                        onClick={() => alternarServicio(s)}
                        aria-pressed={elegido}
                      >
                        <span className="servicio-tarjeta__marca">{elegido && <FaCheck />}</span>
                        <span className="servicio-tarjeta__datos">
                          <span className="servicio-tarjeta__nombre">{s.name}</span>
                          {s.duration && <span className="servicio-tarjeta__meta">{s.duration}</span>}
                        </span>
                        <span className="servicio-tarjeta__precio">{dinero(s.price)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="wash-form__resumen">
          <div className="card resumen">
            <div className="card__header"><h2>Resumen</h2></div>
            <div className="card__body">
              {selectedServices.length === 0 ? (
                <p className="resumen__vacio">Todavía no has elegido servicios.</p>
              ) : (
                <ul className="resumen__lista">
                  {selectedServices.map((s) => (
                    <li key={s.id}>
                      <span>{s.name}</span>
                      <span className="resumen__precio">{dinero(s.price)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="resumen__total">
                <span>Total</span>
                <strong>{dinero(formData.total)}</strong>
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={guardando}>
                <FaCarSide /> {guardando ? "Guardando…" : id ? "Actualizar lavado" : "Registrar lavado"}
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--block"
                onClick={() => navigate("/washes")}
              >
                Cancelar
              </button>
            </div>
          </div>
        </aside>
      </form>

      {alta?.tipo === "cliente" && (
        <AltaCliente textoInicial={alta.texto} onCreado={trasCrearCliente} onCerrar={cerrarAlta} />
      )}
      {alta?.tipo === "vehiculo" && clienteElegido && (
        <AltaVehiculo
          textoInicial={alta.texto}
          cliente={clienteElegido}
          onCreado={trasCrearVehiculo}
          onCerrar={cerrarAlta}
        />
      )}
      {alta?.tipo === "empleado" && (
        <AltaEmpleado textoInicial={alta.texto} onCreado={trasCrearEmpleado} onCerrar={cerrarAlta} />
      )}
    </>
  );
};

export default WashForm;
