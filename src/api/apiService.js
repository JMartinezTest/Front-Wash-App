import { API_BASE_URL } from "./config";

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

    if (!response.ok) {
      const errorText = await response.text();
      // El backend responde {"error": "..."}; se extrae el mensaje para no
      // enseñar el JSON en bruto en la interfaz.
      let mensaje = errorText;
      try {
        const cuerpo = JSON.parse(errorText);
        if (cuerpo?.error) mensaje = cuerpo.error;
      } catch {
        // No era JSON: se usa el texto tal cual.
      }
      throw new Error(mensaje || "Error en la solicitud");
    }

    return response.json();
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
