import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../../api/apiService";
import Form from "../../components/Forms";
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
  console.log(cars)
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, carsData, servicesData, employeesData] =
          await Promise.all([
            apiService.getClients(),
            apiService.getCars(),
            apiService.getServices(),
            apiService.getEmployees(),
          ]);

        setClients(clientsData);
        setCars(carsData);
        setAvailableServices(servicesData);
        setEmployees(employeesData);

        if (id) {
          const washData = await apiService.getWashedRecord(id);
          const selected = servicesData.filter((service) =>
            washData.servicesOffered.includes(service.id)
          );
          setFormData(washData);
          setSelectedServices(selected);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Calcular total cuando cambian los servicios seleccionados
  useEffect(() => {
    const newTotal = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    const serviceIds = selectedServices.map((service) => service.id);
    setFormData((prev) => ({
      ...prev,
      total: newTotal,
      serviceIds,
    }));
  }, [selectedServices]);

  const handleAddService = (serviceId) => {
    const serviceToAdd = availableServices.find((s) => s.id === serviceId);
    if (serviceToAdd && !selectedServices.some((s) => s.id === serviceId)) {
      setSelectedServices([...selectedServices, serviceToAdd]);
    }
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (id) {
        await apiService.updateWashedRecord(id, formData);
        setSuccessMessage("Registro de lavado actualizado correctamente");
      } else {
        await apiService.registerWashed(formData);
        setSuccessMessage("Lavado registrado correctamente");
        setFormData({
          date: new Date().toISOString().split("T")[0],
          employeeId: "",
          carId: "",
          serviceIds: [],
          total: 0,
        });
        setSelectedServices([]);
      }

      setTimeout(() => navigate("/washes"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fields = [
    {
      name: "date",
      label: "Fecha",
      type: "date",
      value: formData.date,
      onChange: handleChange,
      required: true,
    },
    {
      name: "clientId",
      label: "Cliente",
      type: "select",
      value: formData.clientId,
      onChange: handleChange,
      options: clients.map((client) => ({
        value: client.id,
        label: `${client.name} ${client.lastName} (${client.nit})`,
      })),
      required: true,
    },
    {
      name: "carId",
      label: "Vehículo",
      type: "select",
      value: formData.carId,
      onChange: handleChange,
      options: cars.map((car) => ({
        value: car.id,
        label: `${car.make} ${car.color} (${car.licencePlate})`,
      })),
      required: true,
    },
    {
      name: "employeeId",
      label: "Empleado",
      type: "select",
      value: formData.employeeId,
      onChange: handleChange,
      options: employees.map((employee) => ({
        value: employee.id,
        label: `${employee.name} ${employee.lastName}`,
      })),
      required: true,
    },
    {
      name: "total",
      label: "Total",
      type: "number",
      value: formData.total.toFixed(2),
      readOnly: true,
      required: true,
    }, 
  ];

  if (loading) {
    return <div>Cargando datos del lavado...</div>;
  }

  return (
    <div className="wash-form-container">
      <h2>{id ? "Editar Registro de Lavado" : "Registrar Nuevo Lavado"}</h2>

      <div className="services-selection">
        <h3>Selección de Servicios</h3>

        <div className="available-services">
          <h4>Servicios Disponibles</h4>
          <select size="5" onChange={(e) => handleAddService(e.target.value)}>
            {availableServices
              .filter(
                (service) => !selectedServices.some((s) => s.id === service.id)
              )
              .map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price}
                </option>
              ))}
          </select>
       
        </div>

        <div className="selected-services">
          <h4>Servicios Seleccionados</h4>
          {selectedServices.length === 0 ? (
            <p>No hay servicios seleccionados</p>
          ) : (
            <ul>
              {selectedServices.map((service) => (
                <li key={service.id}>
                  {service.name} - ${service.price}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="total-section">
            <strong>Total: ${formData.total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
      <Form
        fields={fields}
        onSubmit={handleSubmit}
        error={error}
        successMessage={successMessage}
        submitText={id ? "Actualizar Lavado" : "Registrar Lavado"}
      />
    </div>
  );
};

export default WashForm;
