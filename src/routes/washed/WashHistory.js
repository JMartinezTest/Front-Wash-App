import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import DataTable from '../../components/DataTable';

const WashHistory = () => {
  const [washes, setWashes] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cars, setCars] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAllData = async () => {
    try {
      const [
        washesData,
        servicesData,
        employeesData,
        carsData,
        clientsData
      ] = await Promise.all([
        apiService.getWashedRecords(),
        apiService.getServices(),
        apiService.getEmployees(),
        apiService.getCars(),
        apiService.getClients()
      ]);

      setWashes(washesData);
      setServices(servicesData);
      setEmployees(employeesData);
      setCars(carsData);
      setClients(clientsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const getServiceName = (serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return service ? `${service.name} ($${service.price})` : 'Servicio no encontrado';
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.name} ${employee.lastName}` : 'Empleado no encontrado';
  };

  const getCarDetails = (carId) => {
    const car = cars.find(c => c.id === carId);
    return car ? `${car.make} ${car.color} (${car.licencePlate})` : 'Vehículo no encontrado';
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.name} ${client.lastName}` : 'Cliente no encontrado';
  };

  const columns = [
    { 
      key: 'date', 
      title: 'Fecha',
      render: (wash) => new Date(wash.date).toLocaleDateString()
    },
    { 
      key: 'client', 
      title: 'Cliente',
      render: (wash) => getClientName(wash.client) 
    },
    { 
      key: 'car', 
      title: 'Vehículo',
      render: (wash) => getCarDetails(wash.car)
    },
    { 
      key: 'services', 
      title: 'Servicios',
      render: (wash) => (
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {(wash.servicesOffered || []).map(serviceId => (
            <li key={serviceId}>{getServiceName(serviceId)}</li>
          ))}
        </ul>
      )
    },
    { 
      key: 'employee', 
      title: 'Empleado',
      render: (wash) => getEmployeeName(wash.employee)
    },
    { 
      key: 'total', 
      title: 'Total', 
      render: (wash) => `$${wash.totalPrice?.toLocaleString() || 'N/A'}` 
    },
  ];

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro de lavado?')) {
      try {
        await apiService.deleteWashedRecord(id);
        fetchAllData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div>Cargando historial de lavados...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Historial de Lavados</h2>
        <button onClick={() => navigate('/washes/new')}>
          + Nuevo Lavado
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={washes} 
        emptyMessage="No hay registros de lavados"
        onDelete={handleDelete}
      />
    </div>
  );
};

export default WashHistory;
