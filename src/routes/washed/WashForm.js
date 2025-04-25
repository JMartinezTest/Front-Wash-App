import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import Form from '../../components/Forms';  
import './WashForm.css';

const WashForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clientId: '',
    carId: '',
    serviceId: '',
    employeeId: '',
    observations: '',
    total: 0
  });
  const [clients, setClients] = useState([]);
  const [cars, setCars] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cargar datos iniciales y opciones
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, carsData, servicesData, employeesData] = await Promise.all([
          apiService.getClients(),
          apiService.getCars(),
          apiService.getServices(),
          apiService.getEmployees()
        ]);

        setClients(clientsData);
        setCars(carsData);
        setServices(servicesData);
        setEmployees(employeesData);

        if (id) {
          const washData = await apiService.getWashedRecord(id);
          setFormData(washData);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (id) {
        await apiService.updateWashedRecord(id, formData);
        setSuccessMessage('Registro de lavado actualizado correctamente');
      } else {
        await apiService.registerWashed(formData);
        setSuccessMessage('Lavado registrado correctamente');
        setFormData({
          date: new Date().toISOString().split('T')[0],
          employeeId: '',
          carId: '',
          serviceId: ''/* ,
          clientId: '',
          observations: '' */,
        });
      }
      
      setTimeout(() => navigate('/washes'), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const fields = [
    {
      name: 'date',
      label: 'Fecha',
      type: 'date',
      value: formData.date,
      onChange: handleChange,
      required: true
    },
    {
      name: 'clientId',
      label: 'Cliente',
      type: 'select',
      value: formData.clientId,
      onChange: handleChange,
      options: clients.map(client => ({
        value: client.id,
        label: `${client.name} ${client.lastName} (${client.nit})`
      })),
      required: true
    },
    {
      name: 'carId',
      label: 'Vehículo',
      type: 'select',
      value: formData.carId,
      onChange: handleChange,
      options: cars.map(car => ({
        value: car.id,
        label: `${car.brand} ${car.model} (${car.licencePlate})`
      })),
      required: true
    },
    {
      name: 'serviceId',
      label: 'Servicio',
      type: 'select',
      value: formData.serviceId,
      onChange: handleChange,
      options: services.map(service => ({
        value: service.id,
        label: `${service.name} ($${service.price})`
      })),
      required: true
    },
    {
      name: 'employeeId',
      label: 'Empleado',
      type: 'select',
      value: formData.employeeId,
      onChange: handleChange,
      options: employees.map(employee => ({
        value: employee.id,
        label: `${employee.name} ${employee.lastName}`
      })),
      required: true
    },
    {
      name: 'total',
      label: 'Total',
      type: 'number',
      value: formData.total,
      onChange: handleNumberChange,
      required: true,
      step: "0.01"
    },
    {
      name: 'observations',
      label: 'Observaciones',
      type: 'textarea',
      value: formData.observations,
      onChange: handleChange
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos del lavado...</p>
      </div>
    );
  }

  return (
    <div className="wash-form-container">
      <h2>{id ? 'Editar Registro de Lavado' : 'Registrar Nuevo Lavado'}</h2>
      
      <Form
        fields={fields}
        onSubmit={handleSubmit}
        error={error}
        successMessage={successMessage}
        submitText={id ? 'Actualizar Lavado' : 'Registrar Lavado'}
      />
    </div>
  );
};

export default WashForm;