import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../../api/apiService";
import Form from "../../components/Forms";
const CarForm = () => {
  const { licencePlate } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    licencePlate: "",
    make: "",
    color: "",
    clientId: "",
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(!!licencePlate);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar datos iniciales si es edición
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar clientes para el select
        const clientsData = await apiService.getClients();
        setClients(clientsData);

        // Si hay placa, cargar datos del vehículo
        if (licencePlate) {
          const carData = await apiService.getCar(licencePlate);
          setFormData(carData);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [licencePlate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (licencePlate) {
        await apiService.updateCar(licencePlate, formData);
        setSuccessMessage("Vehículo actualizado correctamente");
      } else {
        await apiService.registerCar(formData);
        setSuccessMessage("Vehículo registrado correctamente");
        setFormData({
          licencePlate: "",
          make: "",
          year: "",
          color: "",
          clientId: "",
        });
      }

      // Redirigir después de 2 segundos
      setTimeout(() => navigate("/cars"), 2000);
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
      name: "licencePlate",
      label: "Placa",
      value: formData.licencePlate,
      onChange: handleChange,
      required: true,
      hint: "Identifica al vehículo en todo el sistema.",
    },
    { name: "make", label: "Marca", value: formData.make, onChange: handleChange, required: true },
    { name: "color", label: "Color", value: formData.color, onChange: handleChange },
    {
      name: "clientId",
      label: "Cliente propietario",
      type: "select",
      value: formData.clientId,
      onChange: handleChange,
      required: true,
      full: true,
      options: clients.map((c) => ({
        value: c.id,
        label: `${c.name} ${c.lastName}${c.nit ? ` · ${c.nit}` : ""}`,
      })),
      hint: "Cada vehículo pertenece a un cliente.",
    },
  ];

  if (loading) {
    return (
      <div className="card">
        <div className="state"><span className="spinner" /><p className="state__text">Cargando…</p></div>
      </div>
    );
  }


  return (
    <Form
      title={licencePlate ? 'Editar vehículo' : 'Nuevo vehículo'}
      subtitle="La placa identifica al vehículo en todo el sistema."
      fields={fields}
      onSubmit={handleSubmit}
      error={error}
      successMessage={successMessage}
      submitText={licencePlate ? 'Guardar cambios' : 'Registrar vehículo'}
      cancelTo="/cars"
    />
  );
};

export default CarForm;
