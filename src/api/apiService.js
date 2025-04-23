const API_BASE_URL = "http://localhost:8080";

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
    throw error;
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
  deleteCar: (licencePlate) =>
    fetchWithAuth(`/cars/${licencePlate}`, { method: "DELETE" }),

  // Clientes
  getClients: () => fetchWithAuth("/clients"),
  registerClient: (client) =>
    fetchWithAuth("/clients/register", {
      method: "POST",
      body: JSON.stringify(client),
    }),

  // Servicios
  getServices: () => fetchWithAuth("/services"),
  registerService: (service) =>
    fetchWithAuth("/services/register", {
      method: "POST",
      body: JSON.stringify(service),
    }),

  // Lavados
  getWashedRecords: () => fetchWithAuth("/washed-records"),
  registerWashed: (record) =>
    fetchWithAuth("/washed-records/register", {
      method: "POST",
      body: JSON.stringify(record),
    }),
  // En apiService.js, agregar estos métodos al objeto exportado
  registerPayment: (payment) =>
    fetchWithAuth("/payments/register", {
      method: "POST",
      body: JSON.stringify(payment),
    }),
  getPayments: () => fetchWithAuth("/payments"),
  getPayment: (id) => fetchWithAuth(`/payments/${id}`),
};
