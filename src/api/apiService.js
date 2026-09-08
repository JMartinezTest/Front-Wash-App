import { API_BASE_URL } from "./config";

/**
 * Lee el cuerpo de una respuesta sin dar por hecho que es JSON.
 *
 * No todos los endpoints responden JSON: los DELETE devuelven un mensaje en
 * texto plano ("Cliente ... eliminado.") y algunos pueden no devolver nada.
 * Hacer response.json() a ciegas hacía fallar el borrado en la interfaz aunque
 * el registro se hubiera eliminado.
 */
const leerCuerpo = async (response) => {
  const texto = await response.text();
  if (!texto) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
};

/**
 * Que hacer cuando el backend rechaza la sesion.
 *
 * apiService vive fuera de React, asi que el proveedor de autenticacion registra
 * aqui su reaccion en lugar de que esta capa sepa navegar.
 */
let alCaducarSesion = () => {};

export const registrarCaducidadDeSesion = (manejador) => {
  alCaducarSesion = manejador;
};

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const cuerpo = await leerCuerpo(response);

    if (response.status === 401 || response.status === 403) {
      // Estos dos codigos solo salen de Spring Security: significan que no hay
      // token, que caduco o que ya no identifica a nadie. Los fallos de negocio
      // llegan como 400, 404 o 500 desde ApiExceptionHandler, asi que aqui no se
      // confunde una sesion muerta con un dato invalido.
      localStorage.removeItem("token");
      alCaducarSesion();
      throw new Error("Tu sesión ha caducado. Vuelve a iniciar sesión.");
    }

    if (!response.ok) {
      // El backend responde {"error": "..."}; se extrae el mensaje para no
      // enseñar el JSON en bruto en la interfaz.
      const mensaje = typeof cuerpo === "string" ? cuerpo : cuerpo?.error;
      throw new Error(mensaje || "Error en la solicitud");
    }

    return cuerpo;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const apiService = {
  // Autenticación
  login: (credentials) =>
    fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Resumen del negocio
  getCounts: () => fetchWithAuth("/count"),

  // Clima actual del lavadero (Open-Meteo)
  getWeather: () => fetchWithAuth("/clima"),

  // Empleados
  getEmployees: () => fetchWithAuth("/employees"),
  getEmployee: (id) => fetchWithAuth(`/employees/${id}`),
  updateEmployee: (id, employee) =>
    fetchWithAuth(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(employee),
    }),
  registerEmployee: (employee) =>
    fetchWithAuth("/employees/register", {
      method: "POST",
      body: JSON.stringify(employee),
    }),
  deleteEmployee: (id) =>
    fetchWithAuth(`/employees/${id}`, { method: "DELETE" }),

  // Vehículos
  getCars: () => fetchWithAuth("/cars"),
  getCar: (identifier) => fetchWithAuth(`/cars/${identifier}`),
  updateCar: (identifier, car) =>
    fetchWithAuth(`/cars/${identifier}`, {
      method: "PUT",
      body: JSON.stringify(car),
    }),
  registerCar: (car) =>
    fetchWithAuth("/cars/register", {
      method: "POST",
      body: JSON.stringify(car),
    }),
  deleteCar: (id) =>
    fetchWithAuth(`/cars/${id}`, { method: "DELETE" }),

  // Clientes
  getClients: () => fetchWithAuth("/clients"),
  getClient: (id) => fetchWithAuth(`/clients/${id}`),
  updateClient: (id, client) =>
    fetchWithAuth(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(client),
    }),
  registerClient: (client) =>
    fetchWithAuth("/clients/register", {
      method: "POST",
      body: JSON.stringify(client),
    }),
  deleteClient: (id) =>
    fetchWithAuth(`/clients/${id}`, { method: "DELETE" }),

  // Servicios
  getServices: () => fetchWithAuth("/services"),
  getService: (id) => fetchWithAuth(`/services/${id}`),
  updateService: (id, service) =>
    fetchWithAuth(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(service),
    }),
  registerService: (service) =>
    fetchWithAuth("/services/register", {
      method: "POST",
      body: JSON.stringify(service),
    }),
  deleteService: (id) =>
    fetchWithAuth(`/services/${id}`, { method: "DELETE" }),

  // Lavados
  getWashedRecords: () => fetchWithAuth("/washed"),
  getWashedRecord: (id) => fetchWithAuth(`/washed/${id}`),
  registerWashed: (record) =>
    fetchWithAuth("/washed/register", {
      method: "POST",
      body: JSON.stringify({
        client: record.clientId,
        employee: record.employeeId,
        car: record.carId,
        serviceOffered: record.serviceIds,
        total: record.total,
      }),
    }),
  updateWashedRecord: (id, record) =>
    fetchWithAuth(`/washed/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        // La fecha solo se puede corregir al editar: al registrar la pone el backend.
        date: record.date,
        client: record.clientId,
        employee: record.employeeId,
        car: record.carId,
        serviceOffered: record.serviceIds,
        total: record.total,
      }),
    }),
  deleteWashedRecord: (id) =>
    fetchWithAuth(`/washed/${id}`, { method: "DELETE" }),

  calculateEmployeePayment: (employeeId, startDate, endDate) =>
    fetchWithAuth(
      `/washed/employee/${employeeId}/payment?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      { method: "GET" }
    ),

  // Predicciones
  predictDemand: (data) =>
    fetchWithAuth("/api/predecir", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  forecastDay: (data) =>
    fetchWithAuth("/api/prevision-dia", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPredictionHistory: () =>
    fetchWithAuth("/api/historial", { method: "GET" }),

  // Chat
  // history: [{ role: "user" | "assistant", text }] para dar contexto de la conversacion
  sendChatMessage: (message, history = []) =>
    fetchWithAuth("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    }),

  // Registros de pago
  savePaymentRecord: (record) =>
    fetchWithAuth("/payment-records/save", {
      method: "POST",
      body: JSON.stringify(record),
    }),
  getPaymentRecords: () => fetchWithAuth("/payment-records"),
  getPaymentRecordsByEmployee: (employeeId) =>
    fetchWithAuth(`/payment-records/employee/${employeeId}`),
};
