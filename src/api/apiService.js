const API_BASE_URL = "http://localhost:8081";

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
      throw new Error(errorText || "Error en la solicitud");
    }

    return response.json();
  } catch (error) {
    console.error("API Error:", error);
  }
};

export const apiService = {
  // Autenticación
  login: (credentials) =>
    fetchWithAuth("/auth/login", {
      method: "POST",
      body: new URLSearchParams(credentials),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }),

  // Empleados
  getEmployees: () => fetchWithAuth("/employees"),
  registerEmployee: (employee) =>
    fetchWithAuth("/employees/register", {
      method: "POST",
      body: JSON.stringify(employee),
    }),
  deleteEmployee: (id) =>
    fetchWithAuth(`/employees/${id}`, { method: "DELETE" }),

  // Vehículos
  getCars: () => fetchWithAuth("/cars"),
  registerCar: (car) =>
    fetchWithAuth("/cars/register", {
      method: "POST",
      body: JSON.stringify(car),
    }),
  deleteCar: (id) =>
    fetchWithAuth(`/cars/${id}`, { method: "DELETE" }),

  // Clientes
  getClients: () => fetchWithAuth("/clients"),
  registerClient: (client) =>
    fetchWithAuth("/clients/register", {
      method: "POST",
      body: JSON.stringify(client),
    }),
  deleteClient: (id) =>
    fetchWithAuth(`/clients/${id}`, { method: "DELETE" }),

  // Servicios
  getServices: () => fetchWithAuth("/services"),
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
  registerWashed: (record) => {
    console.log("record::: ", JSON.parse(JSON.stringify(record)));
    fetchWithAuth("/washed/register", {
      method: "POST",
      body: JSON.stringify({
        client: record.clientId,
        employee: record.employeeId,
        car: record.carId,
        serviceOffered: record.serviceIds,
        total: record.total,
      }),
    });
  },
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

  // En apiService.js, agregar estos métodos al objeto exportado
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
  getPredictionHistory: () =>
    fetchWithAuth("/api/historial", {
      method: "GET",
    }),
};
